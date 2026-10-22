import { Button } from "@portfolio/ui/components/button";
import { Preview } from "@portfolio/ui/components/preview";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@portfolio/ui/components/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@portfolio/ui/components/tooltip";
import { SquareDashedIcon } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { CodeBlock } from "@/components/docs/code-block";
import type { Inspector } from "@/components/docs/registry-docs";
import type { HighlightedCode } from "@/lib/component-code";

interface InspectorToggleProps {
  inspector: Inspector;
  onPressedChange: (pressed: boolean) => void;
  pressed: boolean;
}

const InspectorToggle = ({
  inspector,
  onPressedChange,
  pressed,
}: InspectorToggleProps) => (
  <Tooltip>
    <TooltipTrigger
      delay={0}
      render={
        <Button
          aria-label={inspector.label}
          aria-pressed={pressed}
          className="absolute top-3 right-3"
          onClick={() => onPressedChange(!pressed)}
          size="icon"
          variant={pressed ? "secondary" : "ghost"}
        />
      }
    >
      <SquareDashedIcon aria-hidden />
    </TooltipTrigger>
    <TooltipContent>{inspector.label}</TooltipContent>
  </Tooltip>
);

interface ComponentPreviewProps {
  children: ReactNode;
  /** Highlighted source of the demo rendered in `children`. */
  code: HighlightedCode | undefined;
  inspector?: Inspector;
}

export const ComponentPreview = ({
  children,
  code,
  inspector,
}: ComponentPreviewProps) => {
  const [inspecting, setInspecting] = useState(false);

  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <Preview
          className={inspector && "relative"}
          data-inspect={inspecting ? inspector?.name : undefined}
        >
          {children}
          {inspector && (
            <InspectorToggle
              inspector={inspector}
              onPressedChange={setInspecting}
              pressed={inspecting}
            />
          )}
        </Preview>
      </TabsContent>
      <TabsContent value="code">
        {code && <CodeBlock code={code} scrollable />}
      </TabsContent>
    </Tabs>
  );
};
