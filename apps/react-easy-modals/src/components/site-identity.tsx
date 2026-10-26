import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { LogoStack } from "@/components/logo";
import {
  Identity,
  IdentityMark,
  IdentityName,
  IdentityRole,
} from "@/components/ui/identity";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

interface SiteIdentityProps {
  /** The line under the name. */
  tagline: ReactNode;
  /** The name is the page's `h1` on the landing, a `p` elsewhere. */
  nameAs?: "h1" | "p";
  /** Links the mark and name to the home page. */
  linked?: boolean;
  className?: string;
}

export const SiteIdentity = ({
  tagline,
  nameAs = "p",
  linked = true,
  className,
}: SiteIdentityProps) => {
  const Name = nameAs;
  const content = (
    <>
      <IdentityMark>
        <LogoStack />
      </IdentityMark>
      <div>
        <IdentityName render={<Name />}>{SITE_NAME}</IdentityName>
        <IdentityRole>{tagline}</IdentityRole>
      </div>
    </>
  );

  return (
    <Identity className={cn("w-fit", className)}>
      {linked ? (
        <Link to="/" className="flex items-center gap-3 rounded-md">
          {content}
        </Link>
      ) : (
        content
      )}
    </Identity>
  );
};
