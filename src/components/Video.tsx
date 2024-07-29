import React, { VideoHTMLAttributes } from "react";
import ReactPlayer from "react-player/lazy";

interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const Video: React.FC<VideoProps> = ({ src, className }) => {
  return (
    <div className={className}>
      <ReactPlayer
        controls={false}
        loop
        playing
        volume={0}
        muted
        playsInline
        disablePictureInPicture
        width="100%"
        height="100%"
        url={src}
      ></ReactPlayer>
    </div>
  );
};

export default Video;
