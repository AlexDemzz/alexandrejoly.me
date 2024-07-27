import React from "react";
import Icon from "@/images/logo-icon.svg";
import Image from "next/image";
const Logo = () => {
  return (
    <div className="tracking-tighter uppercase font-bold md:text-base flex items-center gap-2">
      <Image src={Icon} alt="Alexandre Joly logo" className="w-5" />
      Alexandre Joly
      {/* <sup className="font-features sups font-mono text-sm">(v2.0)</sup> */}
    </div>
  );
};

export default Logo;
