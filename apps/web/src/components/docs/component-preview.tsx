import { Preview } from "@portfolio/ui/components/preview";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@portfolio/ui/components/tabs";
import type { ReactNode } from "react";

import { CodeBlock } from "@/components/docs/code-block";

interface ComponentPreviewProps {
  children: ReactNode;
  /** Highlighted source of the demo rendered in `children`. */
  code: string;
}

export const ComponentPreview = ({ children, code }: ComponentPreviewProps) => (
  <Tabs defaultValue="preview">
    <TabsList>
      <TabsTrigger value="preview">Preview</TabsTrigger>
      <TabsTrigger value="code">Code</TabsTrigger>
    </TabsList>
    <TabsContent value="preview">
      <Preview>{children}</Preview>
    </TabsContent>
    <TabsContent value="code">
      <CodeBlock html={code} />
    </TabsContent>
  </Tabs>
);
