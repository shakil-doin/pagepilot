import { api } from "@/services/api";

export type MediaRow = {
  id: string;
  kind: "IMAGE" | "VIDEO" | "FILE";
  storageKey: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  focalX: number | null;
  focalY: number | null;
  blurDataUrl: string | null;
  folderId: string | null;
  deletedAt: string | null;
  createdAt: string;
};

type PresignResponse =
  | {
      mode: "imagekit";
      uploadUrl: string;
      storageKey: string;
      fields: { token: string; expire: number; signature: string; publicKey: string; folder: string; fileName: string };
    }
  | { mode: "local"; uploadUrl: string; storageKey: string };

// Full upload pipeline: presign, upload (direct to ImageKit, or the local
// dev fallback route), then commit. For ImageKit the commit key is the
// fileId from the upload response so deletes can propagate to ImageKit.
export const uploadFile = async (file: File, folderId?: string | null): Promise<MediaRow> => {
  const presign = await api.post<PresignResponse>("/api/studio/media/presign", {
    filename: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  });

  let storageKey = presign.storageKey;

  if (presign.mode === "imagekit") {
    const form = new FormData();
    form.append("file", file);
    form.append("fileName", presign.fields.fileName);
    form.append("folder", presign.fields.folder);
    form.append("token", presign.fields.token);
    form.append("expire", String(presign.fields.expire));
    form.append("signature", presign.fields.signature);
    form.append("publicKey", presign.fields.publicKey);
    form.append("useUniqueFileName", "true");
    const res = await fetch(presign.uploadUrl, { method: "POST", body: form });
    const body = (await res.json().catch(() => null)) as { fileId?: string; message?: string } | null;
    if (!res.ok || !body?.fileId) {
      throw new Error(body?.message ?? `Upload to ImageKit failed (${res.status})`);
    }
    storageKey = body.fileId;
  } else {
    const form = new FormData();
    form.append("file", file);
    form.append("storageKey", presign.storageKey);
    const res = await fetch(presign.uploadUrl, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  }

  return api.post<MediaRow>("/api/studio/media/commit", {
    storageKey,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    folderId: folderId ?? undefined,
  });
};

// Snapshot stored inside widget props (see widgets/lib.ts mediaRef).
export const toMediaRef = (media: MediaRow) => ({
  id: media.id,
  kind: media.kind,
  url: media.url,
  alt: media.alt ?? undefined,
  width: media.width ?? undefined,
  height: media.height ?? undefined,
  blurDataUrl: media.blurDataUrl ?? undefined,
  focalX: media.focalX ?? undefined,
  focalY: media.focalY ?? undefined,
});
