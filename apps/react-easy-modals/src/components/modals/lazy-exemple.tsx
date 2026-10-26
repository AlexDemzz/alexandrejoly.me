import { LoaderCircle } from "lucide-react";
import { ModalProvider, useModals } from "react-easy-modals";

import { wait } from "@/lib/wait";

import { ButtonExemple } from "../button-exemple";
import { Modal } from "../css-modal";
import { DemoBackdrop } from "../demo-modal";

const LAZY_DELAY_MS = 1000;

// Stands in for () => import("./modal") on a slow network.
const loadModal = async () => {
  await wait(LAZY_DELAY_MS);
  return { default: Modal };
};

const LazyLoadingState = () => (
  <DemoBackdrop>
    <output
      aria-live="polite"
      className="bg-popover text-popover-foreground ring-border flex items-center gap-2 rounded-full px-4 py-2 shadow-lg ring-1"
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      Loading…
    </output>
  </DemoBackdrop>
);

const Client = () => {
  const modals = useModals();

  const handleClick = () => {
    void modals.open(loadModal, {
      title: "Alert",
      message: "This modal was loaded lazily",
    });
  };

  return <ButtonExemple onClick={handleClick} />;
};

const LazyExemple = () => (
  <ModalProvider loading={LazyLoadingState}>
    <Client />
  </ModalProvider>
);

export default LazyExemple;
