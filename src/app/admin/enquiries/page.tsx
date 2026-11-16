import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { formatUk } from "@/lib/dates";
import { PageHead } from "@/components/admin/ui";

export default async function EnquiriesAdmin() {
  const supabase = await serverClient();
  const { data: list } = await supabase
    .from("enquiries")
    .select("id, name, email, kind, message, created_at, paintings(title, id)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <>
      <PageHead title="Enquiries">Messages from the site and from the gallery. Reply by email.</PageHead>
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
            </li>
          );
        })}
      </ul>
    </>
  );
}
