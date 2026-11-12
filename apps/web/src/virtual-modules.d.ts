declare module "virtual:component-code/*" {
  import type { ComponentCode } from "@/lib/component-code";

  const code: ComponentCode;
  export default code;
}

declare module "virtual:skill-code/*" {
  import type { HighlightedCode } from "@/lib/component-code";

  const code: Record<string, HighlightedCode>;
  export default code;
}
