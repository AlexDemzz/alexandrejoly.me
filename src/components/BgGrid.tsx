"use client";

import { useColumns } from "@/lib/hooks";

const BgGrid = () => {
  const columns = useColumns();

  return (
    <div className="container h-[100vh] flex items-stretch w-full fixed top-0 right-0 left-0 -z-10">
      {new Array(columns).fill("").map((_, i, arr) => (
        <div
          className={`border-grid ${
            i < arr.length - 1 ? "border-l" : "border-l border-r"
          } flex-1`}
          key={`grid-elem-${i}`}
        />
      ))}
    </div>
  );
};

export default BgGrid;
