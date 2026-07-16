"use client";

import { useEffect, useState } from "react";
import { PLAN_LIST, PLANS, priceLabel, type PlanId } from "@/lib/pricing";

const FEELINGS = [
  "Calm", "Confused", "Overwhelmed", "Anxious", "Sad",
  "Angry", "Frustrated", "Lonely", "Other",
];

const TOPICS = [
  "Relationships", "Family", "Studies", "Career", "Self-confidence",
  "Loneliness", "Stress", "Motivation", "Decision-making",
  "Personal growth", "Other",
];

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say", "Other"];

const SPOKEN = [
  "No, this is the first time",
  "Yes — with friends or family",
  "Yes — with a professional",
  "Prefer not to say",
];

const LANGUAGES = ["English", "Hindi", "Urdu", "Other"];

type Slot = { id: string; starts_at: string; duration_min: number };
type Step = "select" | "about" | "story" | "safety" | "done";
type Status = "idle" | "sending" | "error";

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "";
const UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME || "Shagufta Manauwar";

const inputCls =
  "w-full rounded-md border border-hairline bg-canvas px-4 py-3 text-[15px] text-ink placeholder:text-muted/70 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft";

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-accent bg-accent text-on-primary"
          : "border-hairline bg-canvas text-body hover:border-border-strong"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-accent-deep"> *</span>}
        {!required && <span className="font-normal text-muted"> (optional)</span>}
      </span>
      {hint && <span className="-mt-1 text-xs text-muted">{hint}</span>}
      {children}
    </label>
  );
}

const CRISIS_RESOURCES = [
  { name: "Emergency services", detail: "Call your local emergency number (112 in India)" },
  { name: "KIRAN Mental Health Helpline", detail: "1800-599-0019 (24/7, India)" },
  { name: "Vandrevala Foundation", detail: "1860-266-2345 / 1800-233-3330 (24/7)" },
  { name: "iCall (TISS)", detail: "9152987821 (Mon–Sat, 8am–10pm)" },
  { name: "AASRA", detail: "+91-9820466726 (24/7)" },
];

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit",
  });
}

