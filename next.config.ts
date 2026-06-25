import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El indicador de Next.js (bottom-left por default) tapaba el pie del sidebar
  // del backoffice, que vive en esa misma esquina.
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.app.github.dev"],
    },
  },
};

export default nextConfig;
