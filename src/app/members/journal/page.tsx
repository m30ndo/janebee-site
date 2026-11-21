import type { Metadata } from "next";
import { getPostsForViewer } from "@/lib/data";
import { JournalList } from "@/components/views/JournalViews";

export const metadata: Metadata = { title: "Journal" };

export default async function MembersJournal() {
  return (
    <div className="pt-4">
      <header className="animate-rise mb-8 border-b border-white/15 pb-6">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">From the studio</p>
        <h1 className="mt-2 font-title text-6xl leading-[0.85] font-light tracking-tight">
          The <span className="text-honey italic">Journal.</span>
        </h1>
        <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-70">Studio notes, art crushes and where to go in London. Written with coffee. Mostly.</p>
      </header>
      <JournalList posts={await getPostsForViewer()} base="/members" tone="dark" />
    </div>
  );
}
