"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SeoDefaultsForm from "@/components/studio/seo/seo-defaults-form";
import RedirectsPanel from "@/components/studio/seo/redirects-panel";

const SeoScreen = () => (
  <div className="mx-auto max-w-5xl p-6">
    <Tabs defaultValue="defaults">
      <TabsList className="mb-4">
        <TabsTrigger value="defaults">Defaults</TabsTrigger>
        <TabsTrigger value="redirects">Redirects</TabsTrigger>
      </TabsList>
      <TabsContent value="defaults">
        <SeoDefaultsForm />
      </TabsContent>
      <TabsContent value="redirects">
        <RedirectsPanel />
      </TabsContent>
    </Tabs>
  </div>
);

export default SeoScreen;
