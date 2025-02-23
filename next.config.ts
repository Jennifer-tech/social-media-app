import type { NextConfig } from "next";
import dotenv from "dotenv";

dotenv.config()

const nextConfig: NextConfig = {
  /* config options here */
  experimental:{
    staleTimes: {
      dynamic: 30
    },
  },
  serverExternalPackages: ["@node-rs/argon2"],   //lucia needs this package inorder to work
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
    ],
  },
};

export default nextConfig;
