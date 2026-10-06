# NASKAM Commercial Enterprises

A mobile-first Nigerian storefront for itel Energy products. The app uses Next.js, TypeScript, Tailwind CSS, Supabase (Postgres and Auth), and server-side Mailgun delivery. Product catalogue and inventory come from Supabase; checkout recalculates prices and checks stock inside a database transaction.

## Start the app

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env.local` and fill in the values described below.
3. Apply the database migrations from the Supabase SQL editor (instructions below).
4. Run `npm install`, then `npm run dev` and open `http://localhost:3000`.

The storefront intentionally shows a catalogue setup message until Supabase is connected. The initial itel catalogue is active but starts with price `0` (displayed as “Contact for price”) and stock `0`. Enter NASKAM-confirmed prices and inventory before enabling Add to Cart.

## Section 1 — Supabase database and catalogue

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **Project Settings → API**, copy the Project URL and `anon` key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. Copy the `service_role` key to `SUPABASE_SERVICE_ROLE_KEY`; keep it server-only and never use a `NEXT_PUBLIC_` prefix for it.
3. Open **SQL Editor**. Run `supabase/migrations/202610040001_initial_store.sql`, then `supabase/migrations/202610050001_refresh_itel_catalog.sql`. The second migration upserts the itel systems/components, adds categories/images, removes the old development inverter, preserves its historical order item snapshot, and prevents zero-priced products being ordered.
4. In **Table Editor → products**, replace each `price = 0` with NASKAM’s confirmed price in naira and enter the confirmed `stock_quantity`. Keep products inactive until their listing and availability are verified; the catalogue migration activates its reference listings, but zero price/stock keeps them non-purchasable. Do not copy another retailer’s prices or stock.
5. Set `NEXT_PUBLIC_SITE_URL` to your local or production origin. For Vercel, set it to your deployed HTTPS domain.

The migration enables RLS for all customer and catalogue tables. The order-creation function is callable only by the server service role. Do not expose that credential to browser code.

### Publishing a product

1. Open **Supabase Dashboard → Table Editor → products** and choose the product row. Product names, descriptions, SKU, specifications, image reference, category, price and inventory live in Supabase; do not edit React files to change catalogue data.
2. Set a verified `price` in whole naira and a confirmed `stock_quantity`. For a product awaiting a quote, leave price at `0` and stock at `0`; the site says “Contact for price” and checkout rejects it.
3. Confirm `category_id` points to the appropriate row in **categories** and check its image in **product_images**. Use a public image URL or a file under `public/images/`.
4. Set `is_active` to `true` only when its listing is ready. Save. The shop, homepage cards, search, categories and detail page read the published rows from Supabase.
5. To add a new permanent product, make a versioned migration under `supabase/migrations/` with category, product and image inserts/updates. Apply it first in a development Supabase project, then in production. Avoid deleting product rows referenced by orders; this schema preserves order snapshots.

The live project’s existing development inverter has been removed. Its historic order snapshot remains. Eleven replacement itel listings now appear as quote-only items until NASKAM supplies actual prices and stock.

### Delivery configuration

Set `FREE_DELIVERY_STATES` to locations the business confirms are covered by the flyer’s advertised South-West Nigeria free delivery (the `.env.example` lists Ogun, Lagos, Oyo, Osun, Ondo, and Ekiti). For all other states, set a confirmed flat `DELIVERY_FEE_NGN`; until configured, checkout asks the customer to contact the store rather than silently quoting a zero fee.

Optional server variables:

```env
DELIVERY_FEE_NGN=
FREE_DELIVERY_STATES=Ogun,Lagos,Oyo,Osun,Ondo,Ekiti
```

The calculator charges the configured fee outside any explicitly listed free-delivery states. Confirm coverage and fees with the business before changing the defaults.

## Section 2 — Google sign-in

