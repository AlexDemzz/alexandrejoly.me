import type { ComponentProps } from "react";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/registry/formula/ui/formula/accordion";

// The card title is an h4, so the band headings sit one level below it.
const BandHeading = ({ children, ...props }: ComponentProps<"h5">) => (
  <h5 {...props}>{children}</h5>
);

const SECTIONS = [
  {
    body: "Front 2.4 bar, rear 2.6 bar. Checked 12 km ago, all four within range.",
    title: "Tyre pressures",
    value: "tyres",
  },
  {
    body: "78% charged, 412 km of range. Preconditioning starts 20 minutes before a planned fast charge.",
    title: "Battery",
    value: "battery",
  },
  {
    body: "Next service in 8,400 km or 5 months. Brake fluid is due at the same visit.",
    title: "Service",
    value: "service",
  },
  {
    body: "Version 30.4.1 is installed. The car checks for updates on Wi-Fi each night.",
    title: "Software",
    value: "software",
  },
];

const Demo = () => (
  <Accordion defaultValue={["tyres"]}>
    {SECTIONS.map((section) => (
      <AccordionItem key={section.value} value={section.value}>
        <AccordionHeader render={<BandHeading />}>
          <AccordionTrigger>{section.title}</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>{section.body}</AccordionPanel>
      </AccordionItem>
    ))}
    <AccordionItem disabled value="towing">
      <AccordionHeader render={<BandHeading />}>
        <AccordionTrigger>Towing</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>No tow bar is fitted to this car.</AccordionPanel>
    </AccordionItem>
  </Accordion>
);

export default Demo;
