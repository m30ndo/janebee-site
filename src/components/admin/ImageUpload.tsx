"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";

const MAX_EDGE = 2800; // keeps uploads fast and gallery textures sharp

/** Uploads an image to the "artwork" bucket and fills hidden fields with its path and size. */
export function ImageUpload({
  initialPath,
  initialUrl,
  initialWidth,
  initialHeight,
  folder,
  hint = "A good, straight-on photo of the work. JPEG or PNG; large files are resized automatically.",
}: {
  initialPath?: string | null;
  initialUrl?: string | null;
  initialWidth?: number | null;
  initialHeight?: number | null;
  folder: string;
  hint?: string;
}) {
  const [path, setPath] = useState(initialPath ?? "");
  const [preview, setPreview] = useState(initialUrl ?? "");
  const [size, setSize] = useState({ w: initialWidth ?? 0, h: initialHeight ?? 0 });
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onFile(file: File) {
    setStatus("working");
    setMessage("Preparing image…");
    try {
      const { blob, w, h } = await resize(file);
      setMessage("Uploading…");
      const name = `${folder}/${Date.now()}-${file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.jpg`;
      const { error } = await browserClient().storage.from("artwork").upload(name, blob, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw error;
      setPath(name);
      setSize({ w, h });
      setPreview(URL.createObjectURL(blob));
      setStatus("idle");
      setMessage("Uploaded — remember to Save.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <div className="md:col-span-2">
      <input type="hidden" name="image_path" value={path} />
      <input type="hidden" name="image_width" value={size.w || ""} />
      <input type="hidden" name="image_height" value={size.h || ""} />
      <div className="flex flex-wrap items-start gap-5">
        <div className="grid h-44 w-44 place-items-center overflow-hidden rounded-xl border border-dashed border-white/25 bg-white/[0.04] ring-1 ring-white/10">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-xs opacity-50">No image</span>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <label className="inline-block cursor-pointer rounded-full border border-white/40 px-4 py-2 font-medium hover:border-honey hover:bg-honey hover:text-black">
            {preview ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="sr-only"
              disabled={status === "working"}
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>
          <p className="opacity-60">{hint}</p>
          {size.w > 0 && <p className="opacity-60">{size.w} × {size.h} px</p>}
          {message && <p className={status === "error" ? "text-[#ff7a66]" : "opacity-80"}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

async function resize(file: File): Promise<{ blob: Blob; w: number; h: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not process image"))), "image/jpeg", 0.88));
  return { blob, w, h };
}
