"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { publicClient } from "@/lib/supabase/public";
import { getPainting } from "@/lib/data";

export type FormState = { status: "idle" | "ok" | "error"; message: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** The Hive mailing list sign-up. */
export async function joinHive(_prev: FormState, data: FormData): Promise<FormState> {
  if (data.get("company")) return { status: "ok", message: "You're in the Hive." }; // honeypot
  const email = String(data.get("email") ?? "").trim();
  const firstName = String(data.get("first_name") ?? "").trim().slice(0, 80) || null;
  const source = String(data.get("source") ?? "site").slice(0, 50);

  if (!EMAIL.test(email)) return { status: "error", message: "Please enter a valid email address." };
  if (data.get("consent") !== "on") return { status: "error", message: "Please tick the box so Jane can email you." };

  const { error } = await publicClient().from("hive_signups").insert({ email, first_name: firstName, consent: true, source });
  if (error?.code === "23505") return { status: "ok", message: "You're already in the Hive. Good taste." };
  if (error) return { status: "error", message: "Something went wrong. Please try again in a moment." };
  return { status: "ok", message: `You're in the Hive${firstName ? `, ${firstName}` : ""}.` };
}

/** General, commission and per-painting enquiries. */
export async function sendEnquiry(_prev: FormState, data: FormData): Promise<FormState> {
  if (data.get("company")) return { status: "ok", message: "Thank you." };
  const name = String(data.get("name") ?? "").trim().slice(0, 120);
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim().slice(0, 5000);
  const kind = String(data.get("kind") ?? "general");
  const paintingId = String(data.get("painting_id") ?? "") || null;

  if (!name) return { status: "error", message: "Please add your name." };
  if (!EMAIL.test(email)) return { status: "error", message: "Please enter a valid email address." };
  if (!message) return { status: "error", message: "Please add a message." };

  const { error } = await publicClient().from("enquiries").insert({
    name, email, message, painting_id: paintingId,
    kind: ["general", "commission", "piece"].includes(kind) ? kind : "general",
  });
  if (error) return { status: "error", message: "Something went wrong. Please try again in a moment." };
  // TODO (phase 2): email Jane a copy via Resend.
  return { status: "ok", message: "Thank you. Jane will be in touch." };
}

/** Stripe Checkout for a one-of-one original. Falls back to enquiry until Stripe keys are set. */
export async function buyPainting(data: FormData) {
  const slug = String(data.get("slug") ?? "");
  const painting = await getPainting(slug);
  if (!painting || painting.status !== "available" || !painting.pricePence) redirect(`/work/${slug}`);

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) redirect(`/work/${slug}?checkout=unavailable#enquire`);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await new Stripe(key).checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: painting.pricePence,
        product_data: { name: `${painting.title} — original (one of one)`, metadata: { painting_id: painting.id } },
      },
    }],
    shipping_address_collection: { allowed_countries: ["GB"] },
    metadata: { painting_id: painting.id, slug: painting.slug },
    success_url: `${site}/work/${painting.slug}?checkout=success`,
    cancel_url: `${site}/gallery?room=${painting.collectionSlug ?? ""}`,
  });
  // TODO (phase 2): Stripe webhook records the order and marks the painting sold.
  redirect(session.url!);
}
