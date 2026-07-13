import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendContactEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string; company?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields.
  if (body.company) return NextResponse.json({ ok: true });

  const name = (body.name ?? "").toString().trim().slice(0, 120);
  const email = (body.email ?? "").toString().trim().slice(0, 200);
  const message = (body.message ?? "").toString().trim().slice(0, 4000);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please fill in your name, email, and message." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Persist to Postgres when configured (best-effort — don't block on it).
  const sql = getDb();
  if (sql) {
    try {
      await sql`insert into messages (name, email, message) values (${name}, ${email}, ${message})`;
    } catch (err) {
      console.error("[contact] insert failed:", err);
    }
  } else {
    console.warn("[contact] DB not configured; message not persisted:", { name, email });
  }

  sendContactEmail({ name, email, message }).catch((err) =>
    console.error("[contact] email failed:", err),
  );

  return NextResponse.json({ ok: true });
}
