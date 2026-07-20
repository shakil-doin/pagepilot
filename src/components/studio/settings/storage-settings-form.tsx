"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettingForm } from "@/components/studio/settings/use-setting-form";
import SettingsFormCard from "@/components/studio/settings/settings-form-card";

type StorageSettings = {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
  folder: string;
};

const DEFAULTS: StorageSettings = {
  publicKey: "",
  privateKey: "",
  urlEndpoint: "",
  folder: "/pagepilot",
};

const StorageSettingsForm = () => {
  const { values, setFields, dirty, isLoading, saving, save } = useSettingForm<StorageSettings>("storage", DEFAULTS);

  return (
    <SettingsFormCard
      title="Storage"
      description="ImageKit media storage. Deleting media permanently also deletes it from ImageKit."
      isLoading={isLoading}
      dirty={dirty}
      saving={saving}
      onSave={save}
    >
      <p className="rounded-lg bg-info/10 px-3 py-2 text-xs text-info">
        Environment variables (IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT) win over these
        values when both are set. Without ImageKit configured, uploads fall back to local disk (development only).
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="storage-public-key">Public key</Label>
          <Input
            id="storage-public-key"
            placeholder="public_..."
            autoComplete="off"
            value={values.publicKey}
            onChange={(e) => setFields({ publicKey: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="storage-private-key">Private key</Label>
          <Input
            id="storage-private-key"
            type="password"
            placeholder="private_..."
            autoComplete="off"
            value={values.privateKey}
            onChange={(e) => setFields({ privateKey: e.target.value })}
          />
          <p className="text-xs text-muted">Stored encrypted.</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="storage-url-endpoint">URL endpoint</Label>
        <Input
          id="storage-url-endpoint"
          placeholder="https://ik.imagekit.io/your_id"
          value={values.urlEndpoint}
          onChange={(e) => setFields({ urlEndpoint: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="storage-folder">Folder</Label>
        <Input
          id="storage-folder"
          placeholder="/pagepilot"
          value={values.folder}
          onChange={(e) => setFields({ folder: e.target.value })}
        />
        <p className="text-xs text-muted">ImageKit media library folder new uploads land in.</p>
      </div>
    </SettingsFormCard>
  );
};

export default StorageSettingsForm;
