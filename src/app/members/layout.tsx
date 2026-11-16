import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireMember } from "@/lib/auth";
import { InstallPrompt } from "@/components/members/InstallPrompt";
import { RegisterSW } from "@/components/members/RegisterSW";
import { TabBar } from "@/components/members/TabBar";

export const metadata: Metadata = {
  title: { default: "The Hive", template: "%s · The Hive" },
  appleWebApp: { capable: true, title: "The Hive", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#2b1a12", viewportFit: "cover" };

async function Gate({ children }: { children: React.ReactNode }) {
  const viewer = await requireMember();
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
        <Link href="/members" className="font-serif text-2xl font-light">
          The <span className="text-honey">Hive</span>
        </Link>
        <span className="text-xs tracking-[0.15em] uppercase opacity-60">
          {viewer.firstName ?? "Member"}
          {viewer.role === "admin" && (
            <Link href="/admin" className="ml-3 rounded-full border border-cream/30 px-2 py-0.5 normal-case tracking-normal">Admin</Link>
          )}
        </span>
      </header>
      <main className="mx-auto w-full max-w-3xl px-5 pb-32">{children}</main>
    </>
  );
}

export default function MembersLayout({ children }: LayoutProps<"/members">) {
  return (
    <div className="min-h-dvh bg-espresso text-cream">
      <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm tracking-[0.3em] uppercase opacity-60">The Hive</div>}>
        <Gate>{children}</Gate>
      </Suspense>
      <InstallPrompt />
      <TabBar />
      <RegisterSW />
    </div>
  );
}
