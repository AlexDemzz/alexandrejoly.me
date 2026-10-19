// import { Asset } from "next-video/dist/assets.js";
import { StaticImageData } from "next/image";

export interface Project {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  images?: StaticImageData[];
  // videos?: Asset[] | string[];
  videos?: string[];
}

export interface CursorWrapperProps {
  children: (props: {
    isHover: boolean;
    isMoving: boolean;
    isMouseDown: boolean;
  }) => React.ReactNode;
}

export interface BreakpointsT {
  xs?: any;
  sm?: any;
  md?: any;
  lg?: any;
  xl?: any;
  "2xl"?: any;
}
