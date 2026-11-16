import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatPrice, getPainting, getPaintingForViewer, getPaintingSlugs, paintingNumber, statusLabel, type Painting } from "@/lib/data";
import { buyPainting } from "@/app/actions";
import { EnquiryForm } from "@/components/EnquiryForm";
import { AddToBasket } from "@/components/shop/AddToBasket";

export async function generateStaticParams() {
  const slugs = await getPaintingSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "placeholder" }];
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const p = await getPainting((await params).slug);
  return { title: p?.title ?? "Work", description: p?.glimpse ?? undefined };
}

/** Shareable page for a single work (also the non-3D fallback). */
export default async function WorkPage({ params, searchParams }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = await getPainting(slug);
  return p ? (
    <WorkView p={p} notice={<Suspense fallback={null}><CheckoutNotice searchParams={searchParams} /></Suspense>} />
  ) : (
    // not public yet: members may still see it
    <Suspense fallback={<p className="p-12 opacity-60">Loading…</p>}>
      <MemberWork slug={slug} />
    </Suspense>
  );
}

async function MemberWork({ slug }: { slug: string }) {
  const p = await getPaintingForViewer(slug);
  if (!p) notFound();
  return <WorkView p={p} early />;
}

async function CheckoutNotice({ searchParams }: { searchParams: PageProps<"/work/[slug]">["searchParams"] }) {
  const q = await searchParams;
  if (q.checkout === "success") return <p className="mb-6 rounded-xl bg-[#e6efdc] px-4 py-3 text-sm text-[#2f4a1f]">Thank you — it&apos;s yours. A confirmation is on its way.</p>;
  if (typeof q.checkout === "string") return <p className="mb-6 rounded-xl bg-[#fbe4df] px-4 py-3 text-sm text-[#7a2a1c]">{q.checkout}</p>;
  return null;
}

function WorkView({ p, early, notice }: { p: Painting; early?: boolean; notice?: React.ReactNode }) {
  const canBuy = p.status === "available" && !!p.pricePence;
  return (
    <article className="grid gap-10 px-6 py-10 md:grid-cols-[1.4fr_1fr] md:px-12 md:py-16">
      <div className="bg-[#efe9df] p-6 md:p-12">
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.title} className="mx-auto max-h-[75dvh] w-auto shadow-xl" />
        )}
      </div>
      <div>
        {notice}
        {early && <p className="mb-4 inline-block rounded-full bg-pink px-3 py-1 text-xs text-cream">Hive early access</p>}
        <p className="text-xs tracking-[0.2em] uppercase opacity-60">{paintingNumber(p.number)} · One of one</p>
        <h1 className="mt-2 font-serif text-5xl font-light">{p.title}</h1>
        {p.glimpse && <p className="mt-3 font-serif text-2xl italic opacity-80">{p.glimpse}</p>}
        {p.story && (
          <div className="mt-8 border-t border-espresso/15 pt-6">
            <p className="mb-2 text-xs tracking-[0.2em] uppercase opacity-60">The story Bee-hind</p>
            {p.story.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="mb-3 leading-relaxed">{para}</p>
            ))}
          </div>
        )}
        <dl className="mt-6 grid grid-cols-2 gap-y-2 border-t border-espresso/15 pt-6 text-sm">
          {p.medium && (<><dt className="opacity-60">Medium</dt><dd>{p.medium}</dd></>)}
          {p.widthCm && p.heightCm && (<><dt className="opacity-60">Size</dt><dd>{p.widthCm} × {p.heightCm} cm</dd></>)}
          <dt className="opacity-60">Status</dt><dd>{statusLabel[p.status]}</dd>
        </dl>
        <div className="mt-8 space-y-4">
          {canBuy && (
            <>
              <form action={buyPainting}>
                <input type="hidden" name="slug" value={p.slug} />
                <button className="w-full rounded-full bg-espresso py-4 font-medium text-cream hover:bg-honey hover:text-espresso">
                  Buy now · {formatPrice(p.pricePence!)}
                </button>
              </form>
              <AddToBasket line={{ kind: "painting", id: p.id }} label={p.title} pricePence={p.pricePence!} image={p.image} variant="outline" />
            </>
          )}
          {p.status !== "sold" && p.status !== "not_for_sale" && (
            <details className="rounded-2xl border border-espresso/20 p-5" id="enquire">
              <summary className="cursor-pointer font-medium">Enquire about this work</summary>
              <div className="mt-4">
                <EnquiryForm paintingId={p.id} kind="piece" defaultMessage={`I'd love to know more about "${p.title}".`} />
              </div>
            </details>
          )}
          <Link
            href={`/gallery${p.collectionSlug ? `?room=${p.collectionSlug}` : ""}`}
            className="block text-center text-sm underline underline-offset-4 opacity-70 hover:opacity-100"
          >
            See it in the gallery
          </Link>
        </div>
      </div>
    </article>
  );
}
