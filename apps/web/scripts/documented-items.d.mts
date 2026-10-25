export declare const documentedItems: <
  Item extends { meta?: { docs?: string } },
>(registry: {
  items: Item[];
}) => Item[];
