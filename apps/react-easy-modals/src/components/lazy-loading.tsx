import { Spinner } from "@portfolio/ui/components/spinner";

// The ModalProvider `loading` state while a lazy modal's chunk downloads.
export const LazyLoading = () => (
  <output
    aria-live="polite"
    className="fixed inset-0 z-50 grid place-items-center bg-black/10"
  >
    <span className="bg-popover text-muted-foreground shadow-hairline flex items-center gap-2 rounded-full px-4 py-2">
      <Spinner aria-hidden="true" />
      Loading…
    </span>
  </output>
);
