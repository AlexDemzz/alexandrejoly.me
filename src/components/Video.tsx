import React, { VideoHTMLAttributes } from "react";
import BackgroundVideo from "next-video/background-video";
import { Asset } from "next-video/dist/assets.js";

interface VideoProps extends HTMLDivElement {
  src: Asset | string;
}

const Video: React.FC<VideoProps> = ({ src, className }) => {
  return (
    <div>
      <BackgroundVideo className={className} src={src} />
    </div>
  );
};

export default Video;
