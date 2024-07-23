import React from "react";
import { useSpring, animated } from "@react-spring/web";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported
import Marquee from "@/components/Marquee";

const ProjectTitle = ({ children }) => {
  return <Marquee>{children}</Marquee>;
};

export default ProjectTitle;
