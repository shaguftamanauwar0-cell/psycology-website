"use client";

import { useCallback, useEffect, useState } from "react";
import { getPlan, priceLabel } from "@/lib/pricing";

type SlotRef = { starts_at: string; duration_min: number };
type Booking = {
  id: string;
  plan: string;
  amount: number;
  name: string;
  age: number | null;
  gender: string | null;
  location: string | null;
  email: string;
  reason: string | null;
  feelings: string[];
  topics: string[];
  spoken_before: string | null;
  language: string | null;
  desired_outcome: string | null;
  notes: string | null;
  status: string;
  meeting_link: string | null;
  admin_note: string | null;
  created_at: string;
  slot_id: string | null;
  slots: SlotRef | SlotRef[] | null;
};
type Slot = { id: string; starts_at: string; duration_min: number; status: string };

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};
const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-peach/40 text-clay border-clay/30",
  paid: "bg-accent-soft/50 text-accent-deep border-accent/30",
  confirmed: "bg-forest text-cream border-forest",
  cancelled: "bg-surface-strong text-muted border-border-strong",
  completed: "bg-sage/40 text-forest border-sage",
};

function slotOf(b: Booking): SlotRef | null {
  if (!b.slots) return null;
  return Array.isArray(b.slots) ? b.slots[0] ?? null : b.slots;
}
function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short",
    hour: "numeric", minute: "2-digit",
  });
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState<"bookings" | "slots">("bookings");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [bRes, sRes] = await Promise.all([
      fetch("/api/admin/bookings"),
      fetch("/api/admin/slots"),
    ]);
    if (bRes.status === 401 || sRes.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    setAuthed(true);
    const b = await bRes.json().catch(() => ({ bookings: [] }));
    const s = await sRes.json().catch(() => ({ slots: [] }));
    setBookings(b.bookings ?? []);
    setSlots(s.slots ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setPassword(""); loadAll(); }
    else {
      const b = await res.json().catch(() => ({}));
      setLoginErr(b.error || "Login failed.");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setBookings([]); setSlots([]);
  }

  if (authed === null) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>;
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <form onSubmit={login} className="w-full max-w-sm rounded-[18px] border border-hairline bg-canvas p-7 shadow-[0_18px_50px_-30px_rgba(20,52,42,0.4)]">
          <h1 className="font-serif text-2xl text-ink">Admin access</h1>
          <p className="mt-1 text-sm text-body">Enter the admin password to manage bookings and slots.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="mt-5 w-full rounded-md border border-hairline bg-canvas px-4 py-3 text-[15px] text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
          {loginErr && <p className="mt-3 text-sm text-clay">{loginErr}</p>}
          <button type="submit" className="mt-5 w-full rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-on-primary hover:bg-primary-active">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Admin dashboard</h1>
          <p className="mt-1 text-sm text-body">Manage booking requests and available slots.</p>
        </div>
        <button onClick={logout} className="rounded-[12px] border border-border-strong bg-canvas px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft">
          Sign out
        </button>
      </header>

      <div className="mt-7 flex gap-2 border-b border-hairline">
        {(["bookings", "slots"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? "border-forest text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t} {t === "bookings" ? `(${bookings.length})` : `(${slots.length})`}
          </button>
        ))}
        <button onClick={loadAll} className="ml-auto self-center text-sm text-accent-deep hover:opacity-70">
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      <div className="mt-6">
        {tab === "bookings"
          ? <BookingsTab bookings={bookings} onChanged={loadAll} />
          : <SlotsTab slots={slots} onChanged={loadAll} />}
      </div>
    </div>
  );
}

/* ─────────────────────────── Bookings ─────────────────────────── */

function BookingsTab({ bookings, onChanged }: { bookings: Booking[]; onChanged: () => void }) {
  if (bookings.length === 0) {
    return <p className="rounded-[14px] border border-hairline bg-canvas px-5 py-8 text-center text-sm text-muted">No booking requests yet.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {bookings.map((b) => <BookingCard key={b.id} b={b} onChanged={onChanged} />)}
    </div>
  );
}

