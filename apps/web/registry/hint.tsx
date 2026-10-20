import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function Hint({ ...props }: React.ComponentProps<typeof Popover>) {
  return <Popover data-slot="hint" {...props} />;
}

function HintTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PopoverTrigger>) {
  return (
    <PopoverTrigger
      className={cn(
        "relative cursor-help after:absolute after:-inset-2",
        className
      )}
      data-slot="hint-trigger"
      type="button"
      {...props}
    />
  );
}

function HintContent({
  className,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      className={cn(
        "bg-foreground text-background text-base shadow-none ring-0",
        className
      )}
      data-slot="hint-content"
      {...props}
    />
  );
}

export { Hint, HintContent, HintTrigger };
