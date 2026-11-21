/** Member messages (Studio → Messages): one message, sent to the app inbox, email and phone notifications. */

export const MESSAGE_KINDS = [
  { key: "new_work", label: "New piece", eyebrow: "New work", button: "See it first" },
  { key: "viewing", label: "Gallery viewing", eyebrow: "Private view", button: "Save my place" },
  { key: "event", label: "Event", eyebrow: "You're invited", button: "Find out more" },
  { key: "news", label: "News", eyebrow: "From the studio", button: "Read more" },
] as const;
export type MessageKind = (typeof MESSAGE_KINDS)[number]["key"];

export const AUDIENCES = [
  { key: "members", label: "App members", hint: "Everyone signed up to The Hive app" },
  { key: "hive", label: "Newsletter only", hint: "The Hive mailing list (email only — they have no app)" },
  { key: "everyone", label: "Everyone", hint: "App members and the mailing list, without doubles" },
] as const;
export type Audience = (typeof AUDIENCES)[number]["key"];

export const CHANNELS = [
  { key: "app", label: "App inbox", hint: "Shows in the app's inbox (the bell)" },
  { key: "email", label: "Email", hint: "Branded email, with an unsubscribe link" },
  { key: "push", label: "Phone notification", hint: "For members who turned notifications on" },
] as const;
export type Channel = (typeof CHANNELS)[number]["key"];

export const kindOf = (k: string) => MESSAGE_KINDS.find((m) => m.key === k) ?? MESSAGE_KINDS[3];

export type MemberMessage = {
  id: string; kind: MessageKind; title: string; body: string; linkUrl: string | null; linkLabel: string | null;
  image: string | null; sentAt: string | null; read: boolean;
};
