const config = require("@ssb/ui/tailwindConfig");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...config,
  content: [...config.content, "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"],
};
