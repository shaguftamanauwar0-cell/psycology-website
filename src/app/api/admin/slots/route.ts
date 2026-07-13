import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guard(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

/** List all upcoming slots (any status) for the admin. */
export async function GET(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const sql = getDb();
  if (!sql) return NextResponse.json({ slots: [] });

  try {
    const rows = await sql`
      select id, starts_at, duration_min, status
      from slots
      where starts_at > now() - interval '1 day'
      order by starts_at asc
      limit 500`;
    return NextResponse.json({ slots: rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** Create one or more slots. Body: { slots: [{ startsAt, durationMin }] } */
export async function POST(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  let items: { startsAt?: string; durationMin?: number }[] = [];
  try {
    const body = await request.json();
    items = Array.isArray(body.slots) ? body.slots : [];
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rows = items
    .map((s) => ({
      starts_at: s.startsAt ? new Date(s.startsAt) : null,
      duration_min: Number(s.durationMin) > 0 ? Math.round(Number(s.durationMin)) : 30,
      status: "available" as const,
    }))
    .filter((r): r is { starts_at: Date; duration_min: number; status: "available" } =>
      r.starts_at !== null && !Number.isNaN(r.starts_at.getTime()),
    );

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid times provided." }, { status: 400 });
  }

  try {
    const created = await sql`
      insert into slots ${sql(rows, "starts_at", "duration_min", "status")}
      returning id`;
    return NextResponse.json({ ok: true, created: created.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** Delete a slot. Body: { id }. */
export async function DELETE(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  let id = "";
  try {
    const body = await request.json();
    id = (body.id ?? "").toString();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!id) return NextResponse.json({ error: "Missing slot id." }, { status: 400 });

  try {
    await sql`delete from slots where id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
