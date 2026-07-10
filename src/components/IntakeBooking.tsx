"use client";

import { useState } from "react";
import BookingButton, { BOOKING_URL } from "./BookingButton";

const FEELINGS = [
  "Calm",
  "Confused",
  "Overwhelmed",
  "Anxious",
  "Sad",
  "Angry",
  "Frustrated",
  "Lonely",
  "Other",
];

const TOPICS = [
  "Relationships",
  "Family",
  "Studies",
  "Career",
  "Self-confidence",
  "Loneliness",
  "Stress",
  "Motivation",
  "Decision-making",
  "Personal growth",
  "Other",
];

const GENDERS = [
  "Female",
  "Male",
  "Non-binary",
  "Prefer not to say",
  "Other",
];

const SPOKEN = [
  "No, this is the first time",
  "Yes — with friends or family",
  "Yes — with a professional",
  "Prefer not to say",
];

const LANGUAGES = ["English", "Hindi", "Urdu", "Other"];

type Status = "idle" | "sending" | "error";

const inputCls =
  "w-full rounded-md border border-hairline bg-canvas px-4 py-3 text-[15px] text-ink placeholder:text-muted/70 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft";

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-accent-deep"> *</span>}
        {!required && (
          <span className="font-normal text-muted"> (optional)</span>
        )}
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

