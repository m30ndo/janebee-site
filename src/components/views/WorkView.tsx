import Link from "next/link";
import type { ReactNode } from "react";
import { formatPrice, paintingNumber, statusLabel, type Painting } from "@/lib/painting";
import { buyPainting } from "@/app/actions";
import { EnquiryForm } from "@/components/EnquiryForm";
import { AddToBasket } from "@/components/shop/AddToBasket";
import { outlineBtn, imgBg, rule, solidBtn, type Tone } from "./tone";

/** A single work: image, story, buy / basket / enquire. */
export function WorkView({ p, base = "", tone = "dark", early, notice }: { p: Painting; base?: string; tone?: Tone; early?: boolean; notice?: ReactNode }) {
  const canBuy = p.kind === "painting" && p.status === "available" && !!p.pricePence;
  if (p.kind === "photo") {
    // photo shoot: the picture and its title, nothing for sale
    return (
      <article className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className={`${imgBg(tone)} animate-fade grid place-items-center p-6 md:p-12`}>
          {p.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.title} className="max-h-[70dvh] w-auto shadow-2xl" />
          )}
        </div>
        <div className="stagger">
          {notice}
          <p className={`text-xs tracking-[0.2em] uppercase ${tone === "dark" ? "text-honey" : "opacity-60"}`}>Photo shoot</p>
          <h1 className="mt-2 font-serif text-5xl leading-[1.05] font-light">{p.title}</h1>
          <Link
            href={`${base}/gallery${p.collectionSlug ? `?room=${p.collectionSlug}` : ""}`}
            className={`mt-8 block w-full text-center text-sm ${outlineBtn(tone)} !py-3`}
          >
            See it in the gallery
          </Link>
        </div>
      </article>
    );
  }
  return (
    <article className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
      <div className={`${imgBg(tone)} animate-fade grid place-items-center p-6 md:p-12`}>
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.title} className="max-h-[70dvh] w-auto shadow-2xl" />
        )}
      </div>
      <div className="stagger">
        {notice}
        {early && <p className="mb-4 inline-block rounded-full bg-grey px-3 py-1 text-xs text-cream">Hive early access</p>}
        <p className={`text-xs tracking-[0.2em] uppercase ${tone === "dark" ? "text-honey" : "opacity-60"}`}>{paintingNumber(p.number)} · One of one</p>
        <h1 className="mt-2 font-serif text-5xl leading-[1.05] font-light">{p.title}</h1>
        {p.glimpse && <p className="mt-3 font-serif text-2xl italic opacity-80">{p.glimpse}</p>}
        {p.story && (
          <div className={`mt-8 border-t pt-6 ${rule(tone)}`}>
            <p className={`mb-2 text-xs tracking-[0.2em] uppercase ${tone === "dark" ? "text-honey" : "opacity-60"}`}>The story Bee-hind</p>
            {p.story.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="mb-3 leading-relaxed">{para}</p>
            ))}
          </div>
        )}
        <dl className={`mt-6 grid grid-cols-2 gap-y-2 border-t pt-6 text-sm ${rule(tone)}`}>
          {p.medium && (<><dt className="opacity-60">Medium</dt><dd>{p.medium}</dd></>)}
          {p.widthCm && p.heightCm && (<><dt className="opacity-60">Size</dt><dd>{p.widthCm} × {p.heightCm} cm</dd></>)}
          <dt className="opacity-60">Status</dt><dd className={p.status === "sold" ? "text-grey" : tone === "dark" ? "text-honey" : ""}>{statusLabel[p.status]}</dd>
        </dl>
        <div className="mt-8 space-y-3">
          {canBuy && (
            <>
              <form action={buyPainting}>
                <input type="hidden" name="slug" value={p.slug} />
                <input type="hidden" name="base" value={base} />
                <button className={`w-full ${solidBtn(tone)}`}>Buy now · {formatPrice(p.pricePence!)}</button>
              </form>
              <AddToBasket line={{ kind: "painting", id: p.id }} label={p.title} pricePence={p.pricePence!} image={p.image} variant="outline" base={base} tone={tone} />
            </>
          )}
          {p.status !== "sold" && p.status !== "not_for_sale" && (
            <details className={`rounded-2xl border p-5 ${rule(tone)}`} id="enquire">
              <summary className="cursor-pointer font-medium transition-colors hover:text-honey">Enquire about this work</summary>
              <div className="mt-4">
                <EnquiryForm paintingId={p.id} kind="piece" defaultMessage={`I'd love to know more about "${p.title}".`} tone={tone} />
              </div>
            </details>
          )}
          <Link
            href={`${base}/gallery${p.collectionSlug ? `?room=${p.collectionSlug}` : ""}`}
            className={`block w-full text-center text-sm ${outlineBtn(tone)} !py-3`}
          >
            See it in the gallery
          </Link>
        </div>
      </div>
    </article>
  );
}
