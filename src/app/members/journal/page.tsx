import type { Metadata } from "next";
import { getPostsForViewer } from "@/lib/data";
import { JournalList } from "@/components/views/JournalViews";

export const metadata: Metadata = { title: "Journal" };

export default async function MembersJournal() {
  return (
    <div className="pt-4">
      <h1 className="animate-rise mb-10 font-serif text-5xl font-light">Journal</h1>
      <JournalList posts={await getPostsForViewer()} base="/members" tone="dark" />
    </div>
  );
}
