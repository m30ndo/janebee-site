import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { Suspense } from "react";
import { getPostsForViewer } from "@/lib/data";
import { JournalList } from "@/components/views/JournalViews";

export const metadata: Metadata = { title: "Journal", description: "Studio notes, art crushes, paint talk and where to see art in London." };

async function Posts() {
  return <JournalList posts={await getPostsForViewer()} />;
}

export default function JournalPage() {
  return (
    <div className="px-6 py-10 md:px-12 md:py-16">
      <PageBackground page="journal" />
      <header className="mb-14 grid gap-6 border-b border-white/15 pb-10 md:mb-16 md:grid-cols-[1fr_auto] md:items-end">
        <h1 className="animate-rise font-title text-[18vw] leading-[0.82] font-light tracking-tight md:text-[10rem]">
          The <span className="text-honey italic">Journal.</span>
        </h1>
        <p className="animate-rise max-w-xs text-sm leading-relaxed opacity-75 md:text-right" style={{ animationDelay: "0.15s" }}>
          Studio notes, art crushes, paint talk and where to go in London when you need a fix. Written with coffee. Mostly.
        </p>
      </header>
      <Suspense fallback={<p className="opacity-60">Loading…</p>}>
        <Posts />
      </Suspense>
    </div>
  );
}