function BookingCard({ b, onChanged }: { b: Booking; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(b.status);
  const [link, setLink] = useState(b.meeting_link ?? "");
  const [note, setNote] = useState(b.admin_note ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const slot = slotOf(b);
  const plan = getPlan(b.plan);

  async function save(notify: boolean) {
    setBusy(true); setMsg("");
    if (notify && !link.trim()) { setMsg("Add a meeting link first."); setBusy(false); return; }
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: b.id, status, meetingLink: link, adminNote: note, notify }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(data.error || "Save failed."); return; }
    setMsg(notify ? (data.emailed ? "Saved & emailed ✓" : data.emailError || "Saved (email failed)") : "Saved ✓");
    onChanged();
  }

  return (
    <div className="rounded-[16px] border border-hairline bg-canvas p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-ink">{b.name}</h3>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status] ?? ""}`}>
              {STATUS_LABELS[b.status] ?? b.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-body">
            {plan?.name} · {priceLabel(b.amount)} · {slot ? fmt(slot.starts_at) : "Flexible time"}
          </p>
          <a href={`mailto:${b.email}`} className="text-sm text-accent-deep hover:underline">{b.email}</a>
        </div>
        <div className="text-right text-xs text-muted">
          <p>Requested</p>
          <p>{fmt(b.created_at)}</p>
        </div>
      </div>

      <button onClick={() => setOpen((v) => !v)} className="mt-3 text-sm text-accent-deep hover:opacity-70">
        {open ? "Hide details ▲" : "View form details ▼"}
      </button>

      {open && (
        <dl className="mt-3 grid gap-x-6 gap-y-2 rounded-[12px] border border-hairline bg-surface-soft/50 p-4 text-sm sm:grid-cols-2">
          <Detail k="Age" v={b.age?.toString()} />
          <Detail k="Gender" v={b.gender} />
          <Detail k="Location" v={b.location} />
          <Detail k="Language" v={b.language} />
          <Detail k="Feelings" v={b.feelings?.join(", ")} />
          <Detail k="Topics" v={b.topics?.join(", ")} />
          <Detail k="Spoken before" v={b.spoken_before} />
          <Detail k="Reason" v={b.reason} full />
          <Detail k="Desired outcome" v={b.desired_outcome} full />
          <Detail k="Notes" v={b.notes} full />
        </dl>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-hairline pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent">
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Meeting link (Google Meet / Zoom)"
            className="min-w-[220px] flex-1 rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent" />
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note to include in the email to the user"
          className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent" />
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={busy} onClick={() => save(false)}
            className="rounded-[12px] border border-border-strong bg-canvas px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft disabled:opacity-60">
            Save
          </button>
          <button disabled={busy} onClick={() => save(true)}
            className="rounded-[12px] bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-active disabled:opacity-60">
            Save &amp; email meeting link
          </button>
          {msg && <span className="text-sm text-body">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

function Detail({ k, v, full }: { k: string; v: string | null | undefined; full?: boolean }) {
  if (!v) return null;
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-xs uppercase tracking-[0.1em] text-muted">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
}

/* ─────────────────────────── Slots ─────────────────────────── */

function SlotsTab({ slots, onChanged }: { slots: Slot[]; onChanged: () => void }) {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("21:00");
  const [len, setLen] = useState(30);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function buildTimes(): string[] {
    if (!date) return [];
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const out: string[] = [];
    for (let t = startMin; t + len <= endMin; t += len) {
      const hh = String(Math.floor(t / 60)).padStart(2, "0");
      const mm = String(t % 60).padStart(2, "0");
      // Interpreted in the admin's local timezone.
      const d = new Date(`${date}T${hh}:${mm}:00`);
      if (!Number.isNaN(d.getTime())) out.push(d.toISOString());
    }
    return out;
  }

  const preview = buildTimes();

  async function create() {
    setBusy(true); setMsg("");
    const times = buildTimes();
    if (times.length === 0) { setMsg("Pick a date and a valid time range."); setBusy(false); return; }
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots: times.map((t) => ({ startsAt: t, durationMin: len })) }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(data.error || "Failed to create slots."); return; }
    setMsg(`Created ${data.created} slot${data.created === 1 ? "" : "s"} ✓`);
    onChanged();
  }

  async function del(id: string) {
    await fetch("/api/admin/slots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onChanged();
  }

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    const day = new Date(s.starts_at).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long",
    });
    (acc[day] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[16px] border border-hairline bg-canvas p-5">
        <h3 className="text-lg font-medium text-ink">Generate slots</h3>
        <p className="mt-1 text-sm text-body">
          Creates back-to-back slots for a day (like Google Calendar). Times use your device&apos;s timezone.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-hairline bg-canvas px-3 py-2 text-ink outline-none focus:border-accent" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">From</span>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)}
              className="rounded-md border border-hairline bg-canvas px-3 py-2 text-ink outline-none focus:border-accent" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">To</span>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)}
              className="rounded-md border border-hairline bg-canvas px-3 py-2 text-ink outline-none focus:border-accent" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Length (min)</span>
            <input type="number" min={10} step={5} value={len} onChange={(e) => setLen(Number(e.target.value))}
              className="rounded-md border border-hairline bg-canvas px-3 py-2 text-ink outline-none focus:border-accent" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button disabled={busy} onClick={create}
            className="rounded-[12px] bg-primary px-5 py-2.5 text-sm font-medium text-on-primary hover:bg-primary-active disabled:opacity-60">
            Create {preview.length > 0 ? `${preview.length} ` : ""}slot{preview.length === 1 ? "" : "s"}
          </button>
          {msg && <span className="text-sm text-body">{msg}</span>}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-ink">Upcoming slots</h3>
        {slots.length === 0 ? (
          <p className="mt-3 rounded-[14px] border border-hairline bg-canvas px-5 py-8 text-center text-sm text-muted">
            No slots yet. Generate some above — they&apos;ll appear on the landing page for users to pick.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            {Object.entries(grouped).map(([day, daySlots]) => (
              <div key={day} className="rounded-[14px] border border-hairline bg-canvas p-4">
                <p className="text-sm font-medium text-ink">{day}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {daySlots.map((s) => (
                    <span key={s.id}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                        s.status === "available"
                          ? "border-hairline bg-surface-soft text-ink"
                          : "border-border-strong bg-surface-strong text-muted"
                      }`}>
                      {new Date(s.starts_at).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" })}
                      {s.status !== "available" && <em className="not-italic text-xs">· {s.status}</em>}
                      <button onClick={() => del(s.id)} title="Delete slot" className="text-muted hover:text-clay">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
