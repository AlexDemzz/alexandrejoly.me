import React, { VideoHTMLAttributes } from "react";
import BackgroundVideo from "next-video/background-video";
import { Asset } from "next-video/dist/assets.js";

interface VideoProps {
  src: Asset | string;
  className?: string;
}

const Video = ({ src, className }: VideoProps) => {
  return <div>{/* <BackgroundVideo className={className} src={src} /> */}</div>;
};

export default Video;
