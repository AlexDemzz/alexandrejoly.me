"use client";
import Link from "next/link";
import TagIndicator from "../TagIndicator";
import GlassesButton from "./GlassesButton";
import Logo from "../Logo";

const Header = () => {
  return (
    <div className="sticky top-0 z-50 mix-blend-difference">
      <div className="container">
        <div className="flex justify-between items-center w-full py-6 relative z-20">
          <TagIndicator tag="header" animate={false}>
            <Link href="/">
              <Logo />
            </Link>
          </TagIndicator>
          <nav className="flex items-center gap-7">
            <TagIndicator tag="a" animate={false}>
              <Link href="/contact" className="font-semibold text-xl">
                Contact
              </Link>
            </TagIndicator>
            {/* <ModeToggle /> */}
            {/* <GlassesButton /> */}
          </nav>
        </div>
      </div>
    </div>
  );
};
export default Header;
