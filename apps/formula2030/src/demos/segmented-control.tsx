import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@/registry/formula/ui/formula/segmented-control";

const Demo = () => (
  <>
    <SegmentedControl
      aria-label="Suspension"
      defaultValue="stiff"
      orientation="vertical"
    >
      <SegmentedControlIndicator />
      <SegmentedControlItem value="stiff">Stiff</SegmentedControlItem>
      <SegmentedControlItem value="adaptive">Adaptive</SegmentedControlItem>
      <SegmentedControlItem value="comfort">Comfort</SegmentedControlItem>
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
