const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

process.env.NEXTAUTH_URL = process.env.WEB_URI;

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
