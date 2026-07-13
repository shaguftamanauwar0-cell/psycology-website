import postgres from "postgres";
import { readFileSync } from "node:fs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(url, { prepare: false });
const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

try {
  await sql.unsafe(schema);
  const tables = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_name in ('slots','bookings','messages')
    order by table_name`;
  console.log("✓ Schema applied. Tables:", tables.map((t) => t.table_name).join(", "));
} catch (err) {
  console.error("Schema failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
