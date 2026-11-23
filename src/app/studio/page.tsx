import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getViewer } from "@/lib/auth";
import { signOut } from "@/app/auth-actions";
import { SignInForm } from "@/components/SignInForm";

export const metadata: Metadata = { title: "Studio", robots: { index: false } };

async function Body() {
  const viewer = await getViewer();
  if (viewer?.role === "admin") redirect("/admin");
  if (viewer) {
    return (
      <div className="text-center">
        <p className="opacity-80">You&apos;re signed in as {viewer.email}, which doesn&apos;t have Studio access.</p>
        <form action={signOut} className="mt-8">
          <button className="btn-glass border border-white/30 px-6 py-3 text-sm">Sign out and use another account</button>
        </form>
      </div>
    );
  }
  return <SignInForm next="/admin" signInOnly />;
}

/** Sign-in for the Studio (Jane & Jez's back office), kept apart from the members app. */
export default function StudioSignIn() {
  return (
    <main className="hive-app grid min-h-dvh place-items-center bg-black px-6 text-white [color-scheme:dark]">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link href="/" aria-label="Jane Bee website">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo" alt="" width={80} height={80} className="h-20 w-20" />
          </Link>
          <h1 className="mt-5 font-h1 text-5xl font-light">Jane <span className="text-honey">Bee</span> Studio</h1>
          <p className="mt-2 text-xs tracking-[0.25em] uppercase opacity-50">Back office</p>
        </div>
        <Suspense fallback={null}><Body /></Suspense>
      </div>
    </main>
  );
}
