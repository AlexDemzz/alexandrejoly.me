import Link from "next/link";
import React from "react";
import { ModeToggle } from "./ModeToggle";

const Header = () => {
  return (
    <div>
      <Link href="/">Home</Link>
      <ModeToggle />
    </div>
  );
};

export default Header;
