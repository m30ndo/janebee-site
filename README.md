# Jane Bee — website

Private build of janebee.co.uk (Vercel project `janebee-site`, password-protected preview). The public holding page stays live (separate `janebee` Vercel project) until launch.

## Stack
- **Next.js 16** (App Router, Cache Components) on **Vercel**
- **Supabase** project "Jane Bee" (`qtwdlbbqxbmirjjtvhtk`, London): rooms, paintings, shop, orders, members, events, Hive sign-ups, enquiries
- **Three.js / React Three Fiber**: the walk-through 3D gallery
- **Stripe Checkout**: one-of-one originals (prints & cart to follow)

## Privacy until launch
- `SITE_PASSWORD` set on Vercel → every page asks for a password (any username). Remove it on launch day.
- All pages send `noindex`, and `robots.txt` blocks crawlers.

## Run locally
```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev
```
Without `NEXT_PUBLIC_SUPABASE_URL` the site falls back to the sample data in `src/lib/sample.ts`.

## Gallery
- One collection = one room (`collections` table); works hang alternately left/right in `sort_order` (`src/components/gallery/layout.ts`).
- Desktop: W A S D / arrows, drag to look, scroll to move, click a work. Mobile: drag to look, tap the floor to walk, tap a work.
- Click a work → camera glides to it, pop-up shows the story, **Buy** (Stripe) or **Enquire**.
- Deep links: `/gallery?room=<collection-slug>`; every work also has `/work/<slug>`.

## Early access
Every collection, painting, product and event has `public_from` and `members_from`. Row-level security shows rows to the public after `public_from` and to signed-in members after `members_from`, so early access is enforced by the database.

## What's built
- **Gallery** `/gallery`: 3D rooms per collection; click a work → story, Buy now, Add to basket, Enquire.
- **Shop** `/shop`, `/shop/<slug>`, `/basket`: originals + prints; Stripe Checkout (UK delivery, rates in `src/lib/shop.ts`).
- **Members app** `/members` (installable "The Hive"): email-code sign-in, early access, invitations + RSVP, orders, account.
- **Admin** `/admin` (Jez & Jane, by email): rooms + hanging order, paintings with photo upload, prints with sizes/stock, events + RSVPs, orders, enquiries, Hive list + CSV.
- **Home carousel** (Studio → Home carousel; tables `carousel_slides`, `carousel_settings`): speed, size, pause-on-hover; each slide = upload or a painting's photo, shape + focal position, order, and a click-through to the work/room in the gallery. Shows the gallery's works until a slide is added.
- **Journal**: posts have a `category` (section) used for the tags and filter. Sample posts, events and diary dates marked "(sample)" were added in Nov 2026 — delete them in Studio before launch.
- **Footer contact details / socials**: `src/lib/contact.ts`.
- **Stripe webhook** `/api/stripe/webhook`: records orders, marks originals sold, reduces stock.

## Environment (Vercel)
| Variable | What |
|---|---|
| `SITE_PASSWORD` | private preview password (remove at launch) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Jane Bee project |
| `SUPABASE_SECRET_KEY` | Supabase secret key (webhook only) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe (test keys until launch) |
| `NEXT_PUBLIC_SITE_URL` | e.g. https://janebee-site.vercel.app |

## Still to do
- Custom SMTP (e.g. Resend) in Supabase so sign-in codes reach everyone, not just the team
- Enquiry email notifications to Jane; international shipping
- Final design from Jez; logo/icon; launch: swap domain from the holding page, remove `SITE_PASSWORD`

## Licences
- Fraunces, DM Sans: SIL OFL (see `src/app/fonts/`).
- **Punk Kid**: free for personal use only. Buy a commercial licence before launch.
