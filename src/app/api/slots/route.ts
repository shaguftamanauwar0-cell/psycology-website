import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public: list upcoming available slots for the landing-page picker. */
export async function GET() {
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ slots: [] });

  const { data, error } = await sb
    .from("slots")
    .select("id, starts_at, duration_min")
    .eq("status", "available")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("[slots] read failed:", error.message);
    return NextResponse.json({ slots: [] });
  }
  return NextResponse.json({ slots: data ?? [] });
}
