"use client";
import { useLayoutEffect, useState } from "react";

const useColumns = () => {
  const [columns, setColumns] = useState(8);

  const handleResize = () => {
    setColumns(window.innerWidth >= 768 ? 8 : 4);
  };

  useLayoutEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return columns;
};

export default useColumns;
