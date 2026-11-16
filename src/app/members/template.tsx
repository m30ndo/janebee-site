/** Re-mounts on every navigation inside the app, so each screen eases in. */
export default function MembersTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade">{children}</div>;
}
