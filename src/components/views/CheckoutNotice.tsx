/** Message shown on a work page after a checkout attempt. */
export async function CheckoutNotice({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  if (q.checkout === "success") return <p className="mb-6 rounded-xl bg-[#e6efdc] px-4 py-3 text-sm text-[#2f4a1f]">Thank you — it&apos;s yours. A confirmation is on its way.</p>;
  if (typeof q.checkout === "string") return <p className="mb-6 rounded-xl bg-[#fbe4df] px-4 py-3 text-sm text-[#7a2a1c]">{q.checkout}</p>;
  return null;
}
