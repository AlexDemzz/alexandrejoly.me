import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@portfolio/ui/components/item";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

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
  <li data-look="row">
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
  <li data-look="row">
    <Item
      render={(props) => (
        <Link {...props} params={{ name }} to="/components/$name" />
      )}
    >
      {media}
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
    </Item>
  </li>
);
