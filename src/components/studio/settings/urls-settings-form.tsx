"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingForm } from "@/components/studio/settings/use-setting-form";
import SettingsFormCard from "@/components/studio/settings/settings-form-card";

type UrlSettings = {
  canonicalBaseUrl: string;
  wwwPolicy: "keep" | "add-www";
  trailingSlash: "never" | "always";
};

const DEFAULTS: UrlSettings = {
  canonicalBaseUrl: "",
  wwwPolicy: "keep",
  trailingSlash: "never",
};

const UrlsSettingsForm = () => {
  const { values, setFields, dirty, isLoading, saving, save } = useSettingForm<UrlSettings>("site.urls", DEFAULTS);

  return (
    <SettingsFormCard
      title="URLs"
      description="Canonical URL preferences used for SEO metadata."
      isLoading={isLoading}
      dirty={dirty}
      saving={saving}
      onSave={save}
    >
      <div className="space-y-1.5">
        <Label htmlFor="canonical-base">Canonical base URL</Label>
        <Input
          id="canonical-base"
          placeholder="https://example.com"
          value={values.canonicalBaseUrl}
          onChange={(e) => setFields({ canonicalBaseUrl: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>WWW policy</Label>
          <Select
            value={values.wwwPolicy}
            onValueChange={(value) => setFields({ wwwPolicy: value as UrlSettings["wwwPolicy"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keep">Keep host as entered</SelectItem>
              <SelectItem value="add-www">Prefer www</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted">Informational only; configure redirects at your host or CDN.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Trailing slash</Label>
          <Select
            value={values.trailingSlash}
            onValueChange={(value) => setFields({ trailingSlash: value as UrlSettings["trailingSlash"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="always">Always</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SettingsFormCard>
  );
};

export default UrlsSettingsForm;
