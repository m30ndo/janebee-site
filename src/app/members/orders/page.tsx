import type { Metadata } from "next";
import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { formatUk } from "@/lib/dates";
import { formatPrice } from "@/lib/painting";

export const metadata: Metadata = { title: "Your orders" };

const statusText: Record<string, string> = {
  pending: "Processing", paid: "Being prepared", dispatched: "On its way", refunded: "Refunded", cancelled: "Cancelled",
};

export default async function MemberOrders() {
  const supabase = await serverClient();
  const { data: orders } = await supabase.from("orders").select("id, created_at, status, amount_pence, items").order("created_at", { ascending: false });

  return (
    <div className="pt-4">
      <h1 className="font-serif text-4xl font-light">Your orders</h1>
      <ul className="mt-8 space-y-4">
        {(orders ?? []).length === 0 && (
          <li className="rounded-2xl border border-cream/15 p-6 text-sm opacity-70">
            Nothing yet. <Link href="/shop" className="underline underline-offset-4">Visit the shop</Link>.
          </li>
        )}
        {(orders ?? []).map((o) => (
          <li key={o.id} className="rounded-2xl bg-cream/5 p-5">
            <div className="flex justify-between text-sm">
              <span className="opacity-70">{formatUk(o.created_at, false)}</span>
              <span className="text-honey">{statusText[o.status] ?? o.status}</span>
            </div>
            <ul className="mt-3 space-y-1">
              {((o.items ?? []) as { name: string; quantity: number }[]).map((it, i) => (
                <li key={i}>{it.quantity} × {it.name}</li>
              ))}
            </ul>
            {o.amount_pence && <p className="mt-3 text-sm opacity-70">Total {formatPrice(o.amount_pence)}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
