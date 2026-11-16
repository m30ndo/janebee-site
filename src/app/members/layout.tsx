import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getViewer, requireMember } from "@/lib/auth";
import { InstallPrompt } from "@/components/members/InstallPrompt";
import { RegisterSW } from "@/components/members/RegisterSW";
import { TabBar } from "@/components/members/TabBar";
import { Splash } from "@/components/members/Splash";
import { AppPlayer } from "@/components/members/AppPlayer";
import { getTracks } from "@/lib/data";

export const metadata: Metadata = {
  title: { default: "The Hive", template: "%s · The Hive" },
  appleWebApp: { capable: true, title: "The Hive", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#000000", viewportFit: "cover" };

async function Gate({ children }: { children: React.ReactNode }) {
  const viewer = await requireMember();
  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 md:px-8">
        <Link href="/members" className="font-serif text-2xl font-light">
          The <span className="text-honey">Hive</span>
        </Link>
        <span className="text-xs tracking-[0.15em] uppercase opacity-60">
          {viewer.firstName ?? "Member"}
          {viewer.role === "admin" && (
            <Link href="/admin" className="ml-3 rounded-full border border-honey/60 px-3 py-1 tracking-[0.15em] text-honey transition-colors hover:bg-honey hover:text-espresso">Studio</Link>
          )}
        </span>
      </header>
      <main className="mx-auto w-full max-w-5xl px-5 pb-32 md:px-8">{children}</main>
    </>
  );
}

async function Player() {
  const [tracks, viewer] = await Promise.all([getTracks(), getViewer()]);
  return <AppPlayer tracks={tracks} isAdmin={viewer?.role === "admin"} />;
}

export default function MembersLayout({ children }: LayoutProps<"/members">) {
  return (
    <div className="min-h-dvh bg-black text-cream">
      <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm tracking-[0.3em] uppercase opacity-60">The Hive</div>}>
        <Gate>{children}</Gate>
      </Suspense>
      <Splash />
      <Suspense fallback={null}>
        <Player />
      </Suspense>
      <InstallPrompt />
      <Suspense fallback={<div className="fixed inset-x-0 bottom-0 h-16 border-t border-cream/10 bg-black/90" />}>
        <TabBar />
      </Suspense>
      <RegisterSW />
    </div>
  );
}
