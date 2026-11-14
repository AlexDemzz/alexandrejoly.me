import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@/registry/formula/ui/formula/segmented-control";

const Demo = () => (
  <>
    <SegmentedControl
      aria-label="Drive mode"
      defaultValue="performance"
      orientation="vertical"
    >
      <SegmentedControlIndicator />
      <SegmentedControlItem value="performance">
        Performance
      </SegmentedControlItem>
      <SegmentedControlItem value="normal">Normal</SegmentedControlItem>
      <SegmentedControlItem value="autonomous">Autonomous</SegmentedControlItem>
    </SegmentedControl>
    <SegmentedControl aria-label="Steering" defaultValue="standard">
      <SegmentedControlIndicator />
      <SegmentedControlItem value="light">Light</SegmentedControlItem>
      <SegmentedControlItem value="standard">Standard</SegmentedControlItem>
      <SegmentedControlItem value="firm">Firm</SegmentedControlItem>
      <SegmentedControlItem disabled value="track">
        Track
      </SegmentedControlItem>
    </SegmentedControl>
  </>
);

export default Demo;
