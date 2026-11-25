import type { NextConfig } from "next";

import { networkInterfaces } from "node:os";

const lanOrigins = Object.values(networkInterfaces()).flat()
  .filter(ip => ip?.family === "IPv4" && !ip.internal && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip.address))
  .map(ip => ip!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: lanOrigins,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
