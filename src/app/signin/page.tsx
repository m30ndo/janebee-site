import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/SignInForm";
import { Splash } from "@/components/members/Splash";

export const metadata: Metadata = { title: "Sign in" };

async function Form({ searchParams }: { searchParams: PageProps<"/signin">["searchParams"] }) {
  const q = await searchParams;
  const next = typeof q.next === "string" && q.next.startsWith("/") && !q.next.startsWith("//") ? q.next : "/members";
  return (
    <>
      {q.error === "link" && <p className="mb-6 text-sm text-[#e8826e]">That link has expired. Sign in, or ask for a new reset link.</p>}
      <SignInForm next={next} />
    </>
  );
}

export default function SignInPage({ searchParams }: PageProps<"/signin">) {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-black px-6 text-cream">
      <Splash />
      <span className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-honey/20 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-pink/20 blur-3xl" />
      <div className="stagger relative w-full max-w-sm">
        <Link href="/" className="font-serif text-2xl font-light">Jane Bee</Link>
        <h1 className="mt-10 font-serif text-6xl font-light">
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
