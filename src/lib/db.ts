import postgres from "postgres";

/**
 * Direct Postgres connection (Supabase pooler).
 * Returns null when DATABASE_URL isn't set so routes can degrade gracefully.
 * The connecting role owns the tables, so it bypasses RLS.
 */
let sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!sql) {
    sql = postgres(url, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false, // safe with connection poolers
    });
  }
  return sql;
}
