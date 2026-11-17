/** Message shown on a work page after a checkout attempt. */
export async function CheckoutNotice({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  if (q.checkout === "success") return <p className="mb-6 rounded-xl border border-honey/50 bg-honey/10 px-4 py-3 text-sm text-honey">Thank you — it&apos;s yours. A confirmation is on its way.</p>;
  if (typeof q.checkout === "string") return <p className="mb-6 rounded-xl border border-grey/50 bg-grey/10 px-4 py-3 text-sm text-grey">{q.checkout}</p>;
  return null;
}
