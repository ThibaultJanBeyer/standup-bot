import type { Config } from "drizzle-kit";

export default {
  schema: "./src/models/**/*.ts",
  out: "./drizzle",
} satisfies Config;
