import { SelectionIcon } from "@phosphor-icons/react";
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
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";

import { CodeBlock } from "@/components/docs/code-block";
import type { Inspector } from "@/components/docs/registry-docs";
import type { HighlightedCode } from "@/lib/component-code";

interface PreviewToggleProps {
  /** The icon, decorative: the label names the toggle. */
  children: ReactNode;
  label: string;
  onPressedChange: (pressed: boolean) => void;
  pressed: boolean;
}

/** A docs-only toggle in the preview's top corner: a ghost icon button, secondary while pressed. */
export const PreviewToggle = ({
  children,
  label,
  onPressedChange,
  pressed,
}: PreviewToggleProps) => (
  <Tooltip>
    <TooltipTrigger
      delay={0}
      render={
        <Button
          aria-label={label}
          aria-pressed={pressed}
          onClick={() => onPressedChange(!pressed)}
          size="icon"
          variant={pressed ? "secondary" : "ghost"}
        />
      }
    >
      {children}
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

interface ComponentPreviewProps {
  /** Docs-only controls drawn over the demo, outside its code: a sound toggle, for one. */
  Chrome?: ComponentType;
  children: ReactNode;
  /** Highlighted source of the demo rendered in `children`. */
  code: HighlightedCode | undefined;
  inspector?: Inspector;
}

export const ComponentPreview = ({
  Chrome,
  children,
  code,
  inspector,
}: ComponentPreviewProps) => {
  const [inspecting, setInspecting] = useState(false);
  const hasChrome = Boolean(Chrome ?? inspector);

  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <Preview
          className={hasChrome ? "relative" : undefined}
          data-inspect={inspecting ? inspector?.name : undefined}
        >
          <div className="contents" data-slot="component-preview-demo">
            {children}
          </div>
          {hasChrome && (
            <div className="absolute end-3 top-3 flex gap-1">
              {Chrome && <Chrome />}
              {inspector && (
                <PreviewToggle
                  label={inspector.label}
                  onPressedChange={setInspecting}
                  pressed={inspecting}
                >
                  <SelectionIcon aria-hidden />
                </PreviewToggle>
              )}
            </div>
          )}
        </Preview>
      </TabsContent>
      <TabsContent value="code">
        {code && <CodeBlock code={code} scrollable />}
      </TabsContent>
    </Tabs>
  );
};
