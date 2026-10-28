import { Button } from "@portfolio/ui/components/button";
import { cn } from "@portfolio/ui/lib/utils";

import { CopyStateIcon, CopyStatus } from "@/components/copy-state-icon";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

// Wraps rather than truncates on a narrow screen, so the item name at the end
// stays readable.
export const InstallCommand = ({
  command,
  className,
}: {
  command: string;
  className?: string;
}) => {
  const { copied, copy } = useCopyToClipboard();
  const isCopied = copied === command;

  return (
    <div
      className={cn(
        "bg-muted flex min-h-10 min-w-0 items-center gap-1 rounded-lg py-1 ps-3.5 pe-1 font-mono text-sm",
        className
      )}
    >
      <code className="min-w-0 flex-1 wrap-anywhere">{command}</code>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Copy install command"
        onClick={() => copy(command)}
      >
        <CopyStateIcon copied={isCopied} />
      </Button>
      <CopyStatus copied={isCopied} />
    </div>
  );
};
