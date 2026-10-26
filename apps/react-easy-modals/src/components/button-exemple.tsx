import type { ReactNode } from "react";

import { Button } from "./ui/button";
import { Preview } from "./ui/preview";

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
    <div className="not-prose flex flex-col items-center gap-4">
      <Button onClick={onClick}>{label}</Button>
      {children}
    </div>
  </Preview>
);

export { ButtonExemple };
