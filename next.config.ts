import type { NextConfig } from "next";

function normalizeBackendOrigin(rawUrl?: string): string {
  const fallbackDevUrl = "http://localhost:5286";
  const isProduction = process.env.NODE_ENV === "production";
  const trimmed = rawUrl?.trim();

  if (!trimmed) {
    if (isProduction) {
      throw new Error(
        "Missing NEXT_PUBLIC_API_URL in production. Set it in your deployment environment variables.",
      );
    }
    return fallbackDevUrl;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const normalized = withProtocol.replace(/\/+$/, "");
  const withoutApiPath = normalized.endsWith("/api")
    ? normalized.slice(0, -4)
    : normalized;

  try {
    const parsed = new URL(withoutApiPath);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("NEXT_PUBLIC_API_URL must use http or https.");
    }
    return parsed.origin;
  } catch {
    throw new Error(`Invalid NEXT_PUBLIC_API_URL: "${rawUrl}"`);
  }
}

const backendOrigin = normalizeBackendOrigin(process.env.NEXT_PUBLIC_API_URL);

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
