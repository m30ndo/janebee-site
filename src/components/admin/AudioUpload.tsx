"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { inputCls } from "./ui";

/** Upload a music file to the "music" bucket, then save it as a track. */
export function AudioUpload({ action }: { action: (d: FormData) => Promise<void> }) {
  const [path, setPath] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(0);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    if (file.size > 50 * 1024 * 1024) { setMsg("That file is over 50MB. Use an MP3 or AAC version."); return; }
    setBusy(true);
    setMsg("Uploading…");
    try {
      const ext = (file.name.split(".").pop() ?? "mp3").toLowerCase();
      const name = `${Date.now()}-${file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.${ext}`;
      const { error } = await browserClient().storage.from("music").upload(name, file, { contentType: file.type || "audio/mpeg", cacheControl: "31536000" });
      if (error) throw error;
      setPath(name);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      const a = new Audio(URL.createObjectURL(file));
      a.onloadedmetadata = () => setDuration(Math.round(a.duration || 0));
      setMsg("Uploaded — add a title and press Add track.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={action} className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[auto_1fr_1fr_auto] md:items-end">
      <input type="hidden" name="file_path" value={path} />
      <input type="hidden" name="duration" value={duration || ""} />
      <label className="inline-block cursor-pointer rounded-full border border-espresso px-4 py-2.5 text-sm font-medium hover:bg-espresso hover:text-cream">
        {path ? "✓ File uploaded" : "Choose audio file"}
        <input type="file" accept="audio/*" className="sr-only" disabled={busy} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Title</span>
        <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Artist</span>
        <input name="artist" className={inputCls} />
      </label>
      <button disabled={!path || busy} className="rounded-full bg-espresso px-6 py-3 text-sm font-medium text-cream hover:bg-honey hover:text-espresso disabled:opacity-40">
        Add track
      </button>
      {msg && <p className="text-sm opacity-70 md:col-span-4">{msg}</p>}
    </form>
  );
}
