import type { Metadata } from "next";
import { getFriends } from "@/lib/settings";
import { FRIEND_KINDS } from "@/lib/friends";
import { FriendCard } from "@/components/members/FriendCard";

export const metadata: Metadata = { title: "Friends of the Hive" };

export default async function MembersFriends() {
  const friends = await getFriends();
  return (
    <div className="pt-4">
      <header className="animate-rise mb-10 border-b border-white/15 pb-6">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">The company we keep</p>
        <h1 className="mt-2 font-title text-6xl leading-[0.85] font-light tracking-tight">
          Friends of <span className="text-honey italic">the Hive.</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-70">Ambassadors who wear the bee, galleries that hang the work, and friends worth a follow.</p>
      </header>

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
