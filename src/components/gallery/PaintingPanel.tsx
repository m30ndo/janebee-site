"use client";

import { useState } from "react";
import type { Painting } from "@/lib/painting";
import { formatPrice, paintingNumber, statusLabel } from "@/lib/painting";
import { buyPainting } from "@/app/actions";
import { EnquiryForm } from "@/components/EnquiryForm";

/** Pop-up for a work: the story Bee-hind, then Buy or Enquire. */
export function PaintingPanel({ painting, onClose }: { painting: Painting; onClose: () => void }) {
  const [enquiring, setEnquiring] = useState(false);
  const p = painting;
  const size = p.widthCm && p.heightCm ? `${p.widthCm} × ${p.heightCm} cm` : null;
  const canBuy = p.status === "available" && !!p.pricePence;

  return (
    <aside
      role="dialog"
      aria-label={p.title}
      className="absolute inset-x-0 bottom-0 z-10 max-h-[78dvh] overflow-y-auto rounded-t-2xl bg-cream text-espresso shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[440px] md:rounded-none"
    >
      <div className="sticky top-0 flex justify-end bg-cream/95 p-3 backdrop-blur">
        <button onClick={onClose} className="rounded-full px-3 py-1 text-sm hover:bg-espresso/5" aria-label="Close">
          Close ✕
        </button>
      </div>

      <div className="px-6 pb-10 md:px-8">
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt="" className="mb-6 max-h-72 w-full object-contain" />
        )}
        <p className="text-xs tracking-[0.2em] uppercase opacity-60">{paintingNumber(p.number)} · One of one</p>
        <h2 className="mt-2 font-serif text-4xl leading-tight font-light">{p.title}</h2>
        {p.glimpse && <p className="mt-3 font-serif text-xl italic text-espresso/80">{p.glimpse}</p>}

        {p.story && (
          <div className="mt-6 border-t border-espresso/15 pt-6">
            <p className="mb-2 text-xs tracking-[0.2em] uppercase opacity-60">The story Bee-hind</p>
            {p.story.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="mb-3 leading-relaxed">{para}</p>
            ))}
          </div>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-y-2 border-t border-espresso/15 pt-6 text-sm">
          {p.medium && (<><dt className="opacity-60">Medium</dt><dd>{p.medium}</dd></>)}
          {size && (<><dt className="opacity-60">Size</dt><dd>{size}</dd></>)}
          {p.year && (<><dt className="opacity-60">Year</dt><dd>{p.year}</dd></>)}
          <dt className="opacity-60">Status</dt>
          <dd className={p.status === "sold" ? "text-[#b0234f]" : ""}>{statusLabel[p.status]}</dd>
        </dl>

        <div className="mt-8 space-y-3">
          {canBuy && (
            <form action={buyPainting}>
              <input type="hidden" name="slug" value={p.slug} />
              <button className="w-full rounded-full bg-espresso py-4 font-medium text-cream transition-colors hover:bg-honey hover:text-espresso">
                Buy · {formatPrice(p.pricePence!)}
              </button>
            </form>
          )}
          {p.status !== "sold" && p.status !== "not_for_sale" && !enquiring && (
            <button
              onClick={() => setEnquiring(true)}
              className="w-full rounded-full border border-espresso py-4 font-medium transition-colors hover:bg-espresso hover:text-cream"
            >
              Enquire about this work
            </button>
          )}
          {enquiring && <EnquiryForm paintingId={p.id} kind="piece" defaultMessage={`I'd love to know more about "${p.title}".`} />}
          <a href={`/work/${p.slug}`} className="block pt-2 text-center text-sm underline underline-offset-4 opacity-70 hover:opacity-100">
            Open full page
          </a>
        </div>
      </div>
    </aside>
  );
}
