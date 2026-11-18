import { PageBee } from "@/components/members/PageBee";

/** Re-mounts on every navigation inside the app: the bee swoops up, then the screen appears. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageBee afterSplash>{children}</PageBee>;
}
