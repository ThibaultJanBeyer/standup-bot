import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export * from "./schema";
export * from "drizzle-orm";

dotenv.config();

export default () => {
  const urlString = process.env.DATABASE_URL!;
  const uri = !urlString.includes("-pooler")
    ? urlString.replace(/(-[0-9]+)\./, "$1-pooler.")
    : urlString;

  const sqlForMigrations = postgres(uri, {
    max: 1,
    ssl: { rejectUnauthorized: false },
  });
  const sql = postgres(uri, { ssl: { rejectUnauthorized: false } });
  const db = drizzle(sql, { schema });
  return {
    sqlForMigrations,
    sql,
    db,
  };
};
