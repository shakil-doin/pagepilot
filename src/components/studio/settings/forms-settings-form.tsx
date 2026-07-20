"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettingForm } from "@/components/studio/settings/use-setting-form";
import SettingsFormCard from "@/components/studio/settings/settings-form-card";

type FormSettings = {
  notifyEmail: string;
  webhookUrl: string;
};

const DEFAULTS: FormSettings = { notifyEmail: "", webhookUrl: "" };

const FormsSettingsForm = () => {
  const { values, setFields, dirty, isLoading, saving, save } = useSettingForm<FormSettings>("forms", DEFAULTS);

  return (
    <SettingsFormCard
      title="Forms"
      description="Where form submissions from the public site are delivered."
      isLoading={isLoading}
      dirty={dirty}
      saving={saving}
      onSave={save}
    >
      <div className="space-y-2">
        <Label htmlFor="notify-email">Notification email</Label>
        <Input
          id="notify-email"
          type="email"
          placeholder="forms@example.com"
          value={values.notifyEmail}
          onChange={(e) => setFields({ notifyEmail: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="webhook-url">Webhook URL</Label>
        <Input
          id="webhook-url"
          placeholder="https://hooks.example.com/forms"
          value={values.webhookUrl}
          onChange={(e) => setFields({ webhookUrl: e.target.value })}
        />
        <p className="text-xs text-muted">Each submission is POSTed to this URL as JSON.</p>
      </div>
    </SettingsFormCard>
  );
};

export default FormsSettingsForm;
