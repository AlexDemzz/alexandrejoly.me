import { Button } from "@portfolio/ui/components/button";
import { Preview } from "@portfolio/ui/components/preview";
import type { ReactNode } from "react";

const ButtonExemple = ({
  onClick,
  children,
  label = "Open dialog",
}: {
  onClick: () => void;
  children?: ReactNode;
  label?: string;
}) => (
  <Preview className="my-6">
    <div className="not-prose flex flex-col items-center gap-4 text-center">
      <Button onClick={onClick}>{label}</Button>
      {children}
    </div>
  </Preview>
);

export { ButtonExemple };
