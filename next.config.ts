import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseRemotePattern = (() => {
  if (!supabaseUrl) return [];

  try {
    const { protocol, hostname, port } = new URL(supabaseUrl);

    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
        pathname: "/storage/v1/render/image/public/**",
      },
    ];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseRemotePattern,
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
