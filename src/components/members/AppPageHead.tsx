import type { ReactNode } from "react";

/**
 * The one header every app page uses, so they all line up:
 * small label (with any action, e.g. Basket, on the same row, right) →
 * the title on its own full-width row in the Title font → optional intro → rule.
 * Nothing sits beside the title, so tall or handwritten fonts have room.
 */
export function AppPageHead({ eyebrow, action, intro, children, className = "" }: {
  eyebrow?: ReactNode;
  action?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <header className={`animate-rise mb-8 border-b border-white/15 pb-6 ${className}`}>
      {(eyebrow || action) && (
        <div className="flex min-h-5 items-center justify-between gap-4">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">{eyebrow}</p>
          {action && <span className="shrink-0 text-xs tracking-[0.15em] uppercase">{action}</span>}
        </div>
      )}
      <h1 className={`${eyebrow || action ? "mt-3" : ""} font-title text-6xl leading-[0.9] font-light tracking-tight`}>{children}</h1>
      {intro && <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-70">{intro}</p>}
    </header>
  );
}
