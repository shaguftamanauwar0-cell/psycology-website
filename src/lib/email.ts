import nodemailer from "nodemailer";
import { getPlan, priceLabel } from "./pricing";

/** Whether Gmail SMTP is configured. */
export function emailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function transporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

/** Admin recipients: the sending account + optional NOTIFY_EMAIL. */
function adminRecipients(): string {
  return [process.env.GMAIL_USER, process.env.NOTIFY_EMAIL]
    .filter(Boolean)
    .join(", ");
}

function fmtSlot(startsAt: string | null | undefined): string {
  if (!startsAt) return "No specific time picked";
  try {
    return new Date(startsAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return startsAt;
  }
}

function row(label: string, value: string | undefined | null): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 12px;background:#f3ead7;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top;border-bottom:1px solid #e5e7eb">${label}</td>
    <td style="padding:8px 12px;font-size:14px;color:#14342a;vertical-align:top;border-bottom:1px solid #e5e7eb">${value}</td>
  </tr>`;
}

export type BookingEmailData = {
  name: string;
  age?: number | null;
  gender?: string | null;
  location?: string | null;
  email: string;
  plan: string;
  amount: number;
  slotStartsAt?: string | null;
  reason?: string | null;
  feelings: string[];
  topics: string[];
  spokenBefore?: string | null;
  language?: string | null;
  desiredOutcome?: string | null;
  notes?: string | null;
};

/** Notify the admin(s) that a new booking request came in. */
export async function sendAdminBookingEmail(b: BookingEmailData): Promise<void> {
  if (!emailConfigured()) {
    console.warn("[email] Gmail not configured — skipping admin notification");
    return;
  }
  const plan = getPlan(b.plan);
  const planLabel = plan ? `${plan.name} — ${priceLabel(b.amount)}` : priceLabel(b.amount);
  const isFree = b.amount === 0;

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fffdf9;font-family:system-ui,sans-serif">
    <div style="max-width:580px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
      <div style="background:#14342a;padding:24px 28px">
        <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#aecbb9">New booking · ${isFree ? "free first session" : "awaiting payment"}</p>
        <h1 style="margin:6px 0 0;font-size:22px;color:#f3ead7;font-weight:600">${b.name} requested a session</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#aecbb9">${planLabel} · ${fmtSlot(b.slotStartsAt)}</p>
      </div>
      <div style="padding:24px 28px">
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
          ${row("Plan", planLabel)}
          ${row("Requested time", fmtSlot(b.slotStartsAt))}
          ${row("Name", b.name)}
          ${row("Age", b.age ? String(b.age) : null)}
          ${row("Gender", b.gender)}
          ${row("Location", b.location)}
          ${row("Email", `<a href="mailto:${b.email}" style="color:#0e8074">${b.email}</a>`)}
          ${row("Feelings", b.feelings.join(", ") || null)}
          ${row("Topics", b.topics.join(", ") || null)}
          ${row("Spoken before", b.spokenBefore)}
          ${row("Language", b.language)}
          ${row("Reason", b.reason)}
          ${row("Desired outcome", b.desiredOutcome)}
          ${row("Notes", b.notes)}
        </table>
        <div style="margin-top:20px;padding:14px 16px;background:${isFree ? "#f0faf7" : "#fff4e6"};border-radius:10px;border:1px solid ${isFree ? "#aecbb9" : "#e6c78f"}">
          <p style="margin:0;font-size:13px;color:${isFree ? "#14342a" : "#7a5a1e"}">${isFree ? "🌱 This is a free first session — just send the meeting link from the admin panel." : "⏳ Waiting for you to confirm payment, then send the meeting link from the admin panel."}</p>
        </div>
        <p style="margin:18px 0 0;font-size:13px;color:#6b7280">Open your <b>/admin</b> panel to confirm payment and send ${b.name} the meeting link.</p>
      </div>
    </div></body></html>`;

  await transporter().sendMail({
    from: `"Shagufta's Website" <${process.env.GMAIL_USER}>`,
    to: adminRecipients(),
    replyTo: b.email,
    subject: `New booking · ${b.name} · ${planLabel}`,
    html,
  });
}

/** Send the confirmed meeting link to the user. */
export async function sendMeetingLinkEmail(opts: {
  to: string;
  name: string;
  meetingLink: string;
  slotStartsAt?: string | null;
  note?: string | null;
}): Promise<void> {
  if (!emailConfigured()) {
    console.warn("[email] Gmail not configured — skipping meeting link email");
    return;
  }
  const when = fmtSlot(opts.slotStartsAt);
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fffdf9;font-family:system-ui,sans-serif">
    <div style="max-width:520px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
      <div style="background:#14342a;padding:24px 28px">
        <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#aecbb9">You're confirmed</p>
        <h1 style="margin:6px 0 0;font-size:22px;color:#f3ead7;font-weight:600">Your session is booked</h1>
      </div>
      <div style="padding:24px 28px">
        <p style="margin:0 0 14px;font-size:15px;color:#14342a">Hi ${opts.name},</p>
        <p style="margin:0 0 14px;font-size:15px;color:#14342a;line-height:1.6">Your payment has been received and your listening &amp; reflection session is confirmed${opts.slotStartsAt ? ` for <b>${when}</b>` : ""}. I'm looking forward to talking with you.</p>
        <a href="${opts.meetingLink}" style="display:inline-block;margin:8px 0 4px;padding:12px 22px;background:#0e8074;color:#fff;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none">Join the session →</a>
        <p style="margin:12px 0 0;font-size:13px;color:#6b7280;word-break:break-all">Or paste this link into your browser:<br>${opts.meetingLink}</p>
        ${opts.note ? `<div style="margin-top:18px;padding:14px 16px;background:#f0faf7;border-radius:10px;border:1px solid #aecbb9"><p style="margin:0;font-size:14px;color:#14342a">${opts.note}</p></div>` : ""}
        <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.6">Everything you shared stays confidential. If you need to reschedule, just reply to this email.</p>
        <p style="margin:16px 0 0;font-size:14px;color:#14342a">Warmly,<br>Shagufta</p>
      </div>
    </div></body></html>`;

  await transporter().sendMail({
    from: `"Shagufta Manauwar" <${process.env.GMAIL_USER}>`,
    to: opts.to,
    cc: adminRecipients(),
    subject: "Your session is confirmed — here's your meeting link",
    html,
  });
}

/** Notify admin(s) of a new contact-form message. */
export async function sendContactEmail(m: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  if (!emailConfigured()) {
    console.warn("[email] Gmail not configured — skipping contact email");
    return;
  }
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fffdf9;font-family:system-ui,sans-serif">
    <div style="max-width:520px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
      <div style="background:#14342a;padding:22px 26px">
        <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#aecbb9">New message</p>
        <h1 style="margin:6px 0 0;font-size:20px;color:#f3ead7;font-weight:600">${m.name} said hello</h1>
      </div>
      <div style="padding:22px 26px">
        <p style="margin:0 0 6px;font-size:13px;color:#6b7280">From <a href="mailto:${m.email}" style="color:#0e8074">${m.email}</a></p>
        <p style="margin:12px 0 0;font-size:15px;color:#14342a;line-height:1.6;white-space:pre-wrap">${m.message}</p>
      </div>
    </div></body></html>`;

  await transporter().sendMail({
    from: `"Shagufta's Website" <${process.env.GMAIL_USER}>`,
    to: adminRecipients(),
    replyTo: m.email,
    subject: `New message from ${m.name}`,
    html,
  });
}
