import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { formatUk } from "@/lib/dates";
import { Notice, PageHead } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteEnquiry } from "@/app/admin/actions";

export default async function EnquiriesAdmin({ searchParams }: PageProps<"/admin/enquiries">) {
  const sp = await searchParams;
  const supabase = await serverClient();
  const { data: list } = await supabase
    .from("enquiries")
    .select("id, name, email, kind, message, created_at, paintings(title, id)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <>
      <PageHead title="Enquiries">Messages from the site and from the gallery. Reply by email.</PageHead>
      <Notice searchParams={sp} />
      {sp.deleted && <p className="mb-6 rounded-xl border border-honey/40 bg-honey/10 px-4 py-3 text-sm text-honey">Enquiry deleted.</p>}
      <ul className="space-y-3">
        {(list ?? []).length === 0 && <li className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-5 text-sm opacity-60">None yet.</li>}
        {(list ?? []).map((e) => {
          const work = e.paintings as unknown as { title: string; id: string } | null;
          return (
            <li key={e.id} className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-5">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <p>
                  <span className="font-medium">{e.name}</span> ·{" "}
                  <a href={`mailto:${e.email}?subject=${encodeURIComponent(work ? `Re: ${work.title}` : "Your enquiry — Jane Bee")}`} className="underline underline-offset-4">{e.email}</a>
                </p>
                <p className="opacity-60">{formatUk(e.created_at)}</p>
              </div>
              <p className="mt-1 text-xs tracking-[0.12em] uppercase opacity-60">
                {e.kind}{work && <> · <Link href={`/admin/paintings/${work.id}`} className="underline">{work.title}</Link></>}
              </p>
              <p className="mt-3 whitespace-pre-line">{e.message}</p>
              <form className="mt-4 flex justify-end border-t border-white/10 pt-3">
                <input type="hidden" name="id" value={e.id} />
                <DeleteButton action={deleteEnquiry} what={`the enquiry from ${e.name}`} />
              </form>
            </li>
          );
        })}
      </ul>
    </>
  );
}
