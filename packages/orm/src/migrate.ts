import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import setupOrm from ".";

const { sqlForMigrations } = setupOrm();

const migrateSchema = async () => {
  const db = drizzle(sqlForMigrations);
  await migrate(db, { migrationsFolder: "drizzle" });
};

void migrateSchema()
  .then(() => process.exit(0))
  .catch((ex) => {
    console.error(ex);
    process.exit(1);
  });