export default function IntakeBooking() {
  const [step, setStep] = useState<Step>("select");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [showCrisis, setShowCrisis] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // selection
  const [planId, setPlanId] = useState<PlanId | "">("");
  const [slotId, setSlotId] = useState<string>("");
  const [flexible, setFlexible] = useState(false);

  // form
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [feelings, setFeelings] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [spokenBefore, setSpokenBefore] = useState("");
  const [language, setLanguage] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [safety, setSafety] = useState<"" | "yes" | "no">("");

  useEffect(() => {
    fetch("/api/slots")
      .then((r) => r.json())
      .then((d) => setSlots(Array.isArray(d.slots) ? d.slots : []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, []);

  const toggle = (arr: string[], set: (v: string[]) => void, value: string) =>
    set(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);

  function scrollTop() {
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }

  const selectedPlan = planId ? PLANS[planId] : null;
  const selectedSlot = slots.find((s) => s.id === slotId) || null;
  const isFree = selectedPlan?.amount === 0;

  // group slots by day for the picker
  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    const key = fmtDay(s.starts_at);
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  function goFromSelect() {
    setError("");
    if (!planId) return setError("Please choose a plan.");
    if (!flexible && slots.length > 0 && !slotId)
      return setError("Please pick a time, or choose “I'm flexible”.");
    setStep("about");
    scrollTop();
  }

  function goFromAbout() {
    setError("");
    if (!name.trim()) return setError("Please tell us your name or a nickname.");
    if (!age.trim() || !Number.isFinite(Number(age))) return setError("Please enter your age.");
    if (!gender) return setError("Please choose an option for gender.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Please enter a valid email address.");
    setStep("story");
    scrollTop();
  }

  async function submit() {
    setError("");
    if (safety === "") return setError("Please answer the safety question so we can keep you safe.");
    if (safety === "yes") return setShowCrisis(true);

    setStatus("sending");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId, slotId: flexible ? "" : slotId,
          name, age, gender, location, email, reason,
          feelings, topics, spokenBefore, language, desiredOutcome, notes,
        }),
      });
      const b = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(b.error || "Something went wrong.");
      setStatus("idle");
      setStep("done");
      scrollTop();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  // ---- Crisis screen ----
  if (showCrisis) {
    return (
      <div className="rounded-[18px] border border-clay/40 bg-peach/25 p-7 sm:p-9">
        <h3 className="font-serif text-2xl text-clay">Please reach out for support right now.</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-body">
          Thank you for being honest — that took courage. Because you&apos;re having thoughts of
          self-harm or suicide, these listening sessions aren&apos;t the right kind of support for
          what you&apos;re going through, and it wouldn&apos;t be safe to wait. You deserve to talk
          to someone trained to help with exactly this, today.
        </p>
        <p className="mt-3 text-[15px] font-medium text-ink">
          You are not alone, and your life matters. Please contact one of these now:
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {CRISIS_RESOURCES.map((r) => (
            <li key={r.name} className="flex flex-col rounded-md border border-clay/30 bg-canvas px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-ink">{r.name}</span>
              <span className="text-sm text-body">{r.detail}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">
          If you are outside India, please contact your local emergency number or a crisis helpline
          in your country. If you are in immediate danger, call emergency services right away.
        </p>
        <button type="button" onClick={() => { setShowCrisis(false); setSafety(""); }}
          className="mt-5 text-sm text-accent-deep underline underline-offset-4">
          Go back
        </button>
      </div>
    );
  }

  // ---- Payment-pending confirmation ----
  if (step === "done") {
    return (
      <div className="rounded-[18px] border border-accent/30 bg-canvas p-7 sm:p-9">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-on-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl text-ink">
          Thank you, {name.split(" ")[0] || "there"} — {isFree ? "you're all set." : "almost there."}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-body">
          Your request has been received{selectedSlot ? ` for ${fmtDay(selectedSlot.starts_at)} at ${fmtTime(selectedSlot.starts_at)}` : ""}.
          {isFree
            ? " Your first session is completely free — there's nothing to pay."
            : ` To confirm your ${selectedPlan?.name.toLowerCase()} booking, please complete the payment below.`}
        </p>

        {!isFree && (
          <div className="mt-6 rounded-[14px] border border-hairline bg-surface-soft/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Amount to pay</span>
              <span className="font-serif text-2xl text-ink">₹{selectedPlan?.amount}</span>
            </div>

            <div className="mt-4 flex flex-col items-center border-t border-hairline pt-5">
              <p className="text-sm text-body">Scan to pay with any UPI app (PhonePe, GPay, Paytm)</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/upi-qr.jpg"
                alt="UPI payment QR code"
                width={220}
                height={220}
                className="mt-3 h-56 w-56 rounded-[12px] border border-hairline bg-canvas object-contain p-2"
              />
              {UPI_ID && (
                <div className="mt-3 flex items-center gap-3 rounded-md border border-hairline bg-canvas px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{UPI_ID}</p>
                    <p className="text-xs text-muted">{UPI_NAME}</p>
                  </div>
                  <CopyButton value={UPI_ID} />
                </div>
              )}
              <p className="mt-3 text-center text-xs text-muted">
                Please add your name <span className="font-medium text-ink">({name.split(" ")[0] || "your name"})</span> in
                the payment note so Shagufta can match it to your booking.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 rounded-[12px] border border-clay/25 bg-peach/20 px-4 py-3">
          <p className="text-sm leading-relaxed text-clay">
            {isFree ? (
              <>
                🌱 <span className="font-medium">Shagufta will email your meeting link</span> to{" "}
                <span className="font-medium">{email}</span> shortly. Nothing else to do — just watch your inbox.
              </>
            ) : (
              <>
                ⏳ <span className="font-medium">Please wait while your payment is verified manually.</span> Once
                confirmed, Shagufta will email your meeting link to <span className="font-medium">{email}</span> shortly.
              </>
            )}
          </p>
        </div>

        <p className="mt-5 text-xs text-muted">
          Everything you shared is kept private and confidential.
        </p>
      </div>
    );
  }

  const stepIndex = { select: 0, about: 1, story: 2, safety: 3, done: 3 }[step];

  return (
    <div className="rounded-[18px] border border-hairline bg-canvas p-6 sm:p-9">
      {/* progress */}
      <div className="mb-7 flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-medium transition-colors ${
              i <= stepIndex ? "bg-forest text-cream" : "bg-surface-strong text-muted"
            }`}>
              {i + 1}
            </span>
            {i < 3 && <span className={`h-px flex-1 ${i < stepIndex ? "bg-forest/50" : "bg-hairline"}`} />}
          </div>
        ))}
      </div>

      {/* STEP 1 — plan + time */}
      {step === "select" && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-deep">Step 1 of 4</p>
            <h3 className="mt-2 font-serif text-2xl text-ink">Choose your plan &amp; time</h3>
            <p className="mt-1 text-sm text-body">Pick what suits you. Payment is confirmed after you submit.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PLAN_LIST.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlanId(p.id)}
                aria-pressed={planId === p.id}
                className={`flex flex-col rounded-[14px] border p-4 text-left transition-colors ${
                  planId === p.id
                    ? "border-accent bg-accent-soft/40 ring-2 ring-accent-soft"
                    : "border-hairline bg-canvas hover:border-border-strong"
                }`}
              >
                <span className="text-sm font-medium text-ink">{p.name}</span>
                <span className="mt-1 font-serif text-2xl text-ink">{priceLabel(p.amount)}</span>
                <span className="text-xs text-muted">{p.calls}</span>
              </button>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Pick a time</p>
            {slotsLoading ? (
              <p className="mt-2 text-sm text-muted">Loading available times…</p>
            ) : slots.length === 0 ? (
              <div className="mt-2 rounded-[12px] border border-hairline bg-surface-soft/60 px-4 py-3">
                <p className="text-sm text-body">
                  No times are published right now. Continue and choose “I&apos;m flexible” —
                  Shagufta will suggest a time by email.
                </p>
              </div>
            ) : (
              <div className="mt-3 flex max-h-64 flex-col gap-4 overflow-y-auto pr-1">
                {Object.entries(grouped).map(([day, daySlots]) => (
                  <div key={day}>
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">{day}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {daySlots.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setSlotId(s.id); setFlexible(false); }}
                          aria-pressed={slotId === s.id}
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                            slotId === s.id
                              ? "border-forest bg-forest text-cream"
                              : "border-hairline bg-canvas text-body hover:border-border-strong"
                          }`}
                        >
                          {fmtTime(s.starts_at)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-body">
              <input
                type="checkbox"
                checked={flexible}
                onChange={(e) => { setFlexible(e.target.checked); if (e.target.checked) setSlotId(""); }}
                className="h-4 w-4 rounded border-border-strong accent-[var(--color-accent,#0e8074)]"
              />
              I&apos;m flexible — let Shagufta suggest a time
            </label>
          </div>
        </div>
      )}

      {/* STEP 2 — about you */}
      {step === "about" && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-deep">Step 2 of 4</p>
            <h3 className="mt-2 font-serif text-2xl text-ink">A little about you</h3>
            <p className="mt-1 text-sm text-body">Just the basics. A first name or nickname is completely fine.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name (or nickname)" required>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="What should I call you?" />
            </Field>
            <Field label="Age" required>
              <input className={inputCls} value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" placeholder="e.g. 22" />
            </Field>
          </div>
          <Field label="Gender" required>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => <Chip key={g} label={g} active={gender === g} onClick={() => setGender(g)} />)}
            </div>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Country / City" hint="Helps with time zones.">
              <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Mumbai, India" />
            </Field>
            <Field label="Email" required>
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </Field>
          </div>
        </div>
      )}

      {/* STEP 3 — your story */}
      {step === "story" && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-deep">Step 3 of 4</p>
            <h3 className="mt-2 font-serif text-2xl text-ink">What&apos;s bringing you here</h3>
            <p className="mt-1 text-sm text-body">There are no right answers. Share whatever feels comfortable.</p>
          </div>
          <Field label="What made you decide to book this session?" hint="A sentence or two is plenty — or skip it.">
            <textarea className={`${inputCls} resize-none`} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="I've been feeling…" />
          </Field>
          <div>
            <p className="text-sm font-medium text-ink">How are you feeling right now?<span className="font-normal text-muted"> (choose any)</span></p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FEELINGS.map((f) => <Chip key={f} label={f} active={feelings.includes(f)} onClick={() => toggle(feelings, setFeelings, f)} />)}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-ink">What would you like to talk about?<span className="font-normal text-muted"> (choose any)</span></p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TOPICS.map((t) => <Chip key={t} label={t} active={topics.includes(t)} onClick={() => toggle(topics, setTopics, t)} />)}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Have you talked to anyone about this before?">
              <select className={inputCls} value={spokenBefore} onChange={(e) => setSpokenBefore(e.target.value)}>
                <option value="">Choose one…</option>
                {SPOKEN.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Preferred language for the session">
              <select className={inputCls} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="">Choose one…</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <Field label="What would feel like a good outcome from this session?">
            <textarea className={`${inputCls} resize-none`} rows={2} value={desiredOutcome} onChange={(e) => setDesiredOutcome(e.target.value)} placeholder="Even 'I'm not sure yet' is okay." />
          </Field>
          <Field label="Anything you'd like Shagufta to know beforehand?">
            <textarea className={`${inputCls} resize-none`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
          </Field>
        </div>
      )}

      {/* STEP 4 — safety */}
      {step === "safety" && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-deep">Step 4 of 4</p>
            <h3 className="mt-2 font-serif text-2xl text-ink">One important question</h3>
            <p className="mt-1 text-sm text-body">This helps make sure you get the right kind of support. Please answer honestly.</p>
          </div>
          <div className="rounded-[14px] border border-clay/30 bg-peach/15 p-5">
            <p className="text-[15px] font-medium text-ink">
              Are you currently experiencing thoughts of self-harm or suicide?<span className="text-accent-deep"> *</span>
            </p>
            <div className="mt-4 flex gap-3">
              {(["no", "yes"] as const).map((val) => (
                <button key={val} type="button" onClick={() => setSafety(val)} aria-pressed={safety === val}
                  className={`flex-1 rounded-[12px] border px-5 py-3 text-sm font-medium capitalize transition-colors ${
                    safety === val ? "border-forest bg-forest text-cream" : "border-border-strong bg-canvas text-ink hover:bg-surface-soft"
                  }`}>
                  {val === "no" ? "No" : "Yes"}
                </button>
              ))}
            </div>
            {safety === "yes" && (
              <p className="mt-4 text-sm leading-relaxed text-clay">
                Thank you for your honesty. Because of this, a listening session isn&apos;t the safe
                or right support for you right now — you deserve trained, professional help today.
                Press <span className="font-medium">Continue</span> and we&apos;ll show you people who can help immediately.
              </p>
            )}
          </div>
          <p className="text-sm text-body">
            By continuing, you understand these sessions are{" "}
            <span className="font-medium text-ink">not therapy, counseling, diagnosis, or medical advice</span>,
            and are not a substitute for professional or emergency care.
          </p>
        </div>
      )}

      {error && <p className="mt-5 text-sm text-clay">{error}</p>}

      {/* nav */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step !== "select" ? (
          <button type="button"
            onClick={() => {
              setError("");
              setStep(step === "about" ? "select" : step === "story" ? "about" : "story");
              scrollTop();
            }}
            className="rounded-[14px] border border-border-strong bg-canvas px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-soft">
            Back
          </button>
        ) : <span className="text-xs text-muted">Takes about 2 minutes</span>}

        {step === "select" && (
          <button type="button" onClick={goFromSelect} className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active">
            Continue <Arrow />
          </button>
        )}
        {step === "about" && (
          <button type="button" onClick={goFromAbout} className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active">
            Continue <Arrow />
          </button>
        )}
        {step === "story" && (
          <button type="button" onClick={() => { setStep("safety"); scrollTop(); }} className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active">
            Continue <Arrow />
          </button>
        )}
        {step === "safety" && (
          <button type="button" onClick={submit} disabled={status === "sending"}
            className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:opacity-60">
            {status === "sending" ? "Submitting…" : safety === "yes" ? "Continue" : "Submit booking request"}
          </button>
        )}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      className="flex-none rounded-md border border-hairline bg-surface-soft px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-surface-strong"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
