"use client";

import { useEffect, useRef } from "react";

/**
 * Official Google Calendar Appointment Scheduling button.
 * Loads Google's stylesheet + script once and mounts their button
 * into the target node. Exactly the integration Shagufta provided.
 */

declare global {
  interface Window {
    calendar?: {
      schedulingButton: {
        load: (opts: {
          url: string;
          color: string;
          label: string;
          target: HTMLElement;
        }) => void;
      };
    };
  }
}

export const BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0GhdFOsQ0-M-Eu5ctOUJFqgaCrUGoTCyd_lN65ZsL7QZ09PSDsXnPsG-TJ5zSHl0xsa3EE4VzQ?gv=true";

const CSS_HREF =
  "https://calendar.google.com/calendar/scheduling-button-script.css";
const JS_SRC =
  "https://calendar.google.com/calendar/scheduling-button-script.js";

export default function BookingButton({
  label = "Book an appointment",
  color = "#0e8074",
}: {
  label?: string;
  color?: string;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current || !targetRef.current) return;

    const mount = () => {
      if (mounted.current || !targetRef.current) return;
      if (window.calendar?.schedulingButton) {
        window.calendar.schedulingButton.load({
          url: BOOKING_URL,
          color,
          label,
          target: targetRef.current,
        });
        mounted.current = true;
      }
    };

    // Inject stylesheet once
    if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      document.head.appendChild(link);
    }

    // Inject script once, then mount
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${JS_SRC}"]`,
    );
    if (existing) {
      if (window.calendar?.schedulingButton) {
        mount();
      } else {
        existing.addEventListener("load", mount, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.src = JS_SRC;
      script.async = true;
      script.addEventListener("load", mount, { once: true });
      document.body.appendChild(script);
    }

    return () => {
      mounted.current = false;
    };
  }, [color, label]);

  return (
    <div className="flex flex-col items-start gap-3">
      <div ref={targetRef} aria-label="Google appointment scheduling" />
      {/* Reliable fallback that always works, even if the widget is blocked */}
      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-accent-deep underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity"
      >
        Or open the booking calendar directly &rarr;
      </a>
    </div>
  );
}
