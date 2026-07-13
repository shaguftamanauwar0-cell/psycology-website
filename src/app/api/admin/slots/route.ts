import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseAdmin";
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

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ slots: [] });

  const { data, error } = await sb
    .from("slots")
    .select("id, starts_at, duration_min, status")
    .gt("starts_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
    .order("starts_at", { ascending: true })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ slots: data ?? [] });
}

/** Create one or more slots. Body: { slots: [{ startsAt, durationMin }] } */
export async function POST(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const sb = getSupabase();
  if (!sb) {
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
      starts_at: s.startsAt ? new Date(s.startsAt).toISOString() : null,
      duration_min: Number(s.durationMin) > 0 ? Math.round(Number(s.durationMin)) : 30,
      status: "available",
    }))
    .filter((r) => r.starts_at && !Number.isNaN(Date.parse(r.starts_at)));

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid times provided." }, { status: 400 });
  }

  const { data, error } = await sb.from("slots").insert(rows).select("id");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, created: data?.length ?? 0 });
}

/** Delete a slot. Body: { id }. Refuses if a booking already holds it. */
export async function DELETE(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const sb = getSupabase();
  if (!sb) {
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

  const { error } = await sb.from("slots").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
