"use client";
import Link from "next/link";
import TagIndicator from "../TagIndicator";
import GlassesButton from "./GlassesButton";

const Header = () => {
  return (
    <div className="sticky top-0 z-50 mix-blend-difference">
      <div className="container">
        <div className="flex justify-between items-center w-full py-6 relative z-20">
          <TagIndicator tag="header">
            <Link href="/" className="tracking-tighter font-bold text-lg">
              Alexandre Joly
              <sup className="font-features sups font-mono">(v2.0)</sup>
            </Link>
          </TagIndicator>
          <nav className="flex items-center gap-4">
            <TagIndicator tag="a">
              <Link href="/projects" className="font-medium text-xl">
                Projects,
              </Link>
            </TagIndicator>

            <TagIndicator tag="a">
              <Link href="/awards" className="font-medium text-xl">
                Awards,
              </Link>
            </TagIndicator>

            <TagIndicator tag="a">
              <Link href="/contact" className="font-medium text-xl">
                Contact
              </Link>
            </TagIndicator>
            {/* <ModeToggle /> */}
            <GlassesButton />
          </nav>
        </div>
      </div>
    </div>
  );
};
export default Header;
