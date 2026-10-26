import { Button } from "@/components/ui/button";
import {
  SheetDrawer,
  SheetDrawerClose,
  SheetDrawerContent,
  SheetDrawerDescription,
  SheetDrawerFooter,
  SheetDrawerHeader,
  SheetDrawerTitle,
  SheetDrawerTrigger,
} from "@/components/ui/sheet-drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export const SheetDrawerPreview = () => {
  const isMobile = useIsMobile();

  return (
    <div className="not-prose flex flex-col items-center gap-4 rounded-xl border p-10">
      <SheetDrawer>
        <SheetDrawerTrigger render={<Button variant="outline" />}>
          Open menu
        </SheetDrawerTrigger>
        <SheetDrawerContent side="right">
          <SheetDrawerHeader>
            <SheetDrawerTitle>Workspace</SheetDrawerTitle>
            <SheetDrawerDescription>
              Go to any page in this workspace.
            </SheetDrawerDescription>
          </SheetDrawerHeader>
          <nav className="grid gap-1 px-4 text-sm">
            {["Dashboard", "Projects", "Members", "Settings"].map((item) => (
              <button
                key={item}
                type="button"
                className="hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-left font-medium"
              >
                {item}
              </button>
            ))}
          </nav>
          <SheetDrawerFooter>
            <SheetDrawerClose render={<Button variant="outline" />}>
              Close
            </SheetDrawerClose>
          </SheetDrawerFooter>
        </SheetDrawerContent>
      </SheetDrawer>
      <p className="text-muted-foreground text-xs">
        {isMobile
          ? "Below 768px: a Drawer from the right edge."
          : "At 768px and up: a Sheet from the right edge."}{" "}
        Resize the window across 768px to see the swap.
      </p>
    </div>
  );
};
