import * as schema from "./schema";

const databaseUrl = process.env.TURSO_DATABASE_URL || "file:./dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

function initDb() {
  if (databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("https://") || (authToken && authToken.length > 0)) {
    const { createClient } = require("@libsql/client/web");
    const { drizzle } = require("drizzle-orm/libsql");
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    });
    return drizzle(client, { schema });
  } else {
    // Local SQLite database via better-sqlite3
    const Database = require("better-sqlite3");
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const dbFilePath = databaseUrl.replace("file:", "").replace(/^\.\//, "");
    const sqlite = new Database(dbFilePath);
    return drizzle(sqlite, { schema });
  }
}

export const db = initDb();
