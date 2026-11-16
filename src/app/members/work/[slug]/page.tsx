import { notFound } from "next/navigation";
import { getPaintingForViewer } from "@/lib/data";
import { WorkView } from "@/components/views/WorkView";
import { CheckoutNotice } from "@/components/views/CheckoutNotice";

export default async function MembersWork({ params, searchParams }: PageProps<"/members/work/[slug]">) {
  const p = await getPaintingForViewer((await params).slug);
  if (!p) notFound();
  return (
    <div className="pt-4">
      <WorkView p={p} base="/members" tone="dark" notice={<CheckoutNotice searchParams={searchParams} />} />
    </div>
  );
}
