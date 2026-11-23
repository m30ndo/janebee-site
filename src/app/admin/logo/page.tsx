import { serverClient } from "@/lib/supabase/server";
import { addLogo, deleteLogo, makeDefaultLogo, updateLogo } from "@/app/admin/actions";
import { LogoUpload } from "@/components/admin/LogoUpload";
import { Field, Notice, PageHead, Section, inputCls } from "@/components/admin/ui";
import { londonToday, pickLive, type LogoRow } from "@/lib/logo";

const fmt = (d: string | null) => (d ? new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

export default async function LogoAdmin({ searchParams }: PageProps<"/admin/logo">) {
  const supabase = await serverClient();
  const { data } = await supabase.from("site_logos").select("*").order("is_default", { ascending: false }).order("starts_on", { ascending: true, nullsFirst: true }).order("created_at");
  const rows = (data ?? []) as (LogoRow & { created_at: string })[];
  const today = londonToday();
  const live = pickLive(rows, today);

  return (
    <>
      <PageHead title="Logo">
        The bee used everywhere: website header, menu, app, sign-in, the flying page bee and the gallery. Add seasonal bees with dates and they switch on and off by themselves; the rest of the year the default shows. Changes appear within about a minute.
      </PageHead>
      <Notice searchParams={await searchParams} />

      <div className="mb-8 flex flex-wrap items-center gap-6 rounded-2xl border border-honey/40 bg-honey/[0.06] p-5">
        <img src="/logo" alt="Live logo" className="h-24 w-24" />
        <div>
          <p className="text-xs tracking-[0.2em] text-honey uppercase">Live now</p>
          <p className="mt-1 font-title text-2xl">{live?.name ?? "Built-in bee"}</p>
          <p className="mt-1 text-sm text-white/60">{live && !live.is_default ? `Seasonal, until ${fmt(live.ends_on) || "further notice"}. Then the default comes back.` : "The default logo."}</p>
        </div>
      </div>

      {rows.map((r) => {
        const isLive = live?.id === r.id;
        const seasonal = !!(r.starts_on || r.ends_on);
        const past = !!r.ends_on && r.ends_on < today;
        return (
          <div key={r.id} id={`logo-${r.id}`} className="scroll-mt-6">
            <Section title={`${r.name}${r.is_default ? " · default" : ""}${isLive ? " · live" : ""}${past ? " · finished" : ""}`}>
              <div className="flex items-center gap-4 md:col-span-2">
                <div className="grid h-28 w-28 place-items-center rounded-xl bg-black ring-1 ring-white/10"><img src={`/logo?id=${r.id}`} alt="" className="h-24 w-24" /></div>
                <div className="grid h-28 w-28 place-items-center rounded-xl bg-honey"><img src={`/logo?id=${r.id}`} alt="" className="h-24 w-24" /></div>
                <div className="grid h-28 w-28 place-items-center rounded-xl bg-white"><img src={`/logo?id=${r.id}`} alt="" className="h-24 w-24" /></div>
              </div>
              <form action={updateLogo} className="grid gap-4 md:col-span-2 md:grid-cols-2">
                <input type="hidden" name="id" value={r.id} />
                <Field label="Name"><input name="name" defaultValue={r.name} className={inputCls} /></Field>
                <label className="flex items-center gap-3 self-end pb-2.5 text-sm">
                  <input type="checkbox" name="buzz" defaultChecked={r.buzz} className="h-4 w-4 accent-[var(--honey)]" />
                  Buzz: acid-pink copy jitters behind it
                </label>
                {!r.is_default && (
                  <>
                    <Field label="Show from" hint="Leave both dates empty to keep it on file without using it."><input type="date" name="starts_on" defaultValue={r.starts_on ?? ""} className={inputCls} /></Field>
                    <Field label="Show until (inclusive)"><input type="date" name="ends_on" defaultValue={r.ends_on ?? ""} className={inputCls} /></Field>
                  </>
                )}
                <div className="flex flex-wrap items-center gap-4 md:col-span-2">
                  <button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Save</button>
                  {!r.is_default && <button formAction={makeDefaultLogo} className="rounded-full border border-white/25 px-5 py-2.5 text-sm hover:border-honey">Make default</button>}
                  {!r.is_default && <button formAction={deleteLogo} className="text-sm text-white/60 underline underline-offset-4 hover:text-white">Delete</button>}
                  {seasonal && !r.is_default && <span className="text-sm text-white/50">{fmt(r.starts_on) || "Now"} → {fmt(r.ends_on) || "no end"}</span>}
                </div>
              </form>
            </Section>
          </div>
        );
      })}

      <form action={addLogo}>
        <Section title="Add a logo">
          <LogoUpload />
          <Field label="Name" hint="For you, e.g. ‘Christmas bee’."><input name="name" placeholder="Christmas bee" className={inputCls} /></Field>
          <label className="flex items-center gap-3 self-end pb-2.5 text-sm">
            <input type="checkbox" name="buzz" defaultChecked className="h-4 w-4 accent-[var(--honey)]" />
            Buzz: acid-pink copy jitters behind it
          </label>
          <Field label="Show from" hint="For a seasonal bee. Leave empty for no start date."><input type="date" name="starts_on" className={inputCls} /></Field>
          <Field label="Show until (inclusive)"><input type="date" name="ends_on" className={inputCls} /></Field>
          <label className="flex items-center gap-3 text-sm md:col-span-2">
            <input type="checkbox" name="is_default" className="h-4 w-4 accent-[var(--honey)]" />
            Make this the default (used whenever no seasonal logo is on)
          </label>
          <div className="md:col-span-2"><button className="rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black hover:bg-white">Add logo</button></div>
        </Section>
      </form>

      <p className="mt-8 max-w-2xl text-sm text-white/50">
        App home-screen icons and the browser tab icon don&apos;t change with the season: phones keep them once installed. Ask Jeremy if you want those updated too.
      </p>
    </>
  );
}
