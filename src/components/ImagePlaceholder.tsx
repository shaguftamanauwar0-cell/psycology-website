import type { ReactNode } from "react";

/**
 * A tasteful image placeholder. Swap the inner content for a real
 * <Image /> when photos are ready. Each placeholder names the asset
 * it expects and the recommended aspect so replacements are easy.
 *
 * To replace: drop a file in /public and render
 *   <Image src="/portrait.jpg" alt="Shagufta" fill className="object-cover" />
 * inside this frame (or replace the whole component at the call site).
 */
export default function ImagePlaceholder({
  label,
  hint,
  tone = "soft",
  className = "",
  icon,
}: {
  label: string;
  hint?: string;
  tone?: "soft" | "sage" | "cream" | "peach";
  className?: string;
  icon?: ReactNode;
}) {
  const tones: Record<string, string> = {
    soft: "bg-surface-soft text-muted",
    sage: "bg-sage/40 text-forest",
    cream: "bg-cream text-forest",
    peach: "bg-peach/50 text-clay",
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-[14px] border border-dashed border-border-strong/70 ${tones[tone]} ${className}`}
    >
      <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
        <span className="opacity-70">
          {icon ?? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle cx="8.5" cy="9.5" r="1.8" fill="currentColor" />
              <path
                d="M4 17l4.5-4.5 3.5 3 3-2.5L20 17"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.14em]">
          {label}
        </span>
        {hint && <span className="text-[11px] leading-snug opacity-70">{hint}</span>}
      </div>
    </div>
  );
}
