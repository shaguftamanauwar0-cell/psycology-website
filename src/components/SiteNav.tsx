"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#note", label: "Her note" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#boundaries", label: "Is this for me?" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-hairline bg-canvas/85 backdrop-blur-md"
          : "border-transparent bg-canvas/0"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="group flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-forest font-serif text-sm text-cream"
          >
            S
          </span>
          <span className="text-[15px] font-medium tracking-tight text-ink">
            Shagufta&nbsp;Manauwar
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-body transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#book"
            className="rounded-[14px] bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
          >
            Book a session
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 7h18M3 12h18M3 17h18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-hairline bg-canvas px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-[15px] text-body"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#book"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-[14px] bg-primary px-5 py-3 text-center text-sm font-medium text-on-primary"
            >
              Book a session
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
