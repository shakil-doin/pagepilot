import "server-only";
import crypto from "node:crypto";
import path from "node:path";
import { writeFile, mkdir, unlink, readFile } from "node:fs/promises";
import { APP } from "@/config/app.config";

// One interface, two backends: ImageKit when configured, local disk under
// public/uploads otherwise (development only). No SDK: ImageKit's upload and
// file APIs are plain HTTP.
//
// For ImageKit, Media.storageKey stores the ImageKit fileId so a permanent
// delete here also deletes the asset from ImageKit.

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_FILES_API = "https://api.imagekit.io/v1/files";

export const makeStorageKey = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const safe = path.basename(filename, ext).replace(/[^a-z0-9-]/gi, "-").slice(0, 60);
  const now = new Date();
  return `media/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${safe}-${crypto.randomUUID().slice(0, 8)}${ext}`;
};

// Auth params for a direct browser upload to ImageKit: the client sends these
// with the multipart request; the private key never leaves the server.
const imagekitAuthParams = () => {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = crypto
    .createHmac("sha1", APP.storage.imagekitPrivateKey)
    .update(token + expire)
    .digest("hex");
  return { token, expire, signature, publicKey: APP.storage.imagekitPublicKey };
};

export type PresignResult =
  | {
      mode: "imagekit";
      uploadUrl: string;
      storageKey: string; // provisional; replaced by the ImageKit fileId at commit
      fields: { token: string; expire: number; signature: string; publicKey: string; folder: string; fileName: string };
    }
  | { mode: "local"; uploadUrl: string; storageKey: string };

export const presignUpload = async (storageKey: string, _contentType: string): Promise<PresignResult> => {
  if (!APP.storage.isConfigured) {
    // Local-disk storage needs a writable filesystem — unavailable on Vercel
    // and most serverless hosts. Fail with a clear message instead of a cryptic
    // read-only-filesystem error when the ImageKit env vars are missing there.
    if (process.env.VERCEL) {
      throw new Error(
        "Media storage isn't configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT — local disk uploads aren't available on Vercel.",
      );
    }
    return { mode: "local", uploadUrl: "/api/studio/media/upload-local", storageKey };
  }
  return {
    mode: "imagekit",
    uploadUrl: IMAGEKIT_UPLOAD_URL,
    storageKey,
    fields: {
      ...imagekitAuthParams(),
      folder: APP.storage.imagekitFolder,
      // Unique name derived from the storage key keeps ImageKit tidy
      fileName: path.basename(storageKey),
    },
  };
};

export const publicUrl = (storageKey: string): string => `/uploads/${storageKey}`;

export const storeLocal = async (storageKey: string, data: Buffer) => {
  const target = path.join(process.cwd(), "public", "uploads", storageKey);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);
};

export const readRemote = async (url: string): Promise<Buffer> => {
  if (url.startsWith("/uploads/")) {
    return readFile(path.join(process.cwd(), "public", url));
  }
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
};

const imagekitAuthHeader = () =>
  `Basic ${Buffer.from(`${APP.storage.imagekitPrivateKey}:`).toString("base64")}`;

// Server-authoritative lookup after a direct browser upload: the commit
// endpoint trusts these details, never the client-supplied ones.
export const getImagekitFile = async (
  fileId: string,
): Promise<{ url: string; width?: number; height?: number; sizeBytes?: number; name?: string } | null> => {
  if (!APP.storage.isConfigured) return null;
  const res = await fetch(`${IMAGEKIT_FILES_API}/${encodeURIComponent(fileId)}/details`, {
    headers: { Authorization: imagekitAuthHeader() },
  });
  if (!res.ok) return null;
  const file = (await res.json()) as { url?: string; width?: number; height?: number; size?: number; name?: string };
  if (!file.url) return null;
  return { url: file.url, width: file.width, height: file.height, sizeBytes: file.size, name: file.name };
};

// Permanent media deletes propagate here: local files are unlinked, ImageKit
// assets are deleted through the file API by fileId. THROWS on a genuine
// ImageKit failure so the caller (purgeMedia) can keep that item in the trash
// and retry, rather than dropping the DB row and orphaning the asset.
export const deleteObject = async (storageKey: string) => {
  // Local keys look like "media/2026/07/name-abc123.png"; ImageKit fileIds do not
  if (storageKey.startsWith("media/")) {
    await unlink(path.join(process.cwd(), "public", "uploads", storageKey)).catch(() => undefined);
    return;
  }
  if (!APP.storage.isConfigured) {
    // Can't reach ImageKit to delete; warn loudly but let the DB row go so the
    // item doesn't get stuck undeletable in the trash.
    console.warn(`[storage] ImageKit not configured; cannot delete ${storageKey} from ImageKit`);
    return;
  }
  const res = await fetch(`${IMAGEKIT_FILES_API}/${encodeURIComponent(storageKey)}`, {
    method: "DELETE",
    headers: { Authorization: imagekitAuthHeader() },
  });
  // 404 means already gone in ImageKit → treat as success. Any other non-OK is
  // a real failure (auth, network, 5xx): throw so purgeMedia can skip/retry it.
  if (!res.ok && res.status !== 404) {
    throw new Error(`ImageKit delete failed for ${storageKey}: ${res.status} ${await res.text()}`);
  }
};
