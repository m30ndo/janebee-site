import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

async function Form({ searchParams }: { searchParams: PageProps<"/signin">["searchParams"] }) {
  const q = await searchParams;
  const next = typeof q.next === "string" && q.next.startsWith("/") && !q.next.startsWith("//") ? q.next : "/members";
  return (
    <>
      {q.error === "link" && <p className="mb-6 text-sm text-[#e8826e]">That link has expired. Request a new code below.</p>}
      <SignInForm next={next} />
    </>
  );
}

export default function SignInPage({ searchParams }: PageProps<"/signin">) {
  return (
    <main className="grid min-h-dvh place-items-center bg-espresso px-6 text-cream">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif text-2xl font-light">Jane Bee</Link>
        <h1 className="mt-10 font-serif text-5xl font-light">
          The <span className="text-honey">Hive</span>
        </h1>
        <p className="mt-3 mb-10 opacity-80">Members see new work first.</p>
        <Suspense fallback={null}>
          <Form searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
