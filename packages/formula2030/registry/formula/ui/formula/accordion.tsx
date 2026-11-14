"use client";

import { Accordion as SdkAccordion } from "@ui-sdk/react/accordion";
import * as React from "react";

import "@/registry/formula/ui/formula/modality";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/accordion.css";

function Accordion(props: React.ComponentProps<typeof SdkAccordion>) {
  return <SdkAccordion data-formula="strata" {...props} />;
}

export { Accordion };
export {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion";
