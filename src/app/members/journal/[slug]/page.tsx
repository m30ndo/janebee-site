import { notFound } from "next/navigation";
import { getPostForViewer, getPostsForViewer } from "@/lib/data";
import { PostView } from "@/components/views/JournalViews";

export default async function MembersPost({ params }: PageProps<"/members/journal/[slug]">) {
  const slug = (await params).slug;
  const [post, more] = await Promise.all([getPostForViewer(slug), getPostsForViewer()]);
  if (!post) notFound();
  return <div className="pt-4"><PostView post={post} more={more} base="/members" tone="dark" /></div>;
}
