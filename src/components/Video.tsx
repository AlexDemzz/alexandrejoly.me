import React, { VideoHTMLAttributes } from "react";
import BackgroundVideo from "next-video/background-video";

interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const Video: React.FC<VideoProps> = ({ src, className }) => {
  return (
    <div>
      <BackgroundVideo className={className} src={src} />
    </div>
  );
};

export default Video;
