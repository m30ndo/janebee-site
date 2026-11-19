import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPostForViewer, getPostsForViewer } from "@/lib/data";
import { PostView } from "@/components/views/JournalViews";

export const metadata: Metadata = { title: "Journal" };

async function Post({ params }: { params: PageProps<"/journal/[slug]">["params"] }) {
  const slug = (await params).slug;
  const [post, more] = await Promise.all([getPostForViewer(slug), getPostsForViewer()]);
  if (!post) notFound();
  return <PostView post={post} more={more} />;
}

export default function PostPage({ params }: PageProps<"/journal/[slug]">) {
  return (
    <div className="px-6 py-10 md:px-12 md:py-16">
      <Suspense fallback={<p className="opacity-60">Loading…</p>}>
        <Post params={params} />
      </Suspense>
    </div>
  );
}
