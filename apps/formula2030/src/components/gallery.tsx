import { useState } from "react";

import { ItemCard } from "@/components/item-card";
import { RegisterMark } from "@/components/register-mark";
import type { Register } from "@/lib/registry";
import { REGISTERS, REGISTER_INFO, isRegister, items } from "@/lib/registry";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@/registry/formula/ui/formula/segmented-control";

type Filter = Register | "all";

const OTHER = "other";

const groups = [
  ...REGISTERS.map((register) => ({
    gloss: REGISTER_INFO[register].gloss,
    items: items.filter((item) => item.register === register),
    key: register as string,
    title: REGISTER_INFO[register].title,
  })),
  {
    gloss: "Parts that serve every register at once.",
    items: items.filter((item) => !isRegister(item.register)),
    key: OTHER,
    title: "Every register",
  },
].filter((group) => group.items.length > 0);

const plural = new Intl.PluralRules("en");

const countLabel = (count: number) =>
  `${count} ${plural.select(count) === "one" ? "component" : "components"}`;

const statusFor = (filter: Filter) => {
  if (filter === "all") {
    return `Showing all ${countLabel(items.length)}.`;
  }
  const count = items.filter((item) => item.register === filter).length;
  return `Showing ${countLabel(count)} in the ${REGISTER_INFO[filter].title} register.`;
};

const isFilter = (value: string | null): value is Filter =>
  value === "all" || (value !== null && isRegister(value));

export const Gallery = () => {
  const [filter, setFilter] = useState<Filter>("all");

  return (
    <>
      <div className="gallery-filter">
        <SegmentedControl
          aria-label="Filter by register"
          onValueChange={(next) => {
            if (isFilter(next)) {
              setFilter(next);
            }
          }}
          value={filter}
        >
          <SegmentedControlIndicator />
          <SegmentedControlItem value="all">All</SegmentedControlItem>
          {REGISTERS.map((register) => (
            <SegmentedControlItem key={register} value={register}>
              {REGISTER_INFO[register].title}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <output className="gallery-status">{statusFor(filter)}</output>
      </div>
      {groups.map((group) => (
        <section
          aria-labelledby={`group-${group.key}`}
          className="group"
          hidden={filter !== "all" && filter !== group.key}
          key={group.key}
        >
          <header className="group-head">
            <h3 className="group-title" id={`group-${group.key}`}>
              <RegisterMark register={group.key} />
              {group.title}
            </h3>
            <p className="group-gloss">{group.gloss}</p>
          </header>
          <ul className="group-cards">
            {group.items.map((item) => (
              <li key={item.name}>
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
};
