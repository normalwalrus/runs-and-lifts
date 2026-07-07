import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

type DB = NodePgDatabase<typeof schema>;

// Cached on globalThis so dev-server HMR doesn't open a new pool per reload.
const globalForDb = globalThis as unknown as { db?: DB };

function createDb(): DB {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({
    connectionString,
    // Serverless: keep the pool tiny; Neon's pooler handles the rest.
    max: 1,
  });
  return drizzle(pool, { schema });
}

export const db: DB = globalForDb.db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
