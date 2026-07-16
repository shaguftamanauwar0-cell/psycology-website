import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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
  (v ?? "").toString().trim().slice(0, max) || null;

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

  const sql = getDb();
  if (!sql) {
    return NextResponse.json(
      { error: "Bookings aren't available yet. Please try again shortly." },
      { status: 503 },
    );
  }

  const slotId = body.slotId?.toString() || null;

  try {
    // Free first session is one-per-person: reject if this email booked before.
    if (plan.amount === 0) {
      const prior = await sql`
        select 1 from bookings where lower(email) = lower(${email}) limit 1`;
      if (prior.length > 0) {
        return NextResponse.json(
          {
            error:
              "The free first session is only for your very first visit — it looks like you've booked with this email before. Please choose a paid plan to continue.",
          },
          { status: 409 },
        );
      }
    }

    // Claim the slot atomically: only succeeds if still 'available'.
    let slotStartsAt: Date | null = null;
    if (slotId) {
      const claimed = await sql`
        update slots set status = 'held'
        where id = ${slotId} and status = 'available'
        returning id, starts_at`;
      if (claimed.length === 0) {
        return NextResponse.json(
          { error: "Sorry, that time was just taken. Please pick another slot." },
          { status: 409 },
        );
      }
      slotStartsAt = claimed[0].starts_at as Date;
    }

    const feelings = asStringArray(body.feelings);
    const topics = asStringArray(body.topics);
    const ageInt = Math.max(0, Math.min(120, Math.round(age)));
    const location = str(body.location, 120);
    const reason = str(body.reason);
    const spokenBefore = str(body.spokenBefore, 120);
    const language = str(body.language, 60);
    const desiredOutcome = str(body.desiredOutcome);
    const notes = str(body.notes);

    let inserted;
    try {
      inserted = await sql`
        insert into bookings
          (slot_id, plan, amount, name, age, gender, location, email, reason,
           feelings, topics, spoken_before, language, desired_outcome, notes, status)
        values
          (${slotId}, ${plan.id}, ${plan.amount}, ${name}, ${ageInt}, ${gender},
           ${location}, ${email}, ${reason}, ${feelings}, ${topics},
           ${spokenBefore}, ${language}, ${desiredOutcome}, ${notes}, 'pending_payment')
        returning id`;
    } catch (insertErr) {
      // Release the slot we just held so it isn't stuck.
      if (slotId) {
        await sql`update slots set status = 'available' where id = ${slotId}`;
      }
      // Unique-violation on the "one free session per email" index.
      if ((insertErr as { code?: string })?.code === "23505") {
        return NextResponse.json(
          {
            error:
              "The free first session is only for your very first visit — please choose a paid plan to continue.",
          },
          { status: 409 },
        );
      }
      throw insertErr;
    }

    sendAdminBookingEmail({
      name, age: ageInt, gender, location, email,
      plan: plan.id, amount: plan.amount,
      slotStartsAt: slotStartsAt ? slotStartsAt.toISOString() : null,
      reason, feelings, topics,
      spokenBefore, language, desiredOutcome, notes,
    }).catch((err) => console.error("[book] admin email failed:", err));

    return NextResponse.json({ ok: true, bookingId: inserted[0].id });
  } catch (err) {
    console.error("[book] failed:", err);
    return NextResponse.json(
      { error: "We couldn't save your booking just now. Please try again." },
      { status: 500 },
    );
  }
}
