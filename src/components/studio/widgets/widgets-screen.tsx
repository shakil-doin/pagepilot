"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WidgetLibrary from "@/components/studio/widgets/widget-library";
import GlobalWidgetsTab from "@/components/studio/widgets/global-widgets-tab";
import CustomWidgetsTab from "@/components/studio/widgets/custom-widgets-tab";

const WidgetsScreen = () => (
  <div className="mx-auto max-w-5xl p-6">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-ink">Widgets</h2>
      <p className="text-sm text-muted">Coded widgets, shared global instances, and reusable custom compositions.</p>
    </div>
    <Tabs defaultValue="library">
      <TabsList>
        <TabsTrigger value="library">Library</TabsTrigger>
        <TabsTrigger value="global">Global widgets</TabsTrigger>
        <TabsTrigger value="custom">Custom widgets</TabsTrigger>
      </TabsList>
      <TabsContent value="library">
        <WidgetLibrary />
      </TabsContent>
      <TabsContent value="global">
        <GlobalWidgetsTab />
      </TabsContent>
      <TabsContent value="custom">
        <CustomWidgetsTab />
      </TabsContent>
    </Tabs>
  </div>
);

export default WidgetsScreen;
