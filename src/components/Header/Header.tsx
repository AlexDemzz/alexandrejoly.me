"use client";
import AnimatedLink from "@/components/AnimatedLink";
import { useTime } from "@/lib/hooks";
import Link from "next/link";
import Logo from "../Logo";
import TagIndicator from "../TagIndicator";
import { EMAIL } from "@/lib/constants";

const Header = () => {
  const time = useTime();
  return (
    <div className="fixed top-0 z-50 right-0 left-0 mix-blend-difference">
      <div className="container">
        <div className="flex justify-between items-center w-full py-6 relative z-20">
          <AnimatedLink href="/" scroll={false}>
            <Logo />
          </AnimatedLink>
          <div className="absolute left-0 right-0 pointer-events-none flex items-center justify-center">
            <div className="bg-foreground text-background font-mono text-sm font-bold px-1 hidden sm:inline-block">
              GENEVA, {time.toString()}
            </div>
          </div>
          <nav className="flex items-center gap-7">
            <AnimatedLink
              href={`mailto:${EMAIL}`}
              className="uppercase font-bold md:text-base"
            >
              Contact
            </AnimatedLink>
          </nav>
        </div>
      </div>
    </div>
  );
};
export default Header;
