"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettingsForm from "@/components/studio/settings/general-settings-form";
import UrlsSettingsForm from "@/components/studio/settings/urls-settings-form";
import ScriptsSettingsForm from "@/components/studio/settings/scripts-settings-form";
import FormsSettingsForm from "@/components/studio/settings/forms-settings-form";
import StorageSettingsForm from "@/components/studio/settings/storage-settings-form";
import EmailSettingsForm from "@/components/studio/settings/email-settings-form";
import MaintenanceSettingsForm from "@/components/studio/settings/maintenance-settings-form";
import DangerZone from "@/components/studio/settings/danger-zone";

const TABS = [
  { value: "general", label: "General", content: <GeneralSettingsForm /> },
  { value: "urls", label: "URLs", content: <UrlsSettingsForm /> },
  { value: "scripts", label: "Scripts", content: <ScriptsSettingsForm /> },
  { value: "forms", label: "Forms", content: <FormsSettingsForm /> },
  { value: "storage", label: "Storage", content: <StorageSettingsForm /> },
  { value: "email", label: "Email", content: <EmailSettingsForm /> },
  { value: "maintenance", label: "Maintenance", content: <MaintenanceSettingsForm /> },
  { value: "danger", label: "Danger zone", content: <DangerZone /> },
];

const SettingsScreen = () => (
  <div className="mx-auto max-w-3xl p-6">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-ink">Settings</h2>
      <p className="text-sm text-muted">Site-wide configuration. Each tab saves independently.</p>
    </div>
    <Tabs defaultValue="general">
      <TabsList className="flex-wrap">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  </div>
);

export default SettingsScreen;
