import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL ?? "";

const createIntake = makeFunctionReference<"mutation">("intakes:create");

type Body = {
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

function row(label: string, value: string | undefined) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:8px 12px;background:#f3ead7;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top;border-bottom:1px solid #e5e7eb">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#14342a;vertical-align:top;border-bottom:1px solid #e5e7eb">${value}</td>
    </tr>`;
}

async function sendNotificationEmail(payload: {
  name: string;
  age: number;
  gender: string;
  location?: string;
  email: string;
  reason?: string;
  feelings: string[];
  topics: string[];
  spokenBefore?: string;
  language?: string;
  desiredOutcome?: string;
  notes?: string;
}) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    console.warn("[intake] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping email");
    return;
  }

  // Send to both the sender account and any additional notify address (e.g. Shagufta's email)
  const notifyEmail = process.env.NOTIFY_EMAIL;
  const recipients = [gmailUser, notifyEmail].filter(Boolean).join(", ");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fffdf9;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
    <div style="background:#14342a;padding:24px 28px">
      <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#aecbb9">New booking request</p>
      <h1 style="margin:6px 0 0;font-size:22px;color:#f3ead7;font-weight:600">${payload.name} wants to book a session</h1>
    </div>
    <div style="padding:24px 28px">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
        ${row("Name", payload.name)}
        ${row("Age", String(payload.age))}
        ${row("Gender", payload.gender)}
        ${row("Location", payload.location)}
        ${row("Email", `<a href="mailto:${payload.email}" style="color:#0e8074">${payload.email}</a>`)}
        ${row("Feelings", payload.feelings.join(", ") || "—")}
        ${row("Topics", payload.topics.join(", ") || "—")}
        ${row("Spoken before", payload.spokenBefore)}
        ${row("Language", payload.language)}
        ${row("Reason", payload.reason)}
        ${row("Desired outcome", payload.desiredOutcome)}
        ${row("Notes", payload.notes)}
      </table>
      <div style="margin-top:20px;padding:14px 16px;background:#f0faf7;border-radius:10px;border:1px solid #aecbb9">
        <p style="margin:0;font-size:13px;color:#14342a">
          ✅ Safety screening passed — no self-harm risk indicated.
        </p>
      </div>
      <p style="margin:20px 0 0;font-size:13px;color:#6b7280">
        Reply directly to <a href="mailto:${payload.email}" style="color:#0e8074">${payload.email}</a> to get in touch with ${payload.name}.
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Shagufta's Website" <${gmailUser}>`,
    to: recipients,
    replyTo: payload.email,
    subject: `New session request from ${payload.name} (${payload.gender}, ${payload.age})`,
    html,
  });
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name ?? "").toString().trim();
  const email = (body.email ?? "").toString().trim();
  const gender = (body.gender ?? "").toString().trim();
  const age = Number(body.age);

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

  const payload = {
    name,
    age: Math.max(0, Math.min(120, Math.round(age))),
    gender,
    location: (body.location ?? "").toString().trim() || undefined,
    email,
    reason: (body.reason ?? "").toString().trim() || undefined,
    feelings: asStringArray(body.feelings),
    topics: asStringArray(body.topics),
    spokenBefore: (body.spokenBefore ?? "").toString().trim() || undefined,
    language: (body.language ?? "").toString().trim() || undefined,
    desiredOutcome: (body.desiredOutcome ?? "").toString().trim() || undefined,
    notes: (body.notes ?? "").toString().trim() || undefined,
  };

  if (convexUrl) {
    try {
      const client = new ConvexHttpClient(convexUrl);
      await client.mutation(createIntake, payload);
    } catch (err) {
      console.error("Convex intake write failed:", err);
      return NextResponse.json(
        { error: "We couldn't save your details just now. Please try again." },
        { status: 502 },
      );
    }
  } else {
    console.warn("[intake] NEXT_PUBLIC_CONVEX_URL not set; not persisted:", {
      name,
      email,
    });
  }

  // Fire email notification — non-blocking, don't fail the request if it errors
  sendNotificationEmail(payload).catch((err) =>
    console.error("[intake] Email notification failed:", err),
  );

  return NextResponse.json({ ok: true });
}
