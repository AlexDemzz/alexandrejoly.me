"use client";
import Link from "next/link";
import TagIndicator from "../TagIndicator";
import GlassesButton from "./GlassesButton";
import Logo from "../Logo";
import { ModeToggle } from "../ModeToggle";

const Header = () => {
  return (
    <div className="fixed top-0 z-50 right-0 left-0 mix-blend-difference">
      <div className="container">
        <div className="flex justify-between items-center w-full py-6 relative z-20">
          <TagIndicator tag="header">
            <Link href="/" scroll={false}>
              <Logo />
            </Link>
          </TagIndicator>
          <nav className="flex items-center gap-7">
            <TagIndicator tag="a">
              <Link href="/contact" className="font-semibold md:text-xl">
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
