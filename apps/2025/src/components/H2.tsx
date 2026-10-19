import React from "react";
import Trail from "./Trail";

const H2 = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="uppercase tracking-tighter font-black text-3xl md:text-6xl">
      <Trail split={""}>{children}</Trail>
    </h2>
  );
};

export default H2;
