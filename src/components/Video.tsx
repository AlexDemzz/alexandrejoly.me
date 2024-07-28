import React, { useEffect, useRef, VideoHTMLAttributes } from "react";

interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const Video: React.FC<VideoProps> = ({ src, ...rest }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={videoRef}
      {...rest}
      controls={false}
      loop
      autoPlay
      muted
      playsInline
      disablePictureInPicture
    >
      <source src={src} type="video/webm" />
    </video>
  );
};

export default Video;
