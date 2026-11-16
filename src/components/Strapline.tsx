/** The brand strapline: RAW · HONEST · PLAYFUL · SLIGHTLY NAUGHTY */
export const STRAPLINE = ["Raw", "Honest", "Playful", "Slightly naughty"];

export function Strapline({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <p className={`text-[10px] tracking-[0.2em] whitespace-nowrap uppercase sm:text-xs sm:tracking-[0.3em] ${className}`} style={style} aria-label={STRAPLINE.join(", ")}>
      {STRAPLINE.map((w, i) => (
        <span key={w}>
          {i > 0 && <span className="mx-2 text-honey" aria-hidden>·</span>}
          {w}
        </span>
      ))}
    </p>
  );
}
