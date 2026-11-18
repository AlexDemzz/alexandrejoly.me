import { cn } from "@portfolio/ui/lib/utils";
import {
  createContext,
  isValidElement,
  use,
  useId,
  useMemo,
  useState,
} from "react";
import type { ComponentProps, ReactNode } from "react";

interface RowListContextValue {
  expanded: boolean;
  itemsId: string;
  limit: number;
  toggle: () => void;
}

const RowListContext = createContext<RowListContextValue | null>(null);

const useRowList = (part: string) => {
  const context = use(RowListContext);
  if (context === null) {
    throw new Error(`${part} must be used within RowList`);
  }
  return context;
};

/** A list of rows that shows the first `limit` until RowListMore opens it. */
const RowList = ({
  className,
  limit = Number.POSITIVE_INFINITY,
  ...props
}: ComponentProps<"div"> & { limit?: number }) => {
  const itemsId = useId();
  const [expanded, setExpanded] = useState(false);
  const value = useMemo(
    () => ({
      expanded,
      itemsId,
      limit,
      toggle: () => setExpanded((current) => !current),
    }),
    [expanded, itemsId, limit]
  );

  return (
    <RowListContext value={value}>
      <div
        className={cn("flex flex-col items-start gap-3.5", className)}
        data-slot="row-list"
        {...props}
      />
    </RowListContext>
  );
};

// Every row stays in the HTML so crawlers follow its link; past the limit it is
// only `hidden` until RowListMore opens the list.
const RowListItems = ({
  children,
  className,
  ...props
}: Omit<ComponentProps<"ul">, "children"> & { children: ReactNode[] }) => {
  const { expanded, itemsId, limit } = useRowList("RowListItems");

  return (
    <ul
      className={cn("flex w-full flex-col", className)}
      data-slot="row-list-items"
      id={itemsId}
      {...props}
    >
      {children.map((row, index) => (
        <li
          hidden={!expanded && index >= limit}
          key={isValidElement(row) ? row.key : index}
        >
          {row}
        </li>
      ))}
    </ul>
  );
};

/** The toggle; render it only when the list holds more rows than its limit. */
const RowListMore = ({ className, ...props }: ComponentProps<"button">) => {
  const { expanded, itemsId, toggle } = useRowList("RowListMore");

  return (
    <button
      aria-controls={itemsId}
      aria-expanded={expanded}
      className={className}
      data-slot="row-list-more"
      onClick={toggle}
      type="button"
      {...props}
    >
      {expanded ? "See less" : "See more"}
    </button>
  );
};

export { RowList, RowListItems, RowListMore };
