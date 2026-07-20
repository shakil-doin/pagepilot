"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettingForm } from "@/components/studio/settings/use-setting-form";
import SettingsFormCard from "@/components/studio/settings/settings-form-card";

type EmailSettings = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

const DEFAULTS: EmailSettings = {
  host: "",
  port: 587,
  user: "",
  pass: "",
  from: "",
};

const EmailSettingsForm = () => {
  const { values, setFields, dirty, isLoading, saving, save } = useSettingForm<EmailSettings>("email", DEFAULTS);

  return (
    <SettingsFormCard
      title="Email"
      description="SMTP server used for invites and form notifications."
      isLoading={isLoading}
      dirty={dirty}
      saving={saving}
      onSave={save}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div className="space-y-2">
          <Label htmlFor="email-host">Host</Label>
          <Input
            id="email-host"
            placeholder="smtp.example.com"
            value={values.host}
            onChange={(e) => setFields({ host: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-port">Port</Label>
          <Input
            id="email-port"
            type="number"
            placeholder="587"
            value={values.port}
            onChange={(e) => setFields({ port: Number(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email-user">User</Label>
          <Input
            id="email-user"
            autoComplete="off"
            value={values.user}
            onChange={(e) => setFields({ user: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-pass">Password</Label>
          <Input
            id="email-pass"
            type="password"
            autoComplete="off"
            value={values.pass}
            onChange={(e) => setFields({ pass: e.target.value })}
          />
          <p className="text-xs text-muted">Stored encrypted.</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-from">From address</Label>
        <Input
          id="email-from"
          placeholder="PagePilot <noreply@example.com>"
          value={values.from}
          onChange={(e) => setFields({ from: e.target.value })}
        />
      </div>
    </SettingsFormCard>
  );
};

export default EmailSettingsForm;
