import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@portfolio/ui/components/item";
import type { ReactNode } from "react";

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
    <Item
      // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Item renders its children into the anchor
      render={<a href={href} rel="noreferrer" target="_blank" />}
    >
      {media}
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      {aside === undefined ? null : <ItemActions>{aside}</ItemActions>}
    </Item>
  </li>
);
