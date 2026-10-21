import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@portfolio/ui/components/item";
import { ItemInsetSeparator } from "@registry/item-inset-separator";
import { FileTextIcon, ImageIcon, MusicIcon } from "lucide-react";

const FILES = [
  { icon: FileTextIcon, name: "Quarterly report.pdf", size: "2.4 MB" },
  { icon: ImageIcon, name: "Team offsite.jpg", size: "5.1 MB" },
  { icon: MusicIcon, name: "Launch teaser.mp3", size: "3.8 MB" },
];

export const ItemInsetSeparatorDemo = () => (
  <div className="flex max-w-sm flex-col">
    {FILES.map(({ icon: Icon, name, size }, index) => (
      <Item key={name}>
        <ItemMedia variant="icon">
          <Icon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{name}</ItemTitle>
          <ItemDescription>{size}</ItemDescription>
        </ItemContent>
        {index < FILES.length - 1 && <ItemInsetSeparator />}
      </Item>
    ))}
  </div>
);
