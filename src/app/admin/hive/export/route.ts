import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";

/** CSV of the mailing list (consented sign-ups) for import into an email tool. */
export async function GET() {
  const viewer = await getViewer();
  if (viewer?.role !== "admin") return new NextResponse("Not allowed", { status: 403 });
  const supabase = await serverClient();
  const { data } = await supabase.from("hive_signups").select("email, first_name, source, created_at").order("created_at");
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = ["email,first_name,source,joined", ...(data ?? []).map((r) => [r.email, r.first_name, r.source, r.created_at].map(esc).join(","))].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="the-hive-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
