import React, { useEffect, useRef, VideoHTMLAttributes } from "react";
import BackgroundVideo from "next-video/background-video";

interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const Video: React.FC<VideoProps> = ({ src, ...rest }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // useEffect(() => {
  //   if (videoRef.current) {
  //     videoRef.current.play();
  //   }
  // }, []);

  return <BackgroundVideo src={src} {...rest} />;
};

export default Video;