export default function IntakeBooking() {
  // -1 = slot check pre-step, 0/1/2 = form steps, 3 = booking
  const [step, setStep] = useState(-1);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [showCrisis, setShowCrisis] = useState(false);

  // form state
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

  const toggle = (
    arr: string[],
    set: (v: string[]) => void,
    value: string,
  ) => {
    set(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  };

  function validateStep1(): string {
    if (!name.trim()) return "Please tell us your name or a nickname.";
    if (!age.trim() || !Number.isFinite(Number(age)))
      return "Please enter your age.";
    if (!gender) return "Please choose an option for gender.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Please enter a valid email address.";
    return "";
  }

  function next() {
    setError("");
    if (step === 0) {
      const err = validateStep1();
      if (err) return setError(err);
    }
    setStep((s) => s + 1);
    scrollTop();
  }

  function back() {
    setError("");
    setShowCrisis(false);
    setStep((s) => Math.max(-1, s - 1));
    scrollTop();
  }

  function scrollTop() {
    if (typeof document !== "undefined") {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  async function submit() {
    setError("");
    if (safety === "") {
      return setError("Please answer the safety question so we can keep you safe.");
    }
    if (safety === "yes") {
      setShowCrisis(true);
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age,
          gender,
          location,
          email,
          reason,
          feelings,
          topics,
          spokenBefore,
          language,
          desiredOutcome,
          notes,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Something went wrong.");
      }
      setStatus("idle");
      setStep(3);
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
        <h3 className="font-serif text-2xl text-clay">
          Please reach out for support right now.
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-body">
          Thank you for being honest — that took courage. Because you&apos;re
          having thoughts of self-harm or suicide, these listening sessions
          aren&apos;t the right kind of support for what you&apos;re going
          through, and it wouldn&apos;t be safe to wait. You deserve to talk to
          someone trained to help with exactly this, today.
        </p>
        <p className="mt-3 text-[15px] font-medium text-ink">
          You are not alone, and your life matters. Please contact one of these
          now:
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {CRISIS_RESOURCES.map((r) => (
            <li
              key={r.name}
              className="flex flex-col rounded-md border border-clay/30 bg-canvas px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-ink">{r.name}</span>
              <span className="text-sm text-body">{r.detail}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">
          If you are outside India, please contact your local emergency number
          or a crisis helpline in your country. If you are in immediate danger,
          call emergency services right away.
        </p>
        <button
          type="button"
          onClick={() => {
            setShowCrisis(false);
            setSafety("");
          }}
          className="mt-5 text-sm text-accent-deep underline underline-offset-4"
        >
          Go back
        </button>
      </div>
    );
  }

  // ---- Booking confirmed ----
  if (step === 3) {
    return (
      <div className="rounded-[18px] border border-accent/30 bg-canvas p-7 sm:p-9">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-on-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="font-serif text-2xl text-ink">
          Thank you, {name.split(" ")[0] || "there"}. One last step.
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-body">
          Your details have been shared privately with Shagufta. Now pick the
          time you saw earlier and you&apos;ll be all set — there&apos;s nothing
          else to prepare.
        </p>
        <div className="mt-6">
          <BookingButton label="Choose your appointment time" />
        </div>
        <p className="mt-5 text-xs text-muted">
          Everything you shared is kept confidential. If the calendar
          doesn&apos;t open,{" "}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-deep underline underline-offset-2"
          >
            use this direct link
          </a>
          .
        </p>
      </div>
    );
  }

  // ---- Pre-step: check slots first ----
  if (step === -1) {
    return (
      <div className="rounded-[18px] border border-hairline bg-canvas p-6 sm:p-9">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent-soft text-accent-deep text-lg font-serif">
            1
          </div>
          <div>
            <h3 className="font-serif text-xl text-ink">
              First — check if a time works for you
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-body">
              Before filling the form, take a quick look at available slots. If
              you see a time that suits you, come back here and complete the
              short form to confirm your booking.
            </p>
          </div>
        </div>

        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full items-center justify-between gap-3 rounded-[14px] border border-accent/40 bg-accent-soft/40 px-5 py-4 transition-colors hover:bg-accent-soft"
        >
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="flex-none text-accent-deep"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-medium text-ink">View available appointment times</p>
              <p className="text-xs text-muted">Opens in a new tab · Google Calendar</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-none text-accent-deep">
            <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <div className="relative my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-hairline" />
          <span className="text-xs text-muted">found a slot that works?</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-surface-strong text-muted text-lg font-serif">
            2
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-xl text-ink">
              Fill the short form to confirm
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-body">
              Takes about 2 minutes. It helps Shagufta understand how best to
              support you so your session feels unhurried from the start.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { setStep(0); scrollTop(); }}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-primary px-6 py-3.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
        >
          Yes, I found a time — start the form
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }

  // ---- Multi-step form (steps 0, 1, 2) ----
  return (
    <div className="rounded-[18px] border border-hairline bg-canvas p-6 sm:p-9">
      {/* progress */}
      <div className="mb-7 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-medium transition-colors ${
                i <= step
                  ? "bg-forest text-cream"
                  : "bg-surface-strong text-muted"
              }`}
            >
              {i + 1}
            </span>
            {i < 2 && (
              <span
                className={`h-px flex-1 ${
                  i < step ? "bg-forest/50" : "bg-hairline"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-deep">
              Step 1 of 3
            </p>
            <h3 className="mt-2 font-serif text-2xl text-ink">
              A little about you
            </h3>
            <p className="mt-1 text-sm text-body">
              Just the basics. A first name or nickname is completely fine.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name (or nickname)" required>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should I call you?"
              />
            </Field>
            <Field label="Age" required>
              <input
                className={inputCls}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 22"
              />
            </Field>
          </div>
          <Field label="Gender" required>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <Chip
                  key={g}
                  label={g}
                  active={gender === g}
                  onClick={() => setGender(g)}
                />
              ))}
            </div>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Country / City" hint="Helps with time zones.">
              <input
                className={inputCls}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, India"
              />
            </Field>
            <Field label="Email" required>
              <input
                className={inputCls}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-deep">
              Step 2 of 3
            </p>
            <h3 className="mt-2 font-serif text-2xl text-ink">
              What&apos;s bringing you here
            </h3>
            <p className="mt-1 text-sm text-body">
              There are no right answers. Share whatever feels comfortable.
            </p>
          </div>

          <Field
            label="What made you decide to book this session?"
            hint="A sentence or two is plenty — or skip it."
          >
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="I've been feeling…"
            />
          </Field>

          <div>
            <p className="text-sm font-medium text-ink">
              How are you feeling right now?
              <span className="font-normal text-muted"> (choose any)</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FEELINGS.map((f) => (
                <Chip
                  key={f}
                  label={f}
                  active={feelings.includes(f)}
                  onClick={() => toggle(feelings, setFeelings, f)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">
              What would you like to talk about?
              <span className="font-normal text-muted"> (choose any)</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  active={topics.includes(t)}
                  onClick={() => toggle(topics, setTopics, t)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Have you talked to anyone about this before?">
              <select
                className={inputCls}
                value={spokenBefore}
                onChange={(e) => setSpokenBefore(e.target.value)}
              >
                <option value="">Choose one…</option>
                {SPOKEN.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Preferred language for the session">
              <select
                className={inputCls}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="">Choose one…</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="What would feel like a good outcome from this session?">
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="Even 'I'm not sure yet' is okay."
            />
          </Field>

          <Field label="Anything you'd like Shagufta to know beforehand?">
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-deep">
              Step 3 of 3
            </p>
            <h3 className="mt-2 font-serif text-2xl text-ink">
              One important question
            </h3>
            <p className="mt-1 text-sm text-body">
              This helps make sure you get the right kind of support. Please
              answer honestly.
            </p>
          </div>

          <div className="rounded-[14px] border border-clay/30 bg-peach/15 p-5">
            <p className="text-[15px] font-medium text-ink">
              Are you currently experiencing thoughts of self-harm or suicide?
              <span className="text-accent-deep"> *</span>
            </p>
            <div className="mt-4 flex gap-3">
              {(["no", "yes"] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSafety(val)}
                  aria-pressed={safety === val}
                  className={`flex-1 rounded-[12px] border px-5 py-3 text-sm font-medium capitalize transition-colors ${
                    safety === val
                      ? "border-forest bg-forest text-cream"
                      : "border-border-strong bg-canvas text-ink hover:bg-surface-soft"
                  }`}
                >
                  {val === "no" ? "No" : "Yes"}
                </button>
              ))}
            </div>
            {safety === "yes" && (
              <p className="mt-4 text-sm leading-relaxed text-clay">
                Thank you for your honesty. Because of this, a listening session
                isn&apos;t the safe or right support for you right now — you
                deserve trained, professional help today. Press{" "}
                <span className="font-medium">Continue</span> and we&apos;ll
                show you people who can help immediately.
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 text-sm text-body">
            <span>
              By continuing, you understand these sessions are{" "}
              <span className="font-medium text-ink">
                not therapy, counseling, diagnosis, or medical advice
              </span>
              , and are not a substitute for professional or emergency care.
            </span>
          </label>
        </div>
      )}

      {error && <p className="mt-5 text-sm text-clay">{error}</p>}

      {/* nav buttons */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          className="rounded-[14px] border border-border-strong bg-canvas px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-soft"
        >
          Back
        </button>

        {step < 2 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
          >
            Continue
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={status === "sending"}
            className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:opacity-60"
          >
            {status === "sending"
              ? "Submitting…"
              : safety === "yes"
                ? "Continue"
                : "Submit & choose a time"}
          </button>
        )}
      </div>
    </div>
  );
}
