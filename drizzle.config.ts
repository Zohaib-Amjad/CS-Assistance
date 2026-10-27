import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Next.js loads `.env.local`, but Drizzle Kit only reads `.env` by default.
// Load the local Next.js environment first so schema commands target Turso
// when its credentials are stored in `.env.local`.
dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url:
      process.env.TURSO_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "file:./dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
