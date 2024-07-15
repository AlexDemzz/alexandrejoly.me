import Link from "next/link";
import React from "react";
import { ModeToggle } from "./ModeToggle";
import TagIndicator from "./TagIndicator";

const Header = () => {
  return (
    <div>
      <div className="container">
        <div className="flex justify-between items-center w-full py-6 relative z-10">
          <TagIndicator tag="header">
            <Link href="/" className="tracking-tighter font-bold text-lg">
              Alexandre Joly
              <sup className="font-features sups font-mono">(v2.0)</sup>
            </Link>
          </TagIndicator>
          <nav className="flex items-center gap-4">
            <TagIndicator tag="a">
              <Link href="/projects" className="uppercase">
                Projects,
              </Link>
            </TagIndicator>

            <TagIndicator tag="a">
              <Link href="/awards" className="uppercase">
                Awards,
              </Link>
            </TagIndicator>

            <TagIndicator tag="a">
              <Link href="/contact" className="uppercase">
                Contact
              </Link>
            </TagIndicator>
          </nav>
        </div>
      </div>
    </div>
  );
};
export default Header;
