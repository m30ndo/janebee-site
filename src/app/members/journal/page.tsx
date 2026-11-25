import type { Metadata } from "next";
import { getPostsForViewer } from "@/lib/data";
import { JournalList } from "@/components/views/JournalViews";
import { AppPageHead } from "@/components/members/AppPageHead";

export const metadata: Metadata = { title: "Journal" };

export default async function MembersJournal() {
  return (
    <div className="pt-4">
      <AppPageHead eyebrow="From the studio" intro="Studio notes, art crushes and where to go in London. Written with coffee. Mostly.">
        The <span className="text-honey italic">Journal.</span>
      </AppPageHead>
      <JournalList posts={await getPostsForViewer()} base="/members" tone="dark" />
    </div>
  );
}
