import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'mood-pictures.s3.eu-north-1.amazonaws.com',
      'i.scdn.co',
    ],
  },
};

export default nextConfig;
