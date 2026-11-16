import Link from "next/link";
import type { ReactNode } from "react";
import { DeleteButton } from "./DeleteButton";

/** Small, plain building blocks for the admin screens. */

export const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 text-[15px] text-white placeholder:text-white/35 outline-none focus:border-honey focus:ring-2 focus:ring-honey/30 [&>option]:bg-neutral-900";

export function PageHead({ title, action, children }: { title: string; action?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-4xl font-light text-white">{title}</h1>
        {children && <div className="mt-2 text-sm text-white/60">{children}</div>}
      </div>
      {action && (
        <Link href={action.href} className="rounded-full bg-honey px-5 py-2.5 text-sm font-medium text-black hover:bg-white">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Field({ label, hint, children, wide }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-sm font-medium text-white/90">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/50">{hint}</span>}
    </label>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <legend className="px-2 text-xs font-medium tracking-[0.18em] text-honey uppercase">{title}</legend>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function SaveBar({ deleteAction, id, label = "Save", what }: { deleteAction?: (d: FormData) => Promise<void>; id?: string; label?: string; what?: string }) {
  return (
    <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-4 border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur">
      <button className="rounded-full bg-honey px-8 py-3 font-medium text-black hover:bg-white">{label}</button>
      {deleteAction && id && <DeleteButton action={deleteAction} what={what} />}
    </div>
  );
}

export function Notice({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  if (typeof searchParams.error === "string")
    return <p className="mb-6 rounded-xl border border-[#ff7a66]/40 bg-[#ff7a66]/10 px-4 py-3 text-sm text-[#ffb3a6]">{searchParams.error}</p>;
  if (searchParams.saved)
    return <p className="mb-6 rounded-xl border border-honey/40 bg-honey/10 px-4 py-3 text-sm text-honey">Saved. Changes show on the site within a minute.</p>;
  return null;
}

const releaseStyles = {
  public: "bg-white text-black",
  members: "bg-honey text-black",
  scheduled: "border border-honey/60 text-honey",
  draft: "bg-white/10 text-white/60",
};
const releaseText = { public: "Public", members: "Members only", scheduled: "Scheduled", draft: "Draft (hidden)" };

export function ReleaseBadge({ state }: { state: keyof typeof releaseStyles }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${releaseStyles[state]}`}>{releaseText[state]}</span>;
}

export function ReleaseFields({ publicFrom, membersFrom }: { publicFrom: string; membersFrom: string }) {
  return (
    <Section title="Release">
      <Field label="Hive members see it from" hint="Leave both empty to keep it hidden (draft). UK time.">
        <input type="datetime-local" name="members_from" defaultValue={membersFrom} className={inputCls} />
      </Field>
      <Field label="Everyone sees it from" hint="Set later than the members date to give the Hive early access.">
        <input type="datetime-local" name="public_from" defaultValue={publicFrom} className={inputCls} />
      </Field>
    </Section>
  );
}
