import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public: list upcoming available slots for the landing-page picker. */
export async function GET() {
  const sql = getDb();
  if (!sql) return NextResponse.json({ slots: [] });

  try {
    const rows = await sql`
      select id, starts_at, duration_min
      from slots
      where status = 'available' and starts_at > now()
      order by starts_at asc
      limit 200`;
    return NextResponse.json({ slots: rows });
  } catch (err) {
    console.error("[slots] read failed:", err);
    return NextResponse.json({ slots: [] });
  }
}
