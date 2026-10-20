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
      <div className="flex min-h-60 items-center justify-center overflow-clip rounded-xl border p-6 sm:p-10">
        {children}
      </div>
    </TabsContent>
    <TabsContent value="code">
      <CodeBlock html={code} />
    </TabsContent>
  </Tabs>
);
