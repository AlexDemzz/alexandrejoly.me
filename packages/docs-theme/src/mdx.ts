import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

// The MDX components every docs site renders; a site spreads its own demos
// after these.
const docsMdxComponents = {
  ...defaultMdxComponents,
  Step,
  Steps,
  Tab,
  Tabs,
} satisfies MDXComponents;

export { docsMdxComponents };
