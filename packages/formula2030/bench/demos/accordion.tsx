import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/registry/formula/ui/formula/accordion";

const Demo = () => (
  <Accordion defaultValue={["tyres"]}>
    <AccordionItem value="tyres">
      <AccordionHeader>
        <AccordionTrigger>Tyre pressures</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>
        Front 2.4 bar, rear 2.6 bar. Checked 12 km ago, all four within range.
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem value="battery">
      <AccordionHeader>
        <AccordionTrigger>Battery</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>
        78% charged, 412 km of range. Preconditioning starts 20 minutes before a
        planned fast charge.
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem value="service">
      <AccordionHeader>
        <AccordionTrigger>Service</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>
        Next service in 8,400 km or 5 months. Brake fluid is due at the same
        visit.
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem value="software">
      <AccordionHeader>
        <AccordionTrigger>Software</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>
        Version 30.4.1 is installed. The car checks for updates on Wi-Fi each
        night.
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem disabled value="towing">
      <AccordionHeader>
        <AccordionTrigger>Towing</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>No tow bar is fitted to this car.</AccordionPanel>
    </AccordionItem>
  </Accordion>
);

export default Demo;
