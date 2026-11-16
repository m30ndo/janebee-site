import type { Metadata } from "next";
import { getViewer } from "@/lib/auth";
import { signOut, updateName } from "@/app/auth-actions";

export const metadata: Metadata = { title: "You" };

export default async function MemberAccount({ searchParams }: PageProps<"/members/account">) {
  const q = await searchParams;
  const viewer = (await getViewer())!;
  return (
    <div className="pt-4">
      <h1 className="font-serif text-4xl font-light">You</h1>
      <p className="mt-2 mb-8 opacity-75">{viewer.email}</p>
      {q.saved && <p className="mb-6 rounded-xl bg-cream/10 px-4 py-3 text-sm">Saved.</p>}

      <form action={updateName} className="rounded-2xl bg-cream/5 p-5">
        <label className="block text-xs tracking-[0.2em] uppercase opacity-70" htmlFor="first_name">What should Jane call you?</label>
        <input
          id="first_name" name="first_name" defaultValue={viewer.firstName ?? ""} autoComplete="given-name"
          className="mt-2 w-full border-b border-cream/40 bg-transparent py-2 text-lg outline-none focus:border-honey"
        />
        <button className="mt-4 rounded-full bg-honey px-5 py-2.5 text-sm font-medium text-espresso">Save</button>
      </form>

      <div className="mt-8 space-y-3 text-sm opacity-80">
        <p>Being in the Hive means you see new paintings, prints and invitations before anyone else.</p>
        <p>To stop emails, use the unsubscribe link in any email, or reply and ask.</p>
      </div>

      <form action={signOut} className="mt-10">
        <button className="text-sm underline underline-offset-4 opacity-70 hover:opacity-100">Sign out</button>
      </form>
    </div>
  );
}
