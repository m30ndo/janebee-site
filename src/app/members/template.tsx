import { PageBee } from "@/components/members/PageBee";

/** Re-mounts on every navigation inside the app: each screen eases in as the bee swoops up. */
export default function MembersTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageBee />
      <div className="animate-fade">{children}</div>
    </>
  );
}
