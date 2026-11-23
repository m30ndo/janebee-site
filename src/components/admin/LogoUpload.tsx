"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";

const TYPES = ["image/svg+xml", "image/png", "image/gif", "image/webp"];

/** Uploads a logo file exactly as it is (no resizing, keeps transparency and animation). */
export function LogoUpload() {
  const [path, setPath] = useState("");
  const [mime, setMime] = useState("");
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState("SVG is best. PNG, GIF (animated is fine) or WebP with a transparent background also work. Up to 2 MB.");
  const [err, setErr] = useState(false);

  async function onFile(file: File) {
    setErr(false);
    if (!TYPES.includes(file.type)) { setErr(true); setMsg("That file type won't work. Use SVG, PNG, GIF or WebP."); return; }
    if (file.size > 2 * 1024 * 1024) { setErr(true); setMsg("That's over 2 MB. Export it smaller and try again."); return; }
    setMsg("Uploading…");
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const name = `logos/${Date.now()}-${file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.${ext}`;
    const { error } = await browserClient().storage.from("artwork").upload(name, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) { setErr(true); setMsg(error.message); return; }
    setPath(name);
    setMime(file.type);
    setPreview(URL.createObjectURL(file));
    setMsg("Uploaded. Fill in the rest and press Add logo.");
  }

  return (
    <div className="md:col-span-2">
      <input type="hidden" name="image_path" value={path} />
      <input type="hidden" name="mime" value={mime} />
      <div className="flex flex-wrap items-center gap-5">
        <div className="grid h-32 w-32 place-items-center rounded-xl border border-dashed border-white/25 bg-black p-3">
          {preview ? <img src={preview} alt="" className="max-h-full max-w-full" /> : <span className="text-xs text-white/40">No file yet</span>}
        </div>
        <div className="max-w-sm">
          <label className="inline-block cursor-pointer rounded-full border border-white/25 px-5 py-2 text-sm hover:border-honey">
            Choose logo file
            <input type="file" accept={TYPES.join(",")} className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </label>
          <p className={`mt-2 text-xs ${err ? "text-honey" : "text-white/55"}`}>{msg}</p>
        </div>
      </div>
    </div>
  );
}
