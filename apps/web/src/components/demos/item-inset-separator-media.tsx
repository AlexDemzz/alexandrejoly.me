import { HashIcon } from "@phosphor-icons/react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@portfolio/ui/components/item";
import { ItemInsetSeparator } from "@registry/item-inset-separator";

export const ItemInsetSeparatorMedia = () => (
  <div className="flex max-w-sm flex-col">
    <Item>
      <ItemMedia variant="image">
        <img alt="" height={40} src="/apple-touch-icon.png" width={40} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Alexandre Joly</ItemTitle>
        <ItemDescription>Started a thread in #design</ItemDescription>
      </ItemContent>
      <ItemInsetSeparator />
    </Item>
    <Item>
      <ItemMedia variant="icon">
        <HashIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>#design</ItemTitle>
        <ItemDescription>12 new messages</ItemDescription>
      </ItemContent>
      <ItemInsetSeparator />
    </Item>
    <Item>
      <ItemContent>
        <ItemTitle>Weekly digest</ItemTitle>
        <ItemDescription>Sent every Monday at 9:00</ItemDescription>
      </ItemContent>
    </Item>
  </div>
);
