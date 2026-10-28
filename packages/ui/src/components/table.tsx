import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

// DESIGN.md › Docs pages › Components › API reference: 14px text, hairline
// rules, 14px vertical padding, no hover fill. `--table-inset` pads the outer
// cells when a container draws the table edge to edge.
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("border-border border-b", className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-muted-foreground px-2 pb-3.5 text-start align-bottom font-medium whitespace-nowrap first:ps-[var(--table-inset,0px)] last:pe-[var(--table-inset,0px)]",
        className
      )}
      {...props}
    />
  );
}

const TABLE_CELL_CLASS_NAME =
  "px-2 py-3.5 align-top first:ps-[var(--table-inset,0px)] last:pe-[var(--table-inset,0px)]";

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(TABLE_CELL_CLASS_NAME, className)}
      {...props}
    />
  );
}

// A body cell that names its row, so screen readers announce it with each
// cell beside it. Looks like a `TableCell`.
function TableRowHeader({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-row-header"
      scope="row"
      className={cn(TABLE_CELL_CLASS_NAME, "text-start font-normal", className)}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableRowHeader,
  TableCell,
  TableCaption,
};
