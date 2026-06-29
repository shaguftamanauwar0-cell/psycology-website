"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Honeypot — silently accept bots without storing
    if (data.company) {
      setStatus("sent");
      form.reset();
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong.");
      }
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-[14px] border border-accent/30 bg-accent-soft/60 p-8 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-on-primary">
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
        <p className="font-serif text-xl text-ink">Thank you for reaching out.</p>
        <p className="mt-2 text-sm text-body">
          Your message has been received. Shagufta will read it personally and
          reply with care. If it&apos;s easier, you&apos;re always welcome to book a
          time directly.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-md border border-hairline bg-canvas px-4 py-3 text-[15px] text-ink placeholder:text-muted/70 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Your name</span>
          <input
            name="name"
            required
            placeholder="First name is fine"
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputCls}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">
          What&apos;s on your mind?
        </span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Share as little or as much as you like. There's no wrong way to start."
          className={`${inputCls} resize-none`}
        />
      </label>

      {status === "error" && (
        <p className="text-sm text-clay">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex items-center justify-center gap-2 self-start rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send a private message"}
      </button>
      <p className="text-xs text-muted">
        Your message is kept private and confidential. This form is for getting
        in touch — it is not for emergencies.
      </p>
    </form>
  );
}
