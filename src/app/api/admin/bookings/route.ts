import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseAdmin";
import { isAdminRequest } from "@/lib/adminAuth";
import { sendMeetingLinkEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guard(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

const VALID_STATUS = [
  "pending_payment",
  "paid",
  "confirmed",
  "cancelled",
  "completed",
];

/** List all bookings, newest first, with their slot time joined in. */
export async function GET(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ bookings: [] });

  const { data, error } = await sb
    .from("bookings")
    .select(
      "id, plan, amount, name, age, gender, location, email, reason, feelings, topics, spoken_before, language, desired_outcome, notes, status, meeting_link, admin_note, created_at, slot_id, slots(starts_at, duration_min)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ bookings: data ?? [] });
}

/**
 * Update a booking. Body: { id, status?, meetingLink?, adminNote?, notify? }
 * When notify is true and a meeting link is present, emails the user.
 */
export async function PATCH(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  let body: {
    id?: string;
    status?: string;
    meetingLink?: string;
    adminNote?: string;
    notify?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = (body.id ?? "").toString();
  if (!id) return NextResponse.json({ error: "Missing booking id." }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.meetingLink !== undefined) {
    patch.meeting_link = body.meetingLink.toString().trim().slice(0, 500) || null;
  }
  if (body.adminNote !== undefined) {
    patch.admin_note = body.adminNote.toString().trim().slice(0, 2000) || null;
  }

  const { data: updated, error } = await sb
    .from("bookings")
    .update(patch)
    .eq("id", id)
    .select("name, email, meeting_link, admin_note, slot_id, slots(starts_at)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Keep slot status in sync with the booking lifecycle.
  if (updated?.slot_id && body.status) {
    if (body.status === "confirmed" || body.status === "paid") {
      await sb.from("slots").update({ status: "booked" }).eq("id", updated.slot_id);
    } else if (body.status === "cancelled") {
      await sb.from("slots").update({ status: "available" }).eq("id", updated.slot_id);
    }
  }

  let emailed = false;
  if (body.notify && updated?.meeting_link) {
    const slot = Array.isArray(updated.slots) ? updated.slots[0] : updated.slots;
    try {
      await sendMeetingLinkEmail({
        to: updated.email,
        name: (updated.name || "there").split(" ")[0],
        meetingLink: updated.meeting_link,
        slotStartsAt: slot?.starts_at ?? null,
        note: updated.admin_note ?? null,
      });
      emailed = true;
    } catch (err) {
      console.error("[bookings] meeting link email failed:", err);
      return NextResponse.json(
        { ok: true, emailed: false, emailError: "Saved, but the email failed to send." },
      );
    }
  }

  return NextResponse.json({ ok: true, emailed });
}
