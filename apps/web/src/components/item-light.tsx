import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";

// The home row, without the stock shadcn Item. Item and ItemInsetSeparator
// print about 2.5 KB of utility classes per row; across the home's 17 rows that
// is most of the page and drops its text-to-HTML ratio under the 5% that
// agent-readiness audits ask for. These parts print only `data-slot` hooks and
// draw the same row, inset rule included, from `index.css`.

const ItemLight = ({ render, ...props }: useRender.ComponentProps<"div">) =>
  useRender({
    defaultTagName: "div",
    // `group/item` drives the logos' hover and focus animations.
    props: mergeProps<"div">({ className: "group/item" }, props),
    render,
    state: { slot: "item-light" },
  });

const ItemLightMedia = (props: ComponentProps<"div">) => (
  <div data-slot="item-light-media" {...props} />
);

const ItemLightContent = (props: ComponentProps<"div">) => (
  <div data-slot="item-light-content" {...props} />
);

const ItemLightTitle = (props: ComponentProps<"div">) => (
  <div data-slot="item-light-title" {...props} />
);

const ItemLightDescription = (props: ComponentProps<"p">) => (
  <p data-slot="item-light-description" {...props} />
);

const ItemLightActions = (props: ComponentProps<"div">) => (
  <div data-slot="item-light-actions" {...props} />
);

export {
  ItemLight,
  ItemLightActions,
  ItemLightContent,
  ItemLightDescription,
  ItemLightMedia,
  ItemLightTitle,
};
