import Link from "next/link";
import { notFound } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/supabase/public";
import { formatUk, toLocalInput } from "@/lib/dates";
import { deleteEvent, saveEvent } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Field, Notice, PageHead, ReleaseFields, SaveBar, Section, inputCls } from "@/components/admin/ui";

export default async function EventEdit({ params, searchParams }: PageProps<"/admin/events/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  const supabase = await serverClient();
  const { data: e } = isNew ? { data: null } : await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!isNew && !e) notFound();
  const { data: rsvps } = isNew
    ? { data: [] }
    : await supabase.from("event_rsvps").select("member_id, status, guests, created_at, profiles!event_rsvps_member_profile_fkey(first_name, email)").eq("event_id", id).order("created_at");

  return (
    <>
      <PageHead title={isNew ? "New event" : e!.title}>
        <Link href="/admin/events" className="underline underline-offset-4">← All events</Link>
      </PageHead>
      <Notice searchParams={await searchParams} />
      <form action={saveEvent}>
        <input type="hidden" name="id" value={e?.id ?? ""} />
        <Section title="Event">
          <Field label="Title">
            <input name="title" required defaultValue={e?.title ?? ""} className={inputCls} />
          </Field>
          <Field label="Date & time (UK)">
            <input name="starts_at" type="datetime-local" required defaultValue={toLocalInput(e?.starts_at)} className={inputCls} />
          </Field>
          <Field label="Location">
            <input name="location" defaultValue={e?.location ?? ""} className={inputCls} />
          </Field>
          <Field label="Capacity" hint="Leave empty for no limit.">
            <input name="capacity" type="number" min={1} defaultValue={e?.capacity ?? ""} className={inputCls} />
          </Field>
          <Field label="Details" wide>
            <textarea name="description" rows={5} defaultValue={e?.description ?? ""} className={inputCls} />
          </Field>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="members_only" defaultChecked={e?.members_only ?? true} className="h-4 w-4 accent-honey" />
            Members only (invitation)
          </label>
          <Field label="Web address" hint="Leave empty to make one from the title.">
            <input name="slug" defaultValue={e?.slug ?? ""} className={inputCls} />
          </Field>
          <ImageUpload folder="events" initialPath={e?.image_path} initialUrl={imageUrl(e?.image_path)} />
        </Section>
        <ReleaseFields publicFrom={toLocalInput(e?.public_from)} membersFrom={toLocalInput(e?.members_from ?? (isNew ? new Date().toISOString() : null))} />
        <SaveBar deleteAction={isNew ? undefined : deleteEvent} id={e?.id} what="this event and its RSVPs" />
      </form>

      {!isNew && (
        <section className="mt-10">
          <h2 className="mb-4 font-serif text-2xl">RSVPs</h2>
          <ul className="divide-y divide-white/10 rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
            {(rsvps ?? []).length === 0 && <li className="p-5 text-sm opacity-60">No replies yet.</li>}
            {(rsvps ?? []).map((r) => (
              <li key={r.member_id} className="flex justify-between p-4 text-sm">
                <span>
                  {(r.profiles as unknown as { first_name: string | null; email: string | null } | null)?.first_name ?? "Member"}
                  {r.guests ? ` +${r.guests}` : ""}
                  <span className="ml-2 opacity-60">{(r.profiles as unknown as { email: string | null } | null)?.email}</span>
                </span>
                <span className="opacity-70">{r.status === "going" ? "Going" : "Can't make it"} · {formatUk(r.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
