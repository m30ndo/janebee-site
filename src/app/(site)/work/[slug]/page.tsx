import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPainting, getPaintingForViewer, getPaintingSlugs } from "@/lib/data";
import { WorkView } from "@/components/views/WorkView";
import { CheckoutNotice } from "@/components/views/CheckoutNotice";

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
    <div className="-mb-20 min-h-dvh bg-black px-6 pt-10 pb-30 text-white md:px-12 md:pt-16">
      <WorkView p={p} tone="dark" notice={<Suspense fallback={null}><CheckoutNotice searchParams={searchParams} /></Suspense>} />
    </div>
  ) : (
    // not public yet: members may still see it
    <Suspense fallback={<p className="min-h-dvh bg-black p-12 text-white/60">Loading…</p>}>
      <MemberWork slug={slug} />
    </Suspense>
  );
}

async function MemberWork({ slug }: { slug: string }) {
  const p = await getPaintingForViewer(slug);
  if (!p) notFound();
  return <div className="-mb-20 min-h-dvh bg-black px-6 pt-10 pb-30 text-white md:px-12 md:pt-16"><WorkView p={p} tone="dark" early /></div>;
}


