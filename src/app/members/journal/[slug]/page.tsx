import { notFound } from "next/navigation";
import { getPostForViewer } from "@/lib/data";
import { PostView } from "@/components/views/JournalViews";

export default async function MembersPost({ params }: PageProps<"/members/journal/[slug]">) {
  const post = await getPostForViewer((await params).slug);
  if (!post) notFound();
  return <div className="pt-4"><PostView post={post} base="/members" tone="dark" /></div>;
}
