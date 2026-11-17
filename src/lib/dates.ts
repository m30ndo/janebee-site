/** Admin date helpers. Jane enters UK times; the database stores UTC. */
const TZ = "Europe/London";

function offsetMinutes(at: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return (asUtc - at.getTime()) / 60000;
}

/** "2026-12-14T19:00" (UK time) → ISO UTC, or null when empty. */
export function fromLocalInput(value: FormDataEntryValue | null): string | null {
  const v = String(value ?? "").trim();
  if (!v) return null;
  const naive = new Date(`${v}:00Z`);
  if (Number.isNaN(naive.getTime())) return null;
  return new Date(naive.getTime() - offsetMinutes(naive) * 60000).toISOString();
}

/** ISO UTC → "YYYY-MM-DDTHH:mm" in UK time, for <input type="datetime-local">. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const local = new Date(d.getTime() + offsetMinutes(d) * 60000);
  return local.toISOString().slice(0, 16);
}

export function formatUk(iso: string | null | undefined, withTime = true): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, day: "numeric", month: "short", year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

/** Where an item is in its release cycle. */
export function releaseState(publicFrom: string | null, membersFrom: string | null, now = Date.now()) {
  const pub = publicFrom ? Date.parse(publicFrom) : null;
  const mem = membersFrom ? Date.parse(membersFrom) : null;
  if (pub !== null && pub <= now) return "public" as const;
  if (mem !== null && mem <= now) return "members" as const;
  if (pub === null && mem === null) return "draft" as const;
  return "scheduled" as const;
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export const toPence = (v: FormDataEntryValue | null): number | null => {
  const n = Number(String(v ?? "").replace(/[£,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null;
};

export const fromPence = (p: number | null | undefined) => (p ? (p / 100).toFixed(2).replace(/\.00$/, "") : "");
export const isoHoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

/* ---------------------------------------------------------------- diary (date-only values, "YYYY-MM-DD") */
const dateOnly = (d: string) => new Date(`${d}T12:00:00Z`);
const fmt = (d: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...o }).format(dateOnly(d));

export const dayParts = (d: string) => ({
  day: fmt(d, { day: "numeric" }),
  weekday: fmt(d, { weekday: "short" }),
  month: fmt(d, { month: "short" }),
  monthYear: fmt(d, { month: "long", year: "numeric" }),
});

/** "14 Nov – 2 Dec 2026", "3–9 Mar 2027", or "14 Nov 2026" for one day. */
export function formatDateRange(start: string, end?: string | null): string {
  if (!end || end === start) return fmt(start, { day: "numeric", month: "short", year: "numeric" });
  const [sy, sm] = start.split("-");
  const [ey, em] = end.split("-");
  if (sy === ey && sm === em) return `${fmt(start, { day: "numeric" })}–${fmt(end, { day: "numeric", month: "short", year: "numeric" })}`;
  if (sy === ey) return `${fmt(start, { day: "numeric", month: "short" })} – ${fmt(end, { day: "numeric", month: "short", year: "numeric" })}`;
  return `${fmt(start, { day: "numeric", month: "short", year: "numeric" })} – ${fmt(end, { day: "numeric", month: "short", year: "numeric" })}`;
}

/** Today's date in the UK as "YYYY-MM-DD". */
export const ukToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());

/** UK time of day, e.g. "6:30pm". */
export const formatUkTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso)).replace(":00", "").replace(/\s/g, "");
