import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@portfolio/ui/components/tabs";
import type * as React from "react";

const ComponentDemo = ({ children }: { children: React.ReactNode }) => (
  // oxlint-disable-next-line shadcn/no-unknown-classes -- Fumadocs' prose opt-out marker, not a utility
  <div className="not-prose" data-slot="component-demo">
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  </div>
);

const ComponentDemoRender = ({ children }: { children: React.ReactNode }) => (
  <TabsContent keepMounted value="preview">
    {children}
  </TabsContent>
);

// The MDX code fence renders Fumadocs' block; its scroll container takes the cap.
const ComponentDemoCode = ({ children }: { children: React.ReactNode }) => (
  <TabsContent value="code">
    <div
      className="**:[.fd-scroll-container]:scroll-fade-y **:[.fd-scroll-container]:max-h-72 **:[figure]:my-0"
      data-slot="component-demo-code"
    >
      {children}
    </div>
  </TabsContent>
);

export { ComponentDemo, ComponentDemoCode, ComponentDemoRender };
