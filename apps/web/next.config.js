const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

process.env.NEXTAUTH_URL = `${process.env.PROTOCOL}${process.env.WEB_URI}`;

module.exports = async (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    ...defaultConfig,
    reactStrictMode: true,

    experimental: {
      serverActions: true,
    },
    transpilePackages: ["@ssb/ui"],
    images: {
      unoptimized: true,
    },
  };
  return withBundleAnalyzer(nextConfig);
};
