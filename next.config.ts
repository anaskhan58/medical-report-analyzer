import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdf-parse (and its pdfjs worker) out of the bundle so its worker
  // module resolves correctly at runtime in the Node server.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
