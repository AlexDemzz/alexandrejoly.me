import { Asset } from "next-video/dist/assets.js";
import { StaticImageData } from "next/image";

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  images?: StaticImageData[];
  videos?: Asset[];
}
