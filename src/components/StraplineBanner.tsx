import { STRAPLINE } from "@/components/Strapline";

/**
 * Yellow box, black words, white dots: RAW ● HONEST ● PLAYFUL ● SLIGHTLY NAUGHTY. Shakes every few seconds.
 * `words` picks a different set (the footer drops "Raw"); `full` stretches it to the width of its container.
 */
export function StraplineBanner({ className = "", words = STRAPLINE, full = false }: { className?: string; words?: string[]; full?: boolean }) {
  return (
    <div className={`shake-every max-w-full bg-honey px-4 py-3 text-black sm:px-5 md:px-7 md:py-4 ${full ? "shake-flat block w-full text-center md:py-6" : "inline-block"} ${className}`}>
      <p
        className={`font-semibold tracking-[0.12em] whitespace-nowrap uppercase min-[400px]:tracking-[0.2em] sm:tracking-[0.3em] ${full ? "text-[11px] min-[400px]:text-[13px] sm:text-base md:text-lg" : "text-[9px] min-[400px]:text-[11px] sm:text-sm"}`}
        aria-label={words.join(", ")}
      >
        {words.map((w, i) => (
          <span key={w}>
            {i > 0 && <span className="mx-1.5 text-white min-[400px]:mx-2 sm:mx-3" aria-hidden>●</span>}
            {w}
          </span>
        ))}
      </p>
    </div>
  );
}
