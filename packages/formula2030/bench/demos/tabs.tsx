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
    <Tabs defaultValue="performance" orientation="vertical">
      <TabsList aria-label="Drive mode">
        <TabsIndicator />
        <TabsTab value="performance">Performance</TabsTab>
        <TabsTab value="normal">Normal</TabsTab>
        <TabsTab value="autonomous">Autonomous</TabsTab>
        <TabsTab disabled value="track">
          Track
        </TabsTab>
      </TabsList>
      <TabsPanel value="performance">
        Ride height lowered by 20 mm. Stiff suspension, firm steering and full
        power delivery.
      </TabsPanel>
      <TabsPanel value="normal">
        Standard ride height. Adaptive suspension, medium steering and balanced
        power delivery.
      </TabsPanel>
      <TabsPanel value="autonomous">
        The car steers, brakes and keeps its lane. Hands stay near the wheel.
      </TabsPanel>
      <TabsPanel value="track">
        Track mode unlocks once the tyres reach 60 °C.
      </TabsPanel>
    </Tabs>
  </>
);

export default Demo;
