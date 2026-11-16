import { serverClient } from "@/lib/supabase/server";
import { formatUk } from "@/lib/dates";
import { PageHead } from "@/components/admin/ui";

export default async function HiveAdmin() {
  const supabase = await serverClient();
  const [{ data: signups }, { data: members }] = await Promise.all([
    supabase.from("hive_signups").select("email, first_name, source, created_at").order("created_at", { ascending: false }),
    supabase.from("profiles").select("email, first_name, role, created_at").order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <PageHead title="The Hive" action={{ href: "/admin/hive/export", label: "Download CSV" }}>
        Everyone who has joined the mailing list, and everyone signed in to the members app.
      </PageHead>
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-serif text-2xl">Mailing list <span className="text-base opacity-60">({signups?.length ?? 0})</span></h2>
          <ul className="divide-y divide-white/10 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 text-sm">
            {(signups ?? []).map((s) => (
              <li key={s.email} className="flex justify-between gap-3 p-3">
                <span className="truncate">{s.first_name ? `${s.first_name} · ` : ""}{s.email}</span>
                <span className="shrink-0 opacity-60">{formatUk(s.created_at, false)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-3 font-serif text-2xl">App members <span className="text-base opacity-60">({members?.length ?? 0})</span></h2>
          <ul className="divide-y divide-white/10 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 text-sm">
            {(members ?? []).map((m) => (
              <li key={m.email ?? m.created_at} className="flex justify-between gap-3 p-3">
                <span className="truncate">{m.first_name ? `${m.first_name} · ` : ""}{m.email}{m.role === "admin" ? " · admin" : ""}</span>
                <span className="shrink-0 opacity-60">{formatUk(m.created_at, false)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
