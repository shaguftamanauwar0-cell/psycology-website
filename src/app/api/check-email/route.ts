import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Public: has this email booked before? Used to gate the free first session
 * early in the form (so we don't reject only at final submit).
 */
export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email = (body.email ?? "").toString().trim();
  } catch {
    return NextResponse.json({ freeUsed: false });
  }
  if (!email) return NextResponse.json({ freeUsed: false });

  const sql = getDb();
  if (!sql) return NextResponse.json({ freeUsed: false });

  try {
    const r = await sql`
      select 1 from bookings where lower(email) = lower(${email}) limit 1`;
    return NextResponse.json({ freeUsed: r.length > 0 });
  } catch {
    return NextResponse.json({ freeUsed: false });
  }
}
