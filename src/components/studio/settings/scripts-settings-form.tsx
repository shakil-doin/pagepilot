"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettingForm } from "@/components/studio/settings/use-setting-form";
import SettingsFormCard from "@/components/studio/settings/settings-form-card";

type ScriptSettings = {
  ga4Id: string;
  gtmId: string;
  head: string;
  bodyStart: string;
  bodyEnd: string;
};

const DEFAULTS: ScriptSettings = {
  ga4Id: "",
  gtmId: "",
  head: "",
  bodyStart: "",
  bodyEnd: "",
};

const SCRIPT_AREAS = [
  { key: "head", label: "Head scripts", hint: "Injected before </head>" },
  { key: "bodyStart", label: "Body start scripts", hint: "Injected after <body>" },
  { key: "bodyEnd", label: "Body end scripts", hint: "Injected before </body>" },
] as const;

const ScriptsSettingsForm = () => {
  const { values, setFields, dirty, isLoading, saving, save } = useSettingForm<ScriptSettings>("scripts", DEFAULTS);

  return (
    <SettingsFormCard
      title="Scripts"
      description="Analytics IDs and raw script injection for the public site."
      isLoading={isLoading}
      dirty={dirty}
      saving={saving}
      onSave={save}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ga4-id">GA4 measurement ID</Label>
          <Input
            id="ga4-id"
            placeholder="G-XXXXXXXXXX"
            value={values.ga4Id}
            onChange={(e) => setFields({ ga4Id: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gtm-id">GTM container ID</Label>
          <Input
            id="gtm-id"
            placeholder="GTM-XXXXXXX"
            value={values.gtmId}
            onChange={(e) => setFields({ gtmId: e.target.value })}
          />
        </div>
      </div>

      <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
        Raw script fields are SUPERADMIN only and limited to 20000 characters each.
      </p>

      {SCRIPT_AREAS.map((area) => (
        <div key={area.key} className="space-y-2">
          <Label htmlFor={`scripts-${area.key}`}>{area.label}</Label>
          <Textarea
            id={`scripts-${area.key}`}
            rows={4}
            className="font-mono text-xs"
            placeholder={`<script>…</script>`}
            value={values[area.key]}
            onChange={(e) => setFields({ [area.key]: e.target.value } as Partial<ScriptSettings>)}
          />
          <p className="text-xs text-muted">{area.hint}</p>
        </div>
      ))}
    </SettingsFormCard>
  );
};

export default ScriptsSettingsForm;
