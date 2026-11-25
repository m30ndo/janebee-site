import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/legal-links";
import { getViewer } from "@/lib/auth";
import { signOut, updateName } from "@/app/auth-actions";
import { PasswordForm } from "@/components/members/PasswordForm";
import { NotifySettings } from "@/components/members/NotifySettings";
import { serverClient } from "@/lib/supabase/server";
import { AppPageHead } from "@/components/members/AppPageHead";

export const metadata: Metadata = { title: "You" };

const row = "group flex items-center justify-between rounded-2xl bg-cream/[0.06] px-5 py-4 transition-colors hover:bg-cream/[0.12]";

export default async function MemberAccount({ searchParams }: PageProps<"/members/account">) {
  const q = await searchParams;
  const viewer = (await getViewer())!;
  const { data: prefs } = await (await serverClient()).from("profiles").select("notify_email").eq("id", viewer.id).maybeSingle();
  return (
    <div className="stagger pt-4">
      <AppPageHead intro={viewer.email}>{viewer.firstName ? `Hello, ${viewer.firstName}` : "You"}</AppPageHead>
      {q.saved && <p className="mb-6 rounded-xl bg-cream/10 px-4 py-3 text-sm">Saved.</p>}
      {q.reset && <p className="mb-6 rounded-xl bg-honey/20 px-4 py-3 text-sm">You&apos;re signed in. Choose a new password below.</p>}

      <nav className="space-y-2">
        {viewer.role === "admin" && (
          <Link href="/admin" className={`${row} !bg-honey text-espresso`}>
            <span><span className="block font-serif text-xl">Studio</span><span className="text-sm opacity-75">Edit paintings, rooms, journal, shop & events</span></span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        )}
        <Link href="/members/inbox" className={row}><span>Inbox</span><span className="transition-transform group-hover:translate-x-1">→</span></Link>
        <Link href="/members/events" className={row}><span>Invitations</span><span className="transition-transform group-hover:translate-x-1">→</span></Link>
        <Link href="/members/orders" className={row}><span>Your orders</span><span className="transition-transform group-hover:translate-x-1">→</span></Link>
        <Link href="/members/basket" className={row}><span>Basket</span><span className="transition-transform group-hover:translate-x-1">→</span></Link>
        <Link href="/members/friends" className={row}><span>Friends of the Hive</span><span className="transition-transform group-hover:translate-x-1">→</span></Link>
      </nav>

      <form action={updateName} className="mt-8 rounded-2xl bg-cream/[0.06] p-5">
        <label className="block text-xs tracking-[0.2em] uppercase opacity-70" htmlFor="first_name">What should Jane call you?</label>
        <input
          id="first_name" name="first_name" defaultValue={viewer.firstName ?? ""} autoComplete="given-name"
          className="mt-2 w-full border-b border-cream/40 bg-transparent py-2 text-lg outline-none focus:border-honey"
        />
        <button className="btn-sheen mt-4 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-espresso">Save</button>
      </form>

      <NotifySettings emailOn={prefs?.notify_email !== false} />

      <PasswordForm highlight={!!q.reset} />

      <p className="mt-8 text-sm opacity-60">To stop emails, use the unsubscribe link in any email, or reply and ask.</p>
      <form action={signOut} className="mt-6">
        <button className="link-draw text-sm opacity-70 hover:opacity-100">Sign out</button>
      </form>

      <nav aria-label="The small print" className="mt-12 border-t border-white/10 pt-6">
        <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-honey uppercase">The small print</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs tracking-[0.15em] uppercase opacity-70">
          {LEGAL_LINKS.map((l) => <li key={l.slug}><Link href={`/members/legal/${l.slug}`} className="link-draw">{l.title}</Link></li>)}
        </ul>
      </nav>
    </div>
  );
}
