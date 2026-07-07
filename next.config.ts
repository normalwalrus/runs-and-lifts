import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages at <user>.github.io/runs-and-lifts
  output: "export",
  basePath: "/runs-and-lifts",
  images: { unoptimized: true },
};

export default nextConfig;
