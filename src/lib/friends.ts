/**
 * Friends of the Hive: brand ambassadors, galleries that show Jane's work and
 * friends' sites. Kept as one list in `site_settings` (key "friends"),
 * edited in Studio → Friends.
 */

export const FRIEND_KINDS = [
  { value: "ambassador", label: "Brand ambassadors", one: "Ambassador" },
  { value: "gallery", label: "Galleries", one: "Gallery" },
  { value: "friend", label: "Friends", one: "Friend" },
] as const;

export type FriendKind = (typeof FRIEND_KINDS)[number]["value"];

export type Friend = {
  id: string;
  kind: FriendKind;
  name: string;
  /** one line: who they are, why they're here */
  blurb: string;
  url: string;
  /** Instagram handle without @ (optional) */
  instagram: string;
  image_path: string;
};

const isKind = (v: unknown): v is FriendKind => FRIEND_KINDS.some((k) => k.value === v);

export function normaliseFriends(value: unknown): Friend[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((f) => f && typeof f === "object" && typeof f.name === "string" && f.name.trim())
    .map((f) => ({
      id: String(f.id ?? crypto.randomUUID()),
      kind: isKind(f.kind) ? f.kind : "friend",
      name: String(f.name).trim(),
      blurb: String(f.blurb ?? "").trim(),
      url: String(f.url ?? "").trim(),
      instagram: String(f.instagram ?? "").trim().replace(/^@/, ""),
      image_path: String(f.image_path ?? "").trim(),
    }));
}

/** Makes "janebee.co.uk" a proper link; anything that isn't http(s) is dropped. */
export function safeUrl(url: string) {
  if (!url) return "";
  const u = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const p = new URL(u);
    return p.protocol === "https:" || p.protocol === "http:" ? p.toString() : "";
  } catch {
    return "";
  }
}

export const prettyUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
