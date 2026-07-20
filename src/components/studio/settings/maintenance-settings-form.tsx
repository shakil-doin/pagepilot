"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSettingForm } from "@/components/studio/settings/use-setting-form";
import SettingsFormCard from "@/components/studio/settings/settings-form-card";

type MaintenanceSettings = {
  enabled: boolean;
  message: string;
};

const DEFAULTS: MaintenanceSettings = {
  enabled: false,
  message: "",
};

const MaintenanceSettingsForm = () => {
  const { values, setFields, dirty, isLoading, saving, save } = useSettingForm<MaintenanceSettings>(
    "maintenance",
    DEFAULTS,
  );

  return (
    <SettingsFormCard
      title="Maintenance mode"
      description="Show a maintenance message to visitors instead of the site."
      isLoading={isLoading}
      dirty={dirty}
      saving={saving}
      onSave={save}
    >
      {values.enabled ? (
        <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          Maintenance mode is on. Visitors see the message below instead of your site.
        </p>
      ) : null}
      <div className="flex items-center justify-between rounded-lg border border-hairline px-3 py-2.5">
        <div>
          <Label htmlFor="maintenance-enabled">Enable maintenance mode</Label>
          <p className="text-xs text-muted">The Studio stays accessible while enabled.</p>
        </div>
        <Switch
          id="maintenance-enabled"
          checked={values.enabled}
          onCheckedChange={(checked) => setFields({ enabled: checked })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="maintenance-message">Message</Label>
        <Textarea
          id="maintenance-message"
          rows={4}
          placeholder="We are making some improvements. Back shortly."
          value={values.message}
          onChange={(e) => setFields({ message: e.target.value })}
        />
      </div>
    </SettingsFormCard>
  );
};

export default MaintenanceSettingsForm;
