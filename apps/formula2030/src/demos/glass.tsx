import {
  Glass,
  GlassCaption,
  GlassBrackets,
} from "@/registry/formula/ui/formula/glass";

const Demo = () => (
  <Glass>
    <GlassBrackets />
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-5">
      <div>
        <dt>
          <GlassCaption>Range</GlassCaption>
        </dt>
        <dd className="mt-1 text-4xl leading-none font-light tracking-tight tabular-nums">
          412 km
        </dd>
      </div>
      <div>
        <dt>
          <GlassCaption>Consumption, last 50 km</GlassCaption>
        </dt>
        <dd className="mt-1 text-4xl leading-none font-light tracking-tight tabular-nums">
          17.2 kWh
        </dd>
      </div>
    </dl>
  </Glass>
);

export default Demo;
