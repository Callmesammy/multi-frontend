import type { NextConfig } from "next";

const backendUrlRaw = process.env.BACKEND_API_URL ?? "http://localhost:5286";
const backendUrl = backendUrlRaw.replace(/\/+$/, "");
const backendOrigin = backendUrl.endsWith("/api")
  ? backendUrl.slice(0, -4)
  : backendUrl;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
