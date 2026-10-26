import { PreviewFrame } from "@/components/previews/preview-frame";
import { Button } from "@/components/ui/button";
import {
  DialogDrawer,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
  DialogDrawerTrigger,
} from "@/components/ui/dialog-drawer";

const RELEASE_NOTES = [
  "Search now matches file contents.",
  "Shared links can expire after a set date.",
  "The sidebar remembers its width.",
  "Exports keep your column order.",
  "Comments show who edited them last.",
  "Uploads resume after a lost connection.",
];

export const OverridePropExample = () => (
  <PreviewFrame
    desktop="At 768px and up: a Dialog up to md:max-w-lg wide."
    mobile="Below 768px: a Drawer with two snap points, at most 80dvh tall."
  >
    <div className="w-full max-w-xs">
      <DialogDrawer drawer={{ snapPoints: [0.5, 1] }}>
        <DialogDrawerTrigger
          render={<Button variant="outline" className="w-full" />}
        >
          Open
        </DialogDrawerTrigger>
        <DialogDrawerContent
          className="md:max-w-lg"
          drawer={{ className: "max-h-[80dvh]" }}
        >
          <DialogDrawerHeader>
            <DialogDrawerTitle>What is new</DialogDrawerTitle>
            <DialogDrawerDescription>
              Changes in this release.
            </DialogDrawerDescription>
          </DialogDrawerHeader>
          <ul className="grid min-h-0 list-disc gap-2 overflow-y-auto px-4 pl-8 text-sm md:pr-0">
            {RELEASE_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <DialogDrawerFooter showCloseButton />
        </DialogDrawerContent>
      </DialogDrawer>
    </div>
  </PreviewFrame>
);
