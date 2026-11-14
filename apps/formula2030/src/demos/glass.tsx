import { Glass, GlassCaption } from "@/registry/formula/ui/formula/glass";

const Demo = () => (
  <Glass brackets>
    <dl className="demo-readings">
      <div>
        <dt>
          <GlassCaption>Range</GlassCaption>
        </dt>
        <dd>412 km</dd>
      </div>
      <div>
        <dt>
          <GlassCaption>Consumption, last 50 km</GlassCaption>
        </dt>
        <dd>17.2 kWh</dd>
      </div>
    </dl>
  </Glass>
);

export default Demo;
