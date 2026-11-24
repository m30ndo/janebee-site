import type { Friend } from "@/lib/friends";
import { FRIEND_KINDS, prettyUrl, safeUrl } from "@/lib/friends";
import { imageUrl } from "@/lib/supabase/public";
import { IconArrowOut } from "@/components/members/icons";

/** One friend of the Hive: photo or logo, who they are, and a way to find them. */
export function FriendCard({ f, compact = false }: { f: Friend; compact?: boolean }) {
  const url = safeUrl(f.url);
  const ig = f.instagram ? `https://instagram.com/${encodeURIComponent(f.instagram)}` : "";
  const href = url || ig;
  const img = f.image_path ? imageUrl(f.image_path) : null;
  // GIFs and PNGs are logos: show the whole thing rather than cropping it
  const isLogo = /\.(gif|png)$/i.test(f.image_path);
  const kind = FRIEND_KINDS.find((k) => k.value === f.kind)?.one ?? "Friend";
  const body = (
    <>
      <div className={`relative overflow-hidden rounded-2xl bg-white/[0.06] ${compact ? "aspect-square" : "aspect-[4/3]"}`}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className={`h-full w-full transition-transform duration-700 group-hover:scale-105 ${isLogo ? "object-contain p-6" : "object-cover"}`} loading="lazy" />
        ) : (
          <span className="grid h-full w-full place-items-center font-title text-5xl font-light text-honey">{f.name.slice(0, 1)}</span>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-honey uppercase backdrop-blur">{kind}</span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-h2 text-xl leading-tight transition-colors group-hover:text-honey">{f.name}</p>
          {!compact && f.blurb && <p className="mt-1 text-sm leading-relaxed opacity-70">{f.blurb}</p>}
          {href && <p className="mt-1 truncate text-xs opacity-50">{url ? prettyUrl(url) : `@${f.instagram}`}</p>}
        </div>
        {href && <span className="mt-1 shrink-0 text-white/50 transition-colors group-hover:text-honey"><IconArrowOut /></span>}
      </div>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">{body}</a>
  ) : (
    <div className="group">{body}</div>
  );
}
