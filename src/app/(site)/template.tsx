import { PageBee } from "@/components/members/PageBee";

/** Re-mounts on every page change: the bee swoops up the screen. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageBee />
      {children}
    </>
  );
}
