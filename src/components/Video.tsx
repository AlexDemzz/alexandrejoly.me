import React, { VideoHTMLAttributes } from "react";

interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const Video: React.FC<VideoProps> = ({ src, ...rest }) => {
  return (
    <video {...rest} controls={false} loop autoPlay muted>
      <source src={src} type="video/webm" />
    </video>
  );
};

export default Video;
