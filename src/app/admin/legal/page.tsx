import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { LEGAL_DEFAULTS } from "@/lib/legal";
import { formatUk } from "@/lib/dates";
import { Notice, PageHead } from "@/components/admin/ui";

export default async function LegalAdmin({ searchParams }: PageProps<"/admin/legal">) {
  const supabase = await serverClient();
  const { data } = await supabase.from("legal_pages").select("slug, title, updated_at");
  const rows = new Map((data ?? []).map((r) => [r.slug, r]));
  return (
    <>
      <PageHead title="Legal pages">Shipping, returns, privacy, cookies and terms. Linked in the website footer and the app&apos;s You screen.</PageHead>
      <Notice searchParams={await searchParams} />
      <p className="mb-6 max-w-2xl rounded-xl border border-honey/30 bg-honey/10 px-4 py-3 text-sm text-honey">
        These start from UK-standard wording. Have them checked before launch, and add Jane&apos;s business contact details.
      </p>
      <ul className="space-y-3">
        {LEGAL_DEFAULTS.map((p) => {
          const r = rows.get(p.slug);
          return (
            <li key={p.slug}>
              <Link href={`/admin/legal/${p.slug}`} className="flex items-center gap-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 hover:ring-honey/60">
                <span className="flex-1">
                  <span className="block font-h2 text-xl">{r?.title ?? p.title}</span>
                  <span className="text-sm opacity-60">/legal/{p.slug}{r?.updated_at ? ` · edited ${formatUk(r.updated_at, false)}` : " · default text"}</span>
                </span>
                <span className="text-white/40">→</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
