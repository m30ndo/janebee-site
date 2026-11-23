import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/SignInForm";
import { Splash } from "@/components/members/Splash";
import { PageBackground } from "@/components/PageBackground";

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
    <main className="hive-app relative isolate grid min-h-dvh place-items-center overflow-hidden bg-black px-6 text-cream">
      <Splash />
      <PageBackground page="app-signin" />
      <span className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-honey/20 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-pink/20 blur-3xl" />
      <div className="stagger relative w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link href="/" aria-label="Jane Bee">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/hive-logo.svg" alt="Jane Bee" width={80} height={80} className="h-20 w-20" />
          </Link>
          <h1 className="mt-5 font-h1 text-5xl font-light">
            The <span className="text-honey">Hive</span>
          </h1>
        </div>
        <Suspense fallback={null}>
          <Form searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
