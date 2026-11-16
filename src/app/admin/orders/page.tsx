import { serverClient } from "@/lib/supabase/server";
import { formatUk } from "@/lib/dates";
import { formatPrice } from "@/lib/painting";
import { setOrderStatus } from "@/app/admin/actions";
import { Notice, PageHead, inputCls } from "@/components/admin/ui";

type Item = { name: string; quantity: number; amount_pence: number };
type Shipping = { name?: string; address?: { line1?: string; line2?: string; city?: string; postal_code?: string; country?: string } };

export default async function OrdersAdmin({ searchParams }: PageProps<"/admin/orders">) {
  const supabase = await serverClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);

  return (
    <>
      <PageHead title="Orders">Paid orders arrive here automatically from Stripe. Mark them dispatched when posted.</PageHead>
      <Notice searchParams={await searchParams} />
      <ul className="space-y-4">
        {(orders ?? []).length === 0 && <li className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-5 text-sm opacity-60">No orders yet.</li>}
        {(orders ?? []).map((o) => {
          const items = (o.items ?? []) as Item[];
          const ship = (o.shipping ?? {}) as Shipping;
          const a = ship.address ?? {};
          return (
            <li key={o.id} className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{ship.name ?? o.email} <span className="font-normal opacity-60">· {formatUk(o.created_at)}</span></p>
                  <p className="text-sm opacity-70">{o.email}</p>
                  <p className="mt-2 text-sm opacity-80">{[a.line1, a.line2, a.city, a.postal_code, a.country].filter(Boolean).join(", ")}</p>
                </div>
                <form action={setOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <select name="status" defaultValue={o.status} className={`${inputCls} w-auto`}>
                    <option value="paid">Paid — to send</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="refunded">Refunded</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button className="rounded-full bg-honey px-4 py-2 text-sm text-black hover:bg-white">Update</button>
                </form>
              </div>
              <ul className="mt-4 border-t border-white/10 pt-3 text-sm">
                {items.map((it, i) => (
                  <li key={i} className="flex justify-between py-1"><span>{it.quantity} × {it.name}</span><span>{formatPrice(it.amount_pence)}</span></li>
                ))}
                <li className="flex justify-between pt-2 font-medium"><span>Total</span><span>{o.amount_pence ? formatPrice(o.amount_pence) : "—"}</span></li>
              </ul>
            </li>
          );
        })}
      </ul>
    </>
  );
}
