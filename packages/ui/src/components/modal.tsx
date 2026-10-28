"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@portfolio/ui/components/dialog";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useBeforeClose as useModalBeforeClose,
  useModal,
  useModals,
} from "react-easy-modals";

const ModalClose = DialogClose;
const ModalDescription = DialogDescription;
const ModalFooter = DialogFooter;
const ModalHeader = DialogHeader;
const ModalOverlay = DialogOverlay;
const ModalPortal = DialogPortal;
const ModalTitle = DialogTitle;
const ModalTrigger = DialogTrigger;
const ModalContent = DialogContent;

type BeforeCloseGuard = (closeValue: unknown) => boolean;

const beforeCloseGuards = new Map<string, React.RefObject<BeforeCloseGuard>>();

function useBeforeClose<T = unknown>(callback: (closeValue: T) => boolean) {
  const { id } = useModal();
  const callbackRef = useRef<BeforeCloseGuard>(callback as BeforeCloseGuard);

  useEffect(() => {
    callbackRef.current = callback as BeforeCloseGuard;
  });

  useEffect(() => {
    beforeCloseGuards.set(id, callbackRef);
    return () => {
      beforeCloseGuards.delete(id);
    };
  }, [id]);
}

function isCloseBlocked(id: string, closeValue: unknown) {
  return beforeCloseGuards.get(id)?.current(closeValue) === false;
}

type ModalRootProps = {
  children: React.ReactNode;
} & Omit<
  React.ComponentProps<typeof Dialog>,
  "open" | "onOpenChange" | "onOpenChangeComplete"
>;

function Modal({ children, ...dialogProps }: ModalRootProps) {
  const modal = useModal();
  const modals = useModals();
  const [isVisible, setIsVisible] = useState(true);
  const canClose = useRef(false);
  const isClosing = useRef(false);
  const closableVariable = useRef<Parameters<typeof modal.close>[0]>(undefined);
  const currentModalIndex = modals.stack.findIndex((m) => m.id === modal.id);
  const isTopModal =
    modal.isNested || currentModalIndex === modals.stack.length - 1;
  const modalIsHidden =
    !modal.isNested && currentModalIndex !== -1 && !isTopModal;
  const ownEntry = useMemo(() => {
    for (const root of modals.stack) {
      let entry: typeof root | undefined = root;
      while (entry) {
        if (entry.id === modal.id) return entry;
        entry = entry.nested;
      }
    }
    return undefined;
  }, [modal.id, modals.stack]);

  function startClose(closeValue?: Parameters<typeof modal.close>[0]) {
    closableVariable.current = closeValue;
    if (isClosing.current) return;
    isClosing.current = true;
    setIsVisible(false);
    let current = ownEntry?.nested;
    while (current) {
      current.close();
      current = current.nested;
    }
  }

  useModalBeforeClose<Parameters<typeof modal.close>[0]>((closeValue) => {
    if (!canClose.current && isCloseBlocked(modal.id, closeValue)) return false;
    startClose(closeValue);
    return canClose.current;
  });

  function handleOpenChange(value: boolean) {
    if (!value && isTopModal) {
      modal.close();
    }
  }

  function handleOpenChangeComplete(value: boolean) {
    if (!(value || isVisible)) {
      const chain = [];
      let current = ownEntry?.nested;
      while (current) {
        chain.unshift(current);
        current = current.nested;
      }
      for (const entry of chain) {
        entry.close(undefined, { force: true });
      }
      canClose.current = true;
      modal.close(closableVariable.current);
      closableVariable.current = undefined;
    }
  }

  return (
    <Dialog
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
      open={isVisible && !modalIsHidden}
      {...dialogProps}
    >
      {children}
    </Dialog>
  );
}

export {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
  useBeforeClose,
};
