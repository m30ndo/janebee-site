import { STRAPLINE } from "@/components/Strapline";

/** Yellow box, black words, white dots: RAW ● HONEST ● PLAYFUL ● SLIGHTLY NAUGHTY. Shakes every few seconds. */
export function StraplineBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`shake-every inline-block max-w-full bg-honey px-4 py-3 text-black sm:px-5 md:px-7 md:py-4 ${className}`}>
      <p
        className="text-[9px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase min-[400px]:text-[11px] min-[400px]:tracking-[0.2em] sm:text-sm sm:tracking-[0.3em]"
        aria-label={STRAPLINE.join(", ")}
      >
        {STRAPLINE.map((w, i) => (
          <span key={w}>
            {i > 0 && <span className="mx-1.5 text-white min-[400px]:mx-2 sm:mx-3" aria-hidden>●</span>}
            {w}
          </span>
        ))}
      </p>
    </div>
  );
}
