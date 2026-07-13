import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseAdmin";
import { getPlan } from "@/lib/pricing";
import { sendAdminBookingEmail } from "@/lib/email";

export const runtime = "nodejs";

type Body = {
  planId?: string;
  slotId?: string;
  name?: string;
  age?: unknown;
  gender?: string;
  location?: string;
  email?: string;
  reason?: string;
  feelings?: unknown;
  topics?: unknown;
  spokenBefore?: string;
  language?: string;
  desiredOutcome?: string;
  notes?: string;
};

const asStringArray = (val: unknown): string[] =>
  Array.isArray(val)
    ? val.filter((x): x is string => typeof x === "string").slice(0, 20)
    : [];

const str = (v: unknown, max = 4000) =>
  (v ?? "").toString().trim().slice(0, max) || undefined;

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const plan = getPlan(body.planId);
  const name = (body.name ?? "").toString().trim().slice(0, 120);
  const email = (body.email ?? "").toString().trim().slice(0, 200);
  const gender = (body.gender ?? "").toString().trim().slice(0, 60);
  const age = Number(body.age);

  if (!plan) {
    return NextResponse.json({ error: "Please choose a plan." }, { status: 400 });
  }
  if (!name || !email || !gender || !Number.isFinite(age)) {
    return NextResponse.json(
      { error: "Please complete the required fields." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "Bookings aren't available yet. Please try again shortly." },
      { status: 503 },
    );
  }

  // Claim the slot atomically: only succeeds if still 'available'.
  let slotStartsAt: string | null = null;
  const slotId = body.slotId?.toString();
  if (slotId) {
    const { data: claimed, error: claimErr } = await sb
      .from("slots")
      .update({ status: "held" })
      .eq("id", slotId)
      .eq("status", "available")
      .select("id, starts_at")
      .maybeSingle();

    if (claimErr) {
      console.error("[book] slot claim failed:", claimErr.message);
      return NextResponse.json(
        { error: "We couldn't reserve that time. Please try again." },
        { status: 500 },
      );
    }
    if (!claimed) {
      return NextResponse.json(
        { error: "Sorry, that time was just taken. Please pick another slot." },
        { status: 409 },
      );
    }
    slotStartsAt = claimed.starts_at as string;
  }

  const record = {
    slot_id: slotId ?? null,
    plan: plan.id,
    amount: plan.amount,
    name,
    age: Math.max(0, Math.min(120, Math.round(age))),
    gender,
    location: str(body.location, 120) ?? null,
    email,
    reason: str(body.reason) ?? null,
    feelings: asStringArray(body.feelings),
    topics: asStringArray(body.topics),
    spoken_before: str(body.spokenBefore, 120) ?? null,
    language: str(body.language, 60) ?? null,
    desired_outcome: str(body.desiredOutcome) ?? null,
    notes: str(body.notes) ?? null,
    status: "pending_payment",
  };

  const { data: booking, error: insertErr } = await sb
    .from("bookings")
    .insert(record)
    .select("id")
    .single();

  if (insertErr) {
    console.error("[book] insert failed:", insertErr.message);
    // Release the slot we just held so it isn't stuck.
    if (slotId) {
      await sb.from("slots").update({ status: "available" }).eq("id", slotId);
    }
    return NextResponse.json(
      { error: "We couldn't save your booking just now. Please try again." },
      { status: 500 },
    );
  }

  // Fire the admin notification — non-blocking.
  sendAdminBookingEmail({
    name,
    age: record.age,
    gender,
    location: record.location,
    email,
    plan: plan.id,
    amount: plan.amount,
    slotStartsAt,
    reason: record.reason,
    feelings: record.feelings,
    topics: record.topics,
    spokenBefore: record.spoken_before,
    language: record.language,
    desiredOutcome: record.desired_outcome,
    notes: record.notes,
  }).catch((err) => console.error("[book] admin email failed:", err));

  return NextResponse.json({ ok: true, bookingId: booking.id });
}
