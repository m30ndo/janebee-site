import type { Metadata } from "next";
import { getFriends } from "@/lib/settings";
import { FRIEND_KINDS } from "@/lib/friends";
import { FriendCard } from "@/components/members/FriendCard";
import { AppPageHead } from "@/components/members/AppPageHead";

export const metadata: Metadata = { title: "Friends of the Hive" };

export default async function MembersFriends() {
  const friends = await getFriends();
  return (
    <div className="pt-4">
      <AppPageHead className="mb-10!" eyebrow="The company we keep" intro="Ambassadors who wear the bee, galleries that hang the work, and friends worth a follow.">
        Friends of <span className="text-honey italic">the Hive.</span>
      </AppPageHead>

      {friends.length === 0 && <p className="opacity-70">The guest list is being written. Check back soon.</p>}

      {FRIEND_KINDS.map((k) => {
        const list = friends.filter((f) => f.kind === k.value);
        if (!list.length) return null;
        return (
          <section key={k.value} className="mb-16">
            <h2 className="mb-6 flex items-baseline gap-3 font-h2 text-3xl font-light md:text-4xl">
              {k.label} <sup className="text-xs opacity-50">{list.length}</sup>
            </h2>
            <ul className="stagger grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((f) => <li key={f.id}><FriendCard f={f} /></li>)}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
