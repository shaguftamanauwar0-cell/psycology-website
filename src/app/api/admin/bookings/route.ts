import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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

  const sql = getDb();
  if (!sql) return NextResponse.json({ bookings: [] });

  try {
    const rows = await sql`
      select b.*, s.starts_at as slot_starts_at, s.duration_min as slot_duration
      from bookings b
      left join slots s on s.id = b.slot_id
      order by b.created_at desc
      limit 500`;
    const bookings = rows.map((r) => ({
      ...r,
      slots: r.slot_starts_at
        ? { starts_at: r.slot_starts_at, duration_min: r.slot_duration }
        : null,
    }));
    return NextResponse.json({ bookings });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * Update a booking. Body: { id, status?, meetingLink?, adminNote?, notify? }
 * When notify is true and a meeting link is present, emails the user.
 */
export async function PATCH(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const sql = getDb();
  if (!sql) {
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
  if (body.status !== undefined && !VALID_STATUS.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    const current = await sql`select * from bookings where id = ${id}`;
    if (current.length === 0) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    const c = current[0];

    const newStatus = body.status ?? c.status;
    const newLink =
      body.meetingLink !== undefined
        ? body.meetingLink.toString().trim().slice(0, 500) || null
        : c.meeting_link;
    const newNote =
      body.adminNote !== undefined
        ? body.adminNote.toString().trim().slice(0, 2000) || null
        : c.admin_note;

    await sql`
      update bookings
      set status = ${newStatus}, meeting_link = ${newLink}, admin_note = ${newNote}
      where id = ${id}`;

    // Keep slot status in sync with the booking lifecycle.
    if (c.slot_id && body.status) {
      if (body.status === "confirmed" || body.status === "paid") {
        await sql`update slots set status = 'booked' where id = ${c.slot_id}`;
      } else if (body.status === "cancelled") {
        await sql`update slots set status = 'available' where id = ${c.slot_id}`;
      }
    }

    let emailed = false;
    if (body.notify && newLink) {
      let slotStarts: Date | null = null;
      if (c.slot_id) {
        const s = await sql`select starts_at from slots where id = ${c.slot_id}`;
        slotStarts = (s[0]?.starts_at as Date) ?? null;
      }
      try {
        await sendMeetingLinkEmail({
          to: c.email,
          name: (c.name || "there").split(" ")[0],
          meetingLink: newLink,
          slotStartsAt: slotStarts ? slotStarts.toISOString() : null,
          note: newNote,
        });
        emailed = true;
      } catch (err) {
        console.error("[bookings] meeting link email failed:", err);
        return NextResponse.json({
          ok: true,
          emailed: false,
          emailError: "Saved, but the email failed to send.",
        });
      }
    }

    return NextResponse.json({ ok: true, emailed });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
