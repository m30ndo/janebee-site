import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { releaseState } from "@/lib/dates";
import { formatPrice } from "@/lib/painting";
import { Notice, PageHead, ReleaseBadge } from "@/components/admin/ui";

export default async function ShopAdmin({ searchParams }: PageProps<"/admin/shop">) {
  const supabase = await serverClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, kind, active, image_path, public_from, members_from, product_variants(price_pence, stock)")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHead title="Prints & shop" action={{ href: "/admin/shop/new", label: "+ New product" }}>
        Prints, cards and merch. Original paintings are sold from Paintings.
      </PageHead>
      <Notice searchParams={await searchParams} />
      <ul className="space-y-3">
        {(products ?? []).map((p) => {
          const prices = (p.product_variants ?? []).map((v) => v.price_pence);
          const from = prices.length ? Math.min(...prices) : null;
          return (
            <li key={p.id}>
              <Link href={`/admin/shop/${p.id}`} className="flex items-center gap-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4 hover:ring-honey/60">
                {p.image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl(p.image_path)!} alt="" className="h-14 w-14 rounded object-cover" />
                ) : <span className="h-14 w-14 rounded bg-white/10" />}
                <span className="flex-1">
                  <span className="block font-medium">{p.name}</span>
                  <span className="text-sm opacity-60">
                    {p.kind} · {(p.product_variants ?? []).length} options{from ? ` · from ${formatPrice(from)}` : ""}{p.active ? "" : " · switched off"}
                  </span>
                </span>
                <ReleaseBadge state={releaseState(p.public_from, p.members_from)} />
              </Link>
            </li>
          );
        })}
        {(products ?? []).length === 0 && <li className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-5 text-sm opacity-60">No products yet.</li>}
      </ul>
    </>
  );
}
