/** Instant placeholder while an app screen's data arrives (keeps navigation feeling immediate). */
export function ScreenLoading({ title, rows = 3 }: { title?: string; rows?: number }) {
  return (
    <div className="pt-4" aria-busy="true" aria-live="polite">
      {title ? <h1 className="font-h1 text-5xl font-light">{title}</h1> : <div className="h-12 w-48 animate-pulse bg-cream/10" />}
      <div className="mt-10 space-y-5">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-28 animate-pulse bg-cream/[0.06]" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
