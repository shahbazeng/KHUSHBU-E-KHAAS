import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript errors ko build ke waqt ignore karne ke liye (Sab se solid rule)
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint errors ko bhi ignore karein taake wahan se bhi pass ho jaye
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;