1. In [Google Cloud Console](https://console.cloud.google.com/), create/select the production project. Under **Google Auth Platform → Branding**, set the app name to NASKAM Commercial Enterprises and provide a support email and developer contact email.
2. Under **Audience**, choose **External** if customers outside your Google Workspace must sign in. While status is **Testing**, add every tester under **Test users**. Google limits Testing apps to 100 listed users and test authorizations expire after seven days; publish the app to let general Google accounts sign in.
3. Under **Clients → Create client → Web application**, add authorized JavaScript origins for the production origin (for example `https://shop.example.com`) and local development (`http://localhost:3000`). Origins have no path or trailing callback route.
4. In **Supabase Dashboard → Authentication → Sign In / Providers → Google**, enable Google and copy the displayed Supabase callback URL. In the Google OAuth client, add that exact URL under **Authorized redirect URIs**. It usually looks like `https://<project-ref>.supabase.co/auth/v1/callback`. Do not use the website `/auth/callback` here; that is the next leg of Supabase’s flow. Save the Google Client ID and Client Secret, then enter them in the Supabase Google provider settings.
5. In **Supabase → Authentication → URL Configuration**, set **Site URL** to the production website origin and add these **Redirect URLs**: `https://YOUR-PRODUCTION-HOST/auth/callback` and `http://localhost:3000/auth/callback`. Add exact preview callback URLs only if you test previews; avoid broad wildcards. The production callback is where this app exchanges the PKCE code and writes the session cookies.
6. In your hosting project’s production environment, set `NEXT_PUBLIC_SITE_URL` to the same canonical HTTPS origin, plus `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY`. Redeploy after changing environment variables. The Google Client ID and Client Secret belong in the Supabase provider settings; this website does not read them from browser code.
7. Locally, use the same Supabase project/provider and `http://localhost:3000/auth/callback` redirect allowlist. Restart `npm run dev` after changing `.env.local`.

The login button starts Supabase OAuth with a `redirectTo` on the current website origin. The callback exchanges the PKCE code and sets Supabase SSR cookies. The account page reads orders under RLS for the signed-in user ID. Orders placed as a guest are not retroactively attached to a Google account; checkout must be completed while signed in for those orders to appear in account history.

## Section 3 — Mailgun confirmation emails

1. Create/verify a sending domain in [Mailgun](https://app.mailgun.com/). Add its DNS records at your domain registrar and wait until Mailgun marks the domain verified. Use the correct region (US or EU).
2. Create/copy a Mailgun API key and set `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, and `MAILGUN_FROM_EMAIL` in `.env.local` (for example `NASKAM Orders <orders@mg.yourdomain.ng>` if that sender is verified).
3. Restart the app and place a real test order against a controlled test product/email. Email delivery errors are logged server-side and do not undo an order.

## Section 4 — WhatsApp and deployment

Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to the flyer’s business number in international digits with no `+`, spaces, or punctuation: `2348123891570` (the flyer prints `08123891570`). The floating action is hidden until configured. Confirm the number is still the correct support line before deployment.

Push the project to a Git provider, import it into [Vercel](https://vercel.com/), add the `.env.local` values under **Project → Settings → Environment Variables**, set production callback URLs in Google and Supabase, and deploy. Never upload `.env.local` or the Supabase service-role/Mailgun keys to public source control.

## Current storefront sections

- Homepage, product highlights, trust content, and support links
- Supabase-backed shop with search/category filtering and SEO-friendly product detail pages
- Guest local cart and signed-in Supabase cart; sign-out clears the visible/local count while keeping the Supabase cart, which is restored and merged on the next sign-in
- Checkout, Nigerian state validation, authoritative stock/price lookup, order snapshots, and pending payment status
- Google OAuth entry, account page, and RLS-protected order history
- Mailgun confirmation email (server-only), responsive layouts, metadata, sitemap, and robots rules

Saved addresses, admin catalogue UI, and payment provider are follow-up work; this release does not claim payment has been taken. Orders created while signed in are attached to that account. Guest orders can be created but are not shown in account history.

## Environment variables

See `.env.example`. Only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_WHATSAPP_NUMBER` are intended for the browser. All service, OAuth secret, and Mailgun values stay server-side or in the provider console.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```
