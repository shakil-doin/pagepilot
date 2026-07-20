"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GeneralSettings } from "@/modules/settings/settings.service";
import { useSettingForm } from "@/components/studio/settings/use-setting-form";
import SettingsFormCard from "@/components/studio/settings/settings-form-card";

const DEFAULTS: GeneralSettings = {
  siteName: "",
  tagline: "",
  logoUrl: "",
  faviconUrl: "",
  language: "en",
  timezone: "UTC",
};

const GeneralSettingsForm = () => {
  const { values, setFields, dirty, isLoading, saving, save } = useSettingForm<GeneralSettings>(
    "site.general",
    DEFAULTS,
  );

  return (
    <SettingsFormCard
      title="General"
      description="Site identity shown across the public site and the Studio."
      isLoading={isLoading}
      dirty={dirty}
      saving={saving}
      onSave={save}
    >
      <div className="space-y-1.5">
        <Label htmlFor="site-name">Site name</Label>
        <Input
          id="site-name"
          placeholder="PagePilot Site"
          value={values.siteName}
          onChange={(e) => setFields({ siteName: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="site-tagline">Tagline</Label>
        <Input
          id="site-tagline"
          placeholder="Publish beautiful pages fast"
          value={values.tagline ?? ""}
          onChange={(e) => setFields({ tagline: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="site-logo">Logo URL</Label>
          <Input
            id="site-logo"
            placeholder="https://cdn.example.com/logo.svg"
            value={values.logoUrl ?? ""}
            onChange={(e) => setFields({ logoUrl: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="site-favicon">Favicon URL</Label>
          <Input
            id="site-favicon"
            placeholder="https://cdn.example.com/favicon.ico"
            value={values.faviconUrl ?? ""}
            onChange={(e) => setFields({ faviconUrl: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="site-language">Language</Label>
          <Input
            id="site-language"
            placeholder="en"
            value={values.language}
            onChange={(e) => setFields({ language: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="site-timezone">Timezone</Label>
          <Input
            id="site-timezone"
            placeholder="America/New_York"
            value={values.timezone}
            onChange={(e) => setFields({ timezone: e.target.value })}
          />
        </div>
      </div>
    </SettingsFormCard>
  );
};

export default GeneralSettingsForm;
