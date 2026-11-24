"use client";

import { useState } from "react";
import type { Painting } from "@/lib/painting";
import { formatPrice, paintingNumber, statusLabel } from "@/lib/painting";
import { buyPainting } from "@/app/actions";
import { EnquiryForm } from "@/components/EnquiryForm";
import { AddToBasket } from "@/components/shop/AddToBasket";
import { IconClose } from "@/components/members/icons";

/** Pop-up for a work: the story Bee-hind, then Buy or Enquire. */
export function PaintingPanel({ painting, onClose, base = "", bottomOffset = 0 }: { painting: Painting; onClose: () => void; base?: string; bottomOffset?: number }) {
  const [enquiring, setEnquiring] = useState(false);
  const p = painting;
  const size = p.widthCm && p.heightCm ? `${p.widthCm} × ${p.heightCm} cm` : null;
  const canBuy = p.kind === "painting" && p.status === "available" && !!p.pricePence;
  const photo = p.kind === "photo";

  return (
    <aside
      style={{ bottom: bottomOffset }}
      role="dialog"
      aria-label={p.title}
      className="animate-panel absolute inset-x-0 z-20 max-h-[78dvh] overflow-y-auto rounded-t-2xl border-white/10 bg-black text-white shadow-2xl md:border-l md:top-0 md:right-0 md:left-auto md:max-h-none md:w-[440px] md:rounded-none"
    >
      <div className="sticky top-0 z-10 flex justify-end bg-black/90 p-3 backdrop-blur">
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-honey hover:text-honey" aria-label="Close">
          <IconClose size={16} />
        </button>
      </div>

      <div className="px-6 pb-10 md:px-8">
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt="" className="mb-6 max-h-72 w-full object-contain" />
        )}
        <p className="text-xs tracking-[0.2em] text-honey uppercase">{photo ? "Photo shoot" : `${paintingNumber(p.number)} · One of one`}</p>
        <h2 className="mt-2 font-serif text-4xl leading-tight font-light">{p.title}</h2>
        {!photo && <>
        {p.glimpse && <p className="mt-3 font-serif text-xl italic text-white/75">{p.glimpse}</p>}

        {p.story && (
          <div className="mt-6 border-t border-white/15 pt-6">
            <p className="mb-2 text-xs tracking-[0.2em] text-honey uppercase">The story Bee-hind</p>
            {p.story.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="mb-3 leading-relaxed text-white/85">{para}</p>
            ))}
          </div>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-y-2 border-t border-white/15 pt-6 text-sm">
          {p.medium && (<><dt className="text-white/50">Medium</dt><dd>{p.medium}</dd></>)}
          {size && (<><dt className="text-white/50">Size</dt><dd>{size}</dd></>)}
          {p.year && (<><dt className="text-white/50">Year</dt><dd>{p.year}</dd></>)}
          <dt className="text-white/50">Status</dt>
          <dd className={p.status === "sold" ? "text-pink" : "text-honey"}>{statusLabel[p.status]}</dd>
        </dl>
        </>}

        <div className="mt-8 space-y-3">
          {!photo && <>
          {canBuy && (
            <form action={buyPainting}>
              <input type="hidden" name="slug" value={p.slug} />
              <input type="hidden" name="base" value={base} />
              <button className="btn-sheen w-full rounded-full bg-honey py-4 font-medium text-black transition-colors hover:bg-white">
                Buy now · {formatPrice(p.pricePence!)}
              </button>
            </form>
          )}
          {canBuy && <AddToBasket line={{ kind: "painting", id: p.id }} label={p.title} pricePence={p.pricePence!} image={p.image} variant="outline" base={base} tone="dark" />}
          {p.status !== "sold" && p.status !== "not_for_sale" && !enquiring && (
            <button
              onClick={() => setEnquiring(true)}
              className="w-full rounded-full border border-white/40 py-4 font-medium transition-colors hover:border-honey hover:text-honey"
            >
              Enquire about this work
            </button>
          )}
          {enquiring && <EnquiryForm paintingId={p.id} kind="piece" defaultMessage={`I'd love to know more about "${p.title}".`} tone="dark" />}
          </>}
          <a href={`${base}/work/${p.slug}`} className="block pt-2 text-center text-sm text-white/60 underline underline-offset-4 transition hover:text-honey">
            Open full page
          </a>
        </div>
      </div>
    </aside>
  );
}
