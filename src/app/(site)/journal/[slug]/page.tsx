import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPostForViewer } from "@/lib/data";
import { PostView } from "@/components/views/JournalViews";

export const metadata: Metadata = { title: "Journal" };

async function Post({ params }: { params: PageProps<"/journal/[slug]">["params"] }) {
  const post = await getPostForViewer((await params).slug);
  if (!post) notFound();
  return <PostView post={post} />;
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
