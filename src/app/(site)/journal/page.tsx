import type { Metadata } from "next";
import { Suspense } from "react";
import { getPostsForViewer } from "@/lib/data";
import { JournalList } from "@/components/views/JournalViews";

export const metadata: Metadata = { title: "Journal" };

async function Posts() {
  return <JournalList posts={await getPostsForViewer()} />;
}

export default function JournalPage() {
  return (
    <div className="px-6 py-10 md:px-12 md:py-16">
      <h1 className="animate-rise mb-12 font-serif text-5xl font-light md:text-7xl">Journal</h1>
      <Suspense fallback={<p className="opacity-60">Loading…</p>}>
        <Posts />
      </Suspense>
    </div>
  );
}
