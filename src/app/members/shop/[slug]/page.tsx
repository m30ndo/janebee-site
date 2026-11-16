import { notFound } from "next/navigation";
import { getProductForViewer } from "@/lib/data";
import { ProductView } from "@/components/views/ProductView";

export default async function MembersProduct({ params }: PageProps<"/members/shop/[slug]">) {
  const p = await getProductForViewer((await params).slug);
  if (!p) notFound();
  return <div className="pt-4"><ProductView p={p} base="/members" tone="dark" /></div>;
}
