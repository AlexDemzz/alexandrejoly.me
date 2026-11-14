import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/registry/formula/ui/formula/tabs";

const Demo = () => (
  <>
    <Tabs defaultValue="trip-a">
      <TabsList aria-label="Trip computer">
        <TabsIndicator />
        <TabsTab value="trip-a">Trip A</TabsTab>
        <TabsTab value="trip-b">Trip B</TabsTab>
        <TabsTab value="charge">Since charge</TabsTab>
      </TabsList>
      <TabsPanel value="trip-a">
        186 km in 2 h 14 min, at 17.2 kWh per 100 km.
      </TabsPanel>
      <TabsPanel value="trip-b">
        1,204 km in 15 h 40 min, at 18.9 kWh per 100 km.
      </TabsPanel>
      <TabsPanel value="charge">
        312 km since the last charge, 41 kWh used.
      </TabsPanel>
    </Tabs>
    <Tabs defaultValue="home" orientation="vertical">
      <TabsList aria-label="Charging">
        <TabsIndicator />
        <TabsTab value="home">Home</TabsTab>
        <TabsTab value="public">Public</TabsTab>
        <TabsTab value="scheduled">Scheduled</TabsTab>
      </TabsList>
      <TabsPanel value="home">
        11 kW wall box. Charges to 80% by 07:00 at the off-peak rate.
      </TabsPanel>
      <TabsPanel value="public">
        Up to 250 kW. The battery warms up on the way to a planned stop.
      </TabsPanel>
      <TabsPanel value="scheduled">
        Starts at 01:00 and stops at 06:30, weekdays only.
      </TabsPanel>
    </Tabs>
  </>
);

export default Demo;
