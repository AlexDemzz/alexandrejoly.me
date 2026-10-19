// import { withNextVideo } from "next-video/process";
/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ["geist"]
}

// export default withNextVideo(nextConfig);
export default nextConfig;
