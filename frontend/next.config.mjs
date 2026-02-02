/** @type {import('next').NextConfig} */
// GitHub Pages serves from /<repo-name>, so we use a basePath/assetPrefix in production builds.
// The workflow sets NEXT_PUBLIC_BASE_PATH="/<repo-name>".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
};

export default nextConfig;
