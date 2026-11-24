import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getViewer, requireMember } from "@/lib/auth";
import { unreadCount } from "@/lib/inbox";
import { InstallPrompt } from "@/components/members/InstallPrompt";
import { RegisterSW } from "@/components/members/RegisterSW";
import { TabBar } from "@/components/members/TabBar";
import { Splash } from "@/components/members/Splash";
import { AppPlayer } from "@/components/members/AppPlayer";
import { getTracks } from "@/lib/data";
import { BasketSync } from "@/components/shop/BasketSync";
import { HiveMark } from "@/components/members/HiveMark";
import { MusicAutoStart } from "@/components/members/MusicAutoStart";

export const metadata: Metadata = {
  title: { default: "The Hive", template: "%s · The Hive" },
  appleWebApp: { capable: true, title: "The Hive", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#000000", viewportFit: "cover" };

async function Gate({ children }: { children: React.ReactNode }) {
  const viewer = await requireMember();
  const unread = await unreadCount(viewer.id).catch(() => 0);
  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 md:px-8">
        <Link href="/members" aria-label="The Hive, home">
          <HiveMark />
        </Link>
        <span className="flex items-center gap-3 text-xs tracking-[0.15em] uppercase">
          <Link href="/members/inbox" aria-label={unread ? `Inbox, ${unread} new` : "Inbox"} className="relative grid h-9 w-9 place-items-center text-cream/80 transition-colors hover:text-honey">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unread > 0 && <span className="absolute top-0.5 right-0 grid h-4 min-w-4 place-items-center rounded-full bg-honey px-1 text-[9px] font-bold text-black tracking-normal">{unread}</span>}
          </Link>
          <span className="opacity-60">{viewer.firstName ?? "Member"}</span>
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
  const tracks = await getTracks();
  return <AppPlayer tracks={tracks} />;
}

async function Menu() {
  const viewer = await getViewer();
  return <TabBar isAdmin={viewer?.role === "admin"} />;
}

export default function MembersLayout({ children }: LayoutProps<"/members">) {
  return (
    <div className="hive-app isolate min-h-dvh bg-black text-cream">
      <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm tracking-[0.3em] uppercase opacity-60">The Hive</div>}>
        <Gate>{children}</Gate>
      </Suspense>
      <Splash />
      <Suspense fallback={null}>
        <Player />
      </Suspense>
      <InstallPrompt />
      <Suspense fallback={<div className="fixed inset-x-0 bottom-0 h-16 border-t border-cream/10 bg-black/90" />}>
        <Menu />
      </Suspense>
      <MusicAutoStart />
      <RegisterSW />
      <BasketSync />
    </div>
  );
}
