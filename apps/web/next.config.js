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
    webpack(config) {
      config.plugins.push(
        require("unplugin-icons/webpack")({
          compiler: "jsx",
          jsx: "react",
          autoInstall: true,
        }),
      );

      return config;
    },
    transpilePackages: ["@ssb/ui"],
    images: {
      domains: ["cataas.com", "cdn.sanity.io"],
    },
  };
  return withBundleAnalyzer(nextConfig);
};
