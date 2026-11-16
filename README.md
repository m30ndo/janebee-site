# Jane Bee — website

Private build of janebee.co.uk. The public holding page stays live (separate `janebee` Vercel project) until launch.

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

## Roadmap
1. ✅ 3D gallery rooms + painting pop-up (this build)
2. Admin (`/admin`): upload paintings, arrange rooms, set prices and release dates; orders
3. Shop: prints & merch, cart, Stripe webhook → orders + mark originals sold
4. Members web app (installable PWA): sign in, early access, event invitations & RSVPs
5. Final design from Jez, then launch: swap the domain from the holding page

## Licences
- Fraunces, DM Sans: SIL OFL (see `src/app/fonts/`).
- **Punk Kid**: free for personal use only. Buy a commercial licence before launch.
