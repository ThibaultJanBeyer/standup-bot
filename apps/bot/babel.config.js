module.exports = function babelConfig(api) {
  api.cache(true);
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current",
          },
        },
      ],
      "@babel/preset-typescript",
    ],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-proposal-optional-chaining",
    ],
    ignore: [
      "node_modules",
      "build",
      "**/*.stories.*",
      "**/__tests__",
      "**/__mocks__",
      "**/test-utils",
    ],
  };
};
