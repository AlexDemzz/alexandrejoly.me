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
  children,
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
    >
      <span className="inline-flex items-center gap-1.5 [&_svg]:size-4 [&_svg]:shrink-0">
        {children}
      </span>
    </PopoverTrigger>
  );
}

function HintContent({
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return <PopoverContent data-slot="hint-content" {...props} />;
}

export { Hint, HintContent, HintTrigger };
