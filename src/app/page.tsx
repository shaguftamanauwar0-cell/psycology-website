import SiteNav from "@/components/SiteNav";
import Reveal from "@/components/Reveal";
import BookingButton, { BOOKING_URL } from "@/components/BookingButton";
import ContactForm from "@/components/ContactForm";
import ImagePlaceholder from "@/components/ImagePlaceholder";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent-deep">
      <span className="h-px w-6 bg-accent/50" />
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="top" className="flex-1">
        {/* ───────────────────────── HERO ───────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-accent-soft/50 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-[360px] w-[360px] rounded-full bg-cream/70 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
            <Reveal>
              <Eyebrow>Free listening &amp; reflection sessions</Eyebrow>
              <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.08] tracking-tight text-ink sm:text-[3.4rem]">
                A calm, private space
                <br />
                to be truly heard.
              </h1>
              <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-body">
                Some thoughts feel lighter once they&apos;re spoken aloud to
                someone who simply listens. I offer gentle, one-to-one
                conversations — no judgment, no pressure, no fixing. Just space
                for you to think out loud.
              </p>

              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-primary px-7 py-3.5 text-[15px] font-medium text-on-primary transition-colors hover:bg-primary-active"
                >
                  Book a free session
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#note"
                  className="inline-flex items-center justify-center rounded-[14px] border border-border-strong bg-canvas px-7 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-surface-soft"
                >
                  Read my note
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
                {["Confidential", "Non-judgmental", "Always free", "Online"].map(
                  (t) => (
                    <span key={t} className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {t}
                    </span>
                  ),
                )}
              </div>
            </Reveal>

            <Reveal delay={120} className="relative">
              <div className="relative">
                <ImagePlaceholder
                  label="Add a warm portrait"
                  hint="A friendly photo of Shagufta · portrait, ~4:5"
                  tone="cream"
                  className="aspect-[4/5] w-full shadow-[0_24px_60px_-30px_rgba(20,52,42,0.35)]"
                />
                <div className="absolute -bottom-6 -left-4 hidden max-w-[200px] rounded-[14px] border border-hairline bg-canvas/95 p-4 shadow-[0_18px_40px_-24px_rgba(20,52,42,0.4)] backdrop-blur sm:block">
                  <p className="font-serif text-base leading-snug text-ink">
                    &ldquo;You&apos;re welcome here.&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    — Shagufta, Psychology student
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ──────────────────── TRUST STRIP ──────────────────── */}
        <section className="border-y border-hairline bg-surface-soft/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-hairline px-5 sm:px-8 md:grid-cols-4">
            {[
              { k: "100%", v: "Confidential" },
              { k: "0", v: "Cost — always free" },
              { k: "1-to-1", v: "Private sessions" },
              { k: "No", v: "Judgment, ever" },
            ].map((s, i) => (
              <div key={i} className="px-4 py-7 text-center">
                <div className="font-serif text-2xl text-ink sm:text-3xl">
                  {s.k}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────── HER NOTE (verbatim) ───────────────────── */}
        <section id="note" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Eyebrow>A note from Shagufta</Eyebrow>
          </Reveal>
          <Reveal delay={80} className="mx-auto mt-8 max-w-3xl">
            <figure className="relative overflow-hidden rounded-[22px] bg-cream px-7 py-12 sm:px-14 sm:py-16">
              <span
                aria-hidden
                className="absolute left-6 top-4 font-serif text-[7rem] leading-none text-forest/15 sm:left-10"
              >
                &ldquo;
              </span>
              <blockquote className="relative font-serif text-[1.18rem] leading-[1.85] text-forest sm:text-[1.32rem]">
                <p>Hello, I&apos;m Shagufta.</p>
                <p className="mt-5">
                  I am a Psychology student who enjoys meaningful conversations
                  and understanding people&apos;s experiences.
                </p>
                <p className="mt-5">
                  I offer private listening and reflection sessions for
                  individuals who would like a safe, respectful, and
                  non-judgmental space to talk.
                </p>
                <p className="mt-5">
                  These sessions are not therapy, counseling, diagnosis, or
                  medical advice.
                </p>
                <p className="mt-5">
                  My role is simply to listen carefully, ask thoughtful
                  questions, and help you explore your thoughts and feelings in
                  a supportive environment.
                </p>
                <p className="mt-5">
                  Whether you&apos;re feeling overwhelmed, confused, stuck,
                  lonely, or simply need someone neutral to talk to, you are
                  welcome here.
                </p>
                <p className="mt-5">
                  All conversations are treated with respect and
                  confidentiality.
                </p>
              </blockquote>
              <figcaption className="relative mt-8 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest font-serif text-cream">
                  S
                </span>
                <span>
                  <span className="block text-[15px] font-medium text-forest">
                    Shagufta Manauwar
                  </span>
                  <span className="block text-sm text-forest/70">
                    Psychology student
                  </span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </section>

        {/* ───────────────────── HOW IT WORKS ───────────────────── */}
        <section id="how" className="border-t border-hairline bg-surface-soft/50">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
            <Reveal className="max-w-2xl">
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-6 font-serif text-[2rem] leading-tight text-ink sm:text-[2.5rem]">
                Three gentle steps. No forms to dread.
              </h2>
              <p className="mt-4 max-w-xl text-body">
                Starting a conversation shouldn&apos;t feel like a hurdle.
                Here&apos;s exactly what happens when you reach out.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  n: "01",
                  t: "Pick a time",
                  d: "Choose a slot that suits you using the booking calendar. It takes under a minute, and you can reschedule any time.",
                },
                {
                  n: "02",
                  t: "We talk",
                  d: "We meet privately for an unhurried conversation. You lead — share as much or as little as feels right. I listen.",
                },
                {
                  n: "03",
                  t: "You reflect",
                  d: "You leave with a little more clarity and a lighter mind. There's no pressure to continue unless you'd like to.",
                },
              ].map((step, i) => (
                <Reveal as="article" key={step.n} delay={i * 100}>
                  <div className="h-full rounded-[14px] border border-hairline bg-canvas p-7 transition-shadow hover:shadow-[0_18px_44px_-28px_rgba(20,52,42,0.45)]">
                    <span className="font-serif text-sm text-accent-deep">
                      {step.n}
                    </span>
                    <h3 className="mt-3 text-lg font-medium text-ink">
                      {step.t}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-body">
                      {step.d}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────── WHAT TO EXPECT ───────────────────── */}
        <section id="expect" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <ImagePlaceholder
                label="Add a calming image"
                hint="A quiet, warm scene — soft light, plants, a cup of tea · ~4:3"
                tone="sage"
                className="aspect-[4/3] w-full"
              />
            </Reveal>
            <Reveal delay={100}>
              <Eyebrow>What to expect</Eyebrow>
              <h2 className="mt-6 font-serif text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
                A conversation that follows your pace.
              </h2>
              <p className="mt-4 text-body">
                There&apos;s no script and no &ldquo;right&rdquo; way to feel.
                Sessions are simply a space to think out loud with someone who
                is genuinely paying attention.
              </p>
              <ul className="mt-7 flex flex-col gap-4">
                {[
                  "A warm welcome and zero pressure to perform or explain yourself.",
                  "Careful listening, plus thoughtful questions when they help.",
                  "Complete confidentiality — what's said here stays here.",
                  "Space to feel overwhelmed, confused, stuck, lonely — or just to talk.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent-soft text-accent-deep">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-[15px] leading-relaxed text-body">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── BOUNDARIES ───────────────────── */}
        <section id="boundaries" className="border-y border-hairline bg-surface-soft/50">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
            <Reveal className="max-w-2xl">
              <Eyebrow>Honest &amp; clear</Eyebrow>
              <h2 className="mt-6 font-serif text-[2rem] leading-tight text-ink sm:text-[2.5rem]">
                What these sessions are — and what they aren&apos;t.
              </h2>
              <p className="mt-4 max-w-xl text-body">
                Being clear about this is part of keeping you safe. Honesty
                builds the trust these conversations rely on.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-[14px] border border-accent/25 bg-canvas p-8">
                  <h3 className="flex items-center gap-2 text-lg font-medium text-forest">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    This is
                  </h3>
                  <ul className="mt-5 flex flex-col gap-3 text-[15px] text-body">
                    {[
                      "A safe, respectful, non-judgmental space to talk.",
                      "Careful listening and thoughtful, gentle questions.",
                      "Support to explore your own thoughts and feelings.",
                      "Private, confidential, and entirely free.",
                    ].map((t) => (
                      <li key={t} className="flex gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="h-full rounded-[14px] border border-hairline bg-canvas p-8">
                  <h3 className="flex items-center gap-2 text-lg font-medium text-ink">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-strong text-muted">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 12h10"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    This is not
                  </h3>
                  <ul className="mt-5 flex flex-col gap-3 text-[15px] text-body">
                    {[
                      "Therapy, counseling, or psychological treatment.",
                      "Diagnosis or any form of medical advice.",
                      "A crisis or emergency service.",
                      "A replacement for professional mental-health care.",
                    ].map((t) => (
                      <li key={t} className="flex gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-border-strong" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <p className="mx-auto mt-10 max-w-3xl rounded-[14px] border border-clay/30 bg-peach/25 px-6 py-5 text-center text-sm leading-relaxed text-clay">
                If you are in crisis or may be at risk of harming yourself or
                others, please contact your local emergency services or a
                professional helpline right away. These sessions are not a
                substitute for emergency or professional care.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── WHY IT FEELS SAFE (trust + images) ───────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
          <Reveal className="max-w-2xl">
            <Eyebrow>Why people feel at ease</Eyebrow>
            <h2 className="mt-6 font-serif text-[2rem] leading-tight text-ink sm:text-[2.5rem]">
              Built entirely around your comfort.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                tone: "cream" as const,
                label: "Add a cozy space photo",
                hint: "Where you'll feel at ease · ~1:1",
                t: "A space that feels human",
                d: "No clinical desks or forms. Just a calm, ordinary conversation between two people.",
              },
              {
                tone: "sage" as const,
                label: "Add a candid moment",
                hint: "Two people talking · ~1:1",
                t: "Genuinely heard",
                d: "You set the direction. I follow with full attention and care, never an agenda.",
              },
              {
                tone: "peach" as const,
                label: "Add a detail shot",
                hint: "Plant, journal, soft light · ~1:1",
                t: "Always confidential",
                d: "What you share stays between us. Trust is the foundation of everything here.",
              },
            ].map((card, i) => (
              <Reveal as="article" key={card.t} delay={i * 100}>
                <div className="overflow-hidden rounded-[14px] border border-hairline bg-canvas">
                  <ImagePlaceholder
                    label={card.label}
                    hint={card.hint}
                    tone={card.tone}
                    className="aspect-[5/4] w-full rounded-none border-x-0 border-t-0"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-ink">{card.t}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-body">
                      {card.d}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────────────────── BOOKING CTA (signature forest) ───────────────────── */}
        <section id="book" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 sm:pb-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-[22px] bg-forest px-7 py-14 sm:px-14 sm:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-forest-soft/60 blur-2xl"
              />
              <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <Eyebrow>
                    <span className="text-sage">Ready when you are</span>
                  </Eyebrow>
                  <h2 className="mt-6 font-serif text-[2.1rem] leading-tight text-cream sm:text-[2.7rem]">
                    Take the first small step.
                  </h2>
                  <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-sage">
                    Choose a time that works for you. There&apos;s nothing to
                    prepare and nothing to prove — just bring yourself, exactly
                    as you are.
                  </p>
                  <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sage/90">
                    {["Free of charge", "Private 1-to-1", "Reschedule anytime"].map(
                      (t) => (
                        <li key={t} className="inline-flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                          {t}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="rounded-[18px] bg-canvas/95 p-7 sm:p-8">
                  <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent-deep">
                    Book your session
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-body">
                    Pick a slot on the calendar below. You&apos;ll get a
                    confirmation right away.
                  </p>
                  <div className="mt-5">
                    <BookingButton label="Book an appointment" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ───────────────────── CONTACT (Convex) ───────────────────── */}
        <section
          id="contact"
          className="border-t border-hairline bg-surface-soft/50"
        >
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
              <Reveal>
                <Eyebrow>Prefer to write first?</Eyebrow>
                <h2 className="mt-6 font-serif text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
                  Not ready to book? Just say hello.
                </h2>
                <p className="mt-4 max-w-sm text-body">
                  Sometimes it&apos;s easier to put a few words down first.
                  Leave a private message and Shagufta will read it personally
                  and reply with care.
                </p>
                <div className="mt-8 rounded-[14px] border border-hairline bg-canvas p-6">
                  <p className="font-serif text-lg text-forest">
                    &ldquo;You are welcome here.&rdquo;
                  </p>
                  <p className="mt-2 text-sm text-body">
                    Whatever you&apos;re carrying, you don&apos;t have to carry
                    it alone for the next hour.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="rounded-[18px] border border-hairline bg-canvas p-7 sm:p-9">
                  <ContactForm />
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* ───────────────────── FOOTER ───────────────────── */}
      <footer className="border-t border-hairline bg-canvas">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest font-serif text-sm text-cream">
                  S
                </span>
                <span className="text-[15px] font-medium text-ink">
                  Shagufta Manauwar
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Private listening and reflection sessions — a safe, respectful,
                and non-judgmental space to talk. Always free and confidential.
              </p>
            </div>
            <nav className="flex flex-col gap-3 text-sm text-body">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                Explore
              </span>
              <a href="#note" className="hover:text-ink">
                Her note
              </a>
              <a href="#how" className="hover:text-ink">
                How it works
              </a>
              <a href="#boundaries" className="hover:text-ink">
                Is this for me?
              </a>
              <a href="#contact" className="hover:text-ink">
                Get in touch
              </a>
            </nav>
            <div className="flex flex-col items-start gap-4">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                Take the first step
              </span>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
              >
                Book a free session
              </a>
            </div>
          </div>

          <div className="mt-12 border-t border-hairline pt-6">
            <p className="text-xs leading-relaxed text-muted">
              These sessions are not therapy, counseling, diagnosis, or medical
              advice, and are not a substitute for professional or emergency
              care. If you are in crisis, please contact your local emergency
              services or a professional helpline.
            </p>
            <p className="mt-4 text-xs text-muted">
              © {new Date().getFullYear()} Shagufta Manauwar. Made with care.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
