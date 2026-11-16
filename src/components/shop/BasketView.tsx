"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useBasket } from "@/lib/basket";
import { formatPrice } from "@/lib/painting";
import { checkoutBasket } from "@/app/actions";

export function BasketView() {
  const basket = useBasket();
  const [state, action, pending] = useActionState(checkoutBasket, { error: "" });

  if (!basket.items.length) {
    return (
      <p className="opacity-75">
        Your basket is empty. <Link href="/shop" className="underline underline-offset-4">Visit the shop</Link> or{" "}
        <Link href="/gallery" className="underline underline-offset-4">walk the gallery</Link>.
      </p>
    );
  }

  const lines = basket.items.map((i) => (i.kind === "variant" ? { kind: "variant", id: i.id, qty: i.qty } : { kind: "painting", id: i.id }));

  return (
    <div className="grid gap-10 md:grid-cols-[1.5fr_1fr]">
      <ul className="divide-y divide-espresso/10 border-y border-espresso/10">
        {basket.items.map((i) => (
          <li key={i.id} className="flex items-center gap-4 py-4">
            {i.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={i.image} alt="" className="h-20 w-20 object-cover" />
            ) : <span className="h-20 w-20 bg-espresso/10" />}
            <div className="flex-1">
              <p>{i.label}</p>
              <p className="text-sm opacity-70">{formatPrice(i.pricePence)}{i.kind === "painting" ? " · original, one of one" : ""}</p>
            </div>
            {i.kind === "variant" && (
              <select value={i.qty} onChange={(e) => basket.setQty(i.id, Number(e.target.value))} className="rounded-lg border border-espresso/20 bg-white px-2 py-1" aria-label="Quantity">
                {Array.from({ length: 10 }, (_, n) => n + 1).map((n) => <option key={n}>{n}</option>)}
              </select>
            )}
            <button onClick={() => basket.remove(i.id)} className="text-sm underline underline-offset-4 opacity-60 hover:opacity-100">Remove</button>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl bg-white p-6">
        <div className="flex justify-between text-lg"><span>Subtotal</span><span>{formatPrice(basket.totalPence)}</span></div>
        <p className="mt-1 text-sm opacity-60">Delivery calculated at checkout. UK delivery only for now.</p>
        <form action={action} className="mt-6">
          <input type="hidden" name="lines" value={JSON.stringify(lines)} />
          <button disabled={pending} className="w-full rounded-full bg-espresso py-4 font-medium text-cream hover:bg-honey hover:text-espresso disabled:opacity-60">
            {pending ? "Taking you to checkout…" : "Checkout securely"}
          </button>
        </form>
        {state.error && <p className="mt-4 text-sm text-[#a3402d]">{state.error}</p>}
        <p className="mt-4 text-xs opacity-60">Payments by Stripe: card, Apple Pay and Google Pay.</p>
      </aside>
    </div>
  );
}
