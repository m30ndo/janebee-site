import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/lib/supabase/public";

/**
 * Legal pages. The text lives in Supabase (`legal_pages`) and is edited in
 * Studio → Legal pages. These defaults are the starting point (and the
 * fallback when the database has no row yet). UK-standard wording — have it
 * checked before launch.
 */

export type LegalPage = { slug: string; title: string; body: string; updatedAt: string | null };

const UPDATED = "November 2026";

export const LEGAL_DEFAULTS: Omit<LegalPage, "updatedAt">[] = [
  {
    slug: "shipping",
    title: "Shipping",
    body: `Every piece is packed by hand in the studio, with a lot of care and a little too much tape.

## Where we deliver
UK only for now. If you're further afield and fall in love with something, send Jane a message and we'll see what we can do.

## Prints
Sent by Royal Mail Tracked, usually within 2–4 working days of your order. Prints travel flat or rolled in a sturdy tube, depending on the size.

## Original paintings
Sent by insured courier, usually within 3–7 working days. Originals are wrapped, corner-protected and boxed. Someone will need to be in to sign for it.

## Delivery charges
The delivery price is shown in your basket before you pay.

## Tracking
You'll get an email with tracking as soon as your order is on its way.

## Damaged in transit?
It's rare, but it happens. Email within 48 hours of delivery with photos of the piece and the packaging and we'll put it right: a replacement, a repair or a full refund.

*Last updated ${UPDATED}.*`,
  },
  {
    slug: "returns",
    title: "Returns",
    body: `We want you to love it on your wall. If you don't, here's how returns work.

## Your 14 days
Under UK consumer law you can cancel an online order within 14 days of receiving it, for any reason. Tell us within those 14 days (a message through the contact page is fine), then send the item back within 14 days of telling us.

## Condition
Please return it as it arrived: unhung, undamaged and in its original packaging where you can. Originals must come back by insured, tracked delivery.

## Refunds
We refund the price you paid plus standard delivery within 14 days of getting the item back. Return postage is paid by you unless the item arrived faulty or damaged.

## What can't be returned
Commissions and anything made or personalised to your own specification can't be returned unless faulty.

## Faulty or not as described
Your statutory rights always apply. Contact us and we'll repair, replace or refund.

*Last updated ${UPDATED}.*`,
  },
  {
    slug: "privacy",
    title: "Privacy",
    body: `This explains what we collect, why, and what you can ask us to do with it. "We" means Jane Bee, the artist behind janebee.co.uk and The Hive app.

## What we collect
- **The Hive newsletter:** your email address, first name if you give it, and when you joined.
- **The Hive app:** your email, first name and password (stored encrypted by our login provider), your RSVPs and what you've bought.
- **Orders:** name, email, delivery address and what you ordered. Card payments are handled entirely by Stripe; we never see your card details.
- **Messages:** anything you send through the contact form.
- **Baskets:** if you're signed in, or you agree at checkout, we keep what's in your basket so we can send you one reminder if you don't finish buying.

## Why we use it
To fulfil orders, run the members app, send the newsletter and member messages you signed up for, answer your messages, and keep the site safe. Our legal bases are contract (orders and the app), consent (newsletter, member messages and basket reminders) and legitimate interests (security and keeping records).

## Who else handles it
We use a small number of trusted services to run the site: Supabase (database and logins, UK/EU), Vercel (hosting), Stripe (payments) and our email provider. They only process your data on our instructions. We never sell your data.

## How long we keep it
Order records for 6 years (UK tax rules). Newsletter and app details until you unsubscribe or close your account. Messages for up to 2 years.

## Your rights
You can ask to see, correct or delete your data, object to how we use it, or withdraw consent at any time. Every email has an unsubscribe link, and you can ask us to close your app account at any time. If you're unhappy with how we've handled your data you can complain to the Information Commissioner's Office (ico.org.uk).

*Last updated ${UPDATED}.*`,
  },
  {
    slug: "cookies",
    title: "Cookies",
    body: `Short version: we only use what the site needs to work. No advertising cookies, no tracking across other sites.

## Essential cookies
- **Sign-in (sb-…):** keeps you signed in to The Hive app. Set by our login provider, Supabase.
- **Checkout:** Stripe sets its own cookies on its secure checkout page to process your payment and prevent fraud.

## Stored on your device (not cookies)
Your basket, whether music is playing, your volume, and whether you've closed a menu or a tip are remembered in your browser's local storage so the site behaves the same next time. Nothing in it is sent to us.

## Fonts
Some fonts may load from Google Fonts. Google receives your IP address to deliver them but doesn't set cookies.

## Changing your mind
You can clear cookies and site data in your browser settings at any time. The site will just forget your basket and sign you out.

*Last updated ${UPDATED}.*`,
  },
  {
    slug: "terms",
    title: "Terms",
    body: `The small print for buying from janebee.co.uk and using The Hive app.

## Who we are
janebee.co.uk is run by Jane Bee, an artist based in the UK.

## Buying
Prices are in pounds and include any VAT that applies. Your order is accepted when we email to confirm it. Originals are one of one: if two people check out at once, the first payment wins and the other is refunded in full.

## Colours and sizes
We photograph every piece as truthfully as we can, but screens vary. Sizes are given in centimetres and may vary by a few millimetres.

## Copyright
Buying a painting or print gives you the object, not the copyright. All images and artwork remain © Jane Bee. Please don't reproduce them without asking.

## The Hive app
Membership is free and personal to you. We may change or close features with notice. Early access means members see work before the public; it doesn't guarantee availability.

## Law
These terms are governed by the law of England and Wales. Nothing here affects your statutory rights.

*Last updated ${UPDATED}.*`,
  },
];

export async function getLegalPages(): Promise<LegalPage[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("legal");
  const fallback = LEGAL_DEFAULTS.map((p) => ({ ...p, updatedAt: null }));
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return fallback;
  const { data } = await publicClient().from("legal_pages").select("slug, title, body, updated_at").order("sort_order");
  if (!data?.length) return fallback;
  return data.map((r) => ({ slug: r.slug, title: r.title, body: r.body, updatedAt: r.updated_at }));
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  return (await getLegalPages()).find((p) => p.slug === slug) ?? null;
}
