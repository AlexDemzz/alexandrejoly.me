import { docsMdxComponents } from "@portfolio/docs-theme/mdx";
import type { MDXComponents } from "mdx/types";

import ConfirmExemple from "./modals/confirm-exemple";
import LazyExemple from "./modals/lazy-exemple";
import NestedExample from "./modals/nested-exemple";
import { OpenExample } from "./modals/open-exemple";
import PreventCloseExemple from "./modals/prevent-close-exemple";
import RegistryModalExample from "./modals/registry-modal-example";
import RegistryNestedExample from "./modals/registry-nested-example";
import { SimpleExample } from "./modals/simple-example";
import { StackExample } from "./modals/stack-exemple";
import TransitionExemple from "./modals/transition-exemple";

export const getMDXComponents = (components?: MDXComponents) =>
  ({
    ...docsMdxComponents,
    SimpleExample,
    StackExample,
    OpenExample,
    ConfirmExemple,
    TransitionExemple,
    LazyExemple,
    PreventCloseExemple,
    NestedExample,
    RegistryModalExample,
    RegistryNestedExample,
    ...components,
  }) satisfies MDXComponents;

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
