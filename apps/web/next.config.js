const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

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
      domains: ["cataas.com", "cdn.sanity.io"],
    },
  };
  return withBundleAnalyzer(nextConfig);
};
