import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { COMPONENT_ICONS } from "@/components/component-icons";
import {
  ItemLight,
  ItemLightActions,
  ItemLightContent,
  ItemLightDescription,
  ItemLightMedia,
  ItemLightTitle,
} from "@/components/item-light";
import { REGISTRY_ITEMS } from "@/lib/registry";

export const RowList = ({ children }: { children: ReactNode }) => (
  <ul className="flex flex-col">{children}</ul>
);

interface ExternalRowProps {
  aside?: ReactNode;
  description: string;
  href: string;
  media?: ReactNode;
  title: string;
}

export const ExternalRow = ({
  aside,
  description,
  href,
  media,
  title,
}: ExternalRowProps) => (
  <li>
    <ItemLight
      // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- ItemLight renders its children into the anchor
      render={<a href={href} rel="noreferrer" target="_blank" />}
    >
      {media}
      <ItemLightContent>
        <ItemLightTitle>{title}</ItemLightTitle>
        <ItemLightDescription>{description}</ItemLightDescription>
      </ItemLightContent>
      {aside === undefined ? null : (
        <ItemLightActions>{aside}</ItemLightActions>
      )}
    </ItemLight>
  </li>
);

interface ComponentRowProps {
  description: string;
  media?: ReactNode;
  name: string;
  title: string;
}

export const ComponentRow = ({
  description,
  media,
  name,
  title,
}: ComponentRowProps) => (
  <li>
    <ItemLight
      render={(props) => (
        <Link {...props} params={{ name }} to="/components/$name" />
      )}
    >
      {media}
      <ItemLightContent>
        <ItemLightTitle>{title}</ItemLightTitle>
        <ItemLightDescription>{description}</ItemLightDescription>
      </ItemLightContent>
    </ItemLight>
  </li>
);

/** One row per registry item, linking to its docs page. */
export const ComponentRows = () => (
  <RowList>
    {REGISTRY_ITEMS.map((component) => {
      const Icon = COMPONENT_ICONS[component.name];
      return (
        <ComponentRow
          description={component.description}
          key={component.name}
          media={
            <ItemLightMedia>
              <Icon />
            </ItemLightMedia>
          }
          name={component.name}
          title={component.title}
        />
      );
    })}
  </RowList>
);
