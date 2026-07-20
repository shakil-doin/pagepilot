"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InstalledSets from "@/components/studio/icons/installed-sets";
import CatalogBrowser from "@/components/studio/icons/catalog-browser";
import IconBrowser from "@/components/studio/icons/icon-browser";

const IconsScreen = () => (
  <div className="mx-auto max-w-5xl p-6">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-ink">Icons</h2>
      <p className="text-sm text-muted">Install Iconify sets and browse the icons available to your pages.</p>
    </div>
    <Tabs defaultValue="installed">
      <TabsList>
        <TabsTrigger value="installed">Installed sets</TabsTrigger>
        <TabsTrigger value="catalog">Browse catalog</TabsTrigger>
        <TabsTrigger value="browser">Icon browser</TabsTrigger>
      </TabsList>
      <TabsContent value="installed">
        <InstalledSets />
      </TabsContent>
      <TabsContent value="catalog">
        <CatalogBrowser />
      </TabsContent>
      <TabsContent value="browser">
        <IconBrowser />
      </TabsContent>
    </Tabs>
  </div>
);

export default IconsScreen;
