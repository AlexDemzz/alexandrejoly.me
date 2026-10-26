import {
  Identity,
  IdentityMark,
  IdentityName,
  IdentityStatement,
} from "@portfolio/ui/components/identity";
import { Link } from "@tanstack/react-router";

import { LogoMark } from "@/components/logo";
import { SITE_NAME } from "@/lib/site";

interface SiteIdentityProps {
  /** The name is the page's `h1` on the landing, a `span` elsewhere. */
  nameAs?: "h1" | "span";
  /** Links the mark and statement to the home page. */
  linked?: boolean;
}

export const SiteIdentity = ({
  nameAs = "span",
  linked = true,
}: SiteIdentityProps) => {
  const Name = nameAs;
  const identity = (
    <Identity>
      <IdentityMark>
        <LogoMark />
      </IdentityMark>
      <IdentityStatement>
        <IdentityName render={<Name />}>{SITE_NAME}</IdentityName>: modals you
        can await.
      </IdentityStatement>
    </Identity>
  );

  if (!linked) {
    return identity;
  }

  return (
    <Link className="block w-fit rounded-md" to="/">
      {identity}
    </Link>
  );
};
