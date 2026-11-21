import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPage, getLegalPages, LEGAL_DEFAULTS } from "@/lib/legal";
import { LegalView } from "@/components/views/LegalView";

export function generateStaticParams() {
  return LEGAL_DEFAULTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/members/legal/[slug]">): Promise<Metadata> {
  const page = await getLegalPage((await params).slug);
  return { title: page?.title ?? "Legal" };
}

export default async function MembersLegalPage({ params }: PageProps<"/members/legal/[slug]">) {
  const [page, all] = await Promise.all([getLegalPage((await params).slug), getLegalPages()]);
  if (!page) notFound();
  return (
    <div className="pt-4">
      <LegalView page={page} all={all} base="/members" />
    </div>
  );
}
