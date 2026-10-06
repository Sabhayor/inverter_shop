# AGENTS.md

## Project

You are working on the **NASKAM Commercial Enterprises**, a modern Nigerian e-commerce website for selling itel Energy inverter systems and related solar/power products.

The supplied itel Energy promotional material is the visual reference. Use it for brand direction only. Do not copy its exact layout. The brand name is "NASKAM Commercial Enterprises" 

---

## Primary Objective

Build a simple, reliable, production-minded e-commerce experience where a customer can:

1. Browse products.
2. Search and filter products.
3. Open product details.
4. Add products to a cart.
5. Persist the cart.
6. Sign in with Google.
7. Complete checkout.
8. Create an order.
9. Receive an order confirmation email.
10. View the order in their account.

Prioritize the shopping and checkout experience over unnecessary features.

---

## Required Stack

Use:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui or equivalent
- Supabase PostgreSQL
- Supabase Auth
- Supabase RLS
- Google OAuth through Google Cloud Console + Supabase
- Mailgun
- Vercel-compatible deployment

Use TypeScript throughout the application.

---

## Architecture Principles

### 1. Database is the source of truth

Product data, inventory, categories, carts and orders must come from Supabase.

Do not hardcode product data in React components.

### 2. Server is authoritative for commerce calculations

Never trust client-supplied:

- prices
- inventory
- subtotal
- delivery fee
- total

Re-fetch current product information on the server and calculate the order total there.

### 3. Security first

Never expose:

- Supabase service-role key
- Mailgun API key
- Google client secret
- database credentials

Use environment variables.

### 4. RLS is mandatory

Use Supabase Row Level Security to ensure users can only access their own private records.

### 5. Keep business logic separate

Do not put database queries, order calculation logic or email implementation directly inside UI components.

Prefer service modules such as:

```text
lib/
  supabase/
  auth/
  products/
  cart/
  orders/
  email/
  payments/
```

---

## Recommended Structure

Use a structure similar to:

```text
app/
  page.tsx
  shop/
  cart/
  checkout/
  login/
  account/
  about/
  contact/
  faq/

components/
  ui/
  product/
  cart/
  checkout/
  auth/
  account/
  layout/

lib/
  supabase/
  auth/
  products/
  cart/
  orders/
  email/
  payments/
  validation/

supabase/
  migrations/
  seed.sql

public/
  images/

tests/

README.md
AGENTS.md
.env.example
```

Adapt the structure if the chosen Next.js architecture requires a different organization.

---

## Brand Direction

Use the supplied itel Energy flyer as inspiration.

Preferred palette:

```text
#071B5C  Primary Navy
#0B2A78  Secondary Navy
#D71920  Brand Red
#E5252A  Bright Red
#FFFFFF  White
#F5F7FA  Light Background
#111827  Dark Text
#6B7280  Muted Text
#E5E7EB  Border
```

Visual characteristics:

- clean
- technical
- trustworthy
- modern
- strong typography
- product-focused
- Nigerian e-commerce feel

Do not overuse gradients, shadows, animations or red.

Use red primarily for primary CTAs, prices, discounts and important states.

---

## Product Requirements

Product cards must display appropriate:

- image
- brand
- name
- price
- availability
- discount where applicable
- Add to Cart
- View Details

Product details must support:

- image gallery
- description
- specifications
- SKU
- price
- stock
- warranty
- quantity
- Add to Cart
- Buy Now

Do not invent technical specifications.

---

## Cart Requirements

Support:

- Add
- Remove
- Increase quantity
- Decrease quantity
- Subtotal
- Delivery
- Total

Unauthenticated users may have a localStorage cart.

Authenticated users should have a Supabase cart.

On authentication, merge the local cart into the server cart without duplicate product lines.

---

## Checkout Requirements

Collect:

- first name
- last name
- email
- phone
- address
- city
- state
- postal code
- country

Default country:

`Nigeria`

Use Nigerian states.

Before creating an order:

1. Validate input.
2. Retrieve current products.
3. Verify inventory.
4. Calculate subtotal.
5. Calculate delivery fee.
6. Calculate total.
7. Create order.
8. Create order items.
9. Update inventory where appropriate.
10. Trigger confirmation email.
11. Redirect to success page.

Do not calculate the authoritative total in the browser.

---

## Orders

Use separate:

```text
order status
payment status
```

Order status:

```text
Pending
Confirmed
Processing
Ready for Delivery
Shipped
Delivered
Cancelled
```

Payment status:

```text
Pending
Paid
Failed
Refunded
```

Generate unique human-readable order numbers.

Example:

```text
ITE-20261004-00125
```

Store historical snapshots in `order_items`:

- product name
- SKU
- unit price
- quantity
- subtotal

This prevents old orders from changing when a product is renamed or repriced.

---

## Authentication

Use Supabase Auth with Google OAuth.

Flow:

```text
Customer
  ↓
Continue with Google
  ↓
Google OAuth
  ↓
Supabase Auth
  ↓
Authenticated Session
```

Google credentials must be configured through Google Cloud Console.

Do not implement a custom password system unless explicitly required later.

---

## Mailgun

Mailgun must only be called server-side.

Required environment variables:

```env
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_FROM_EMAIL=
```

After a successful order, send a branded confirmation email containing:

- customer name
- order number
- items
- quantities
- prices
- subtotal
- delivery fee
- total
- delivery address

Do not block or falsely report order creation as successful if the email service fails.

Order creation and email delivery should have clear error handling/logging.

---

## Supabase

Recommended tables:

```text
profiles
categories
products
product_images
carts
cart_items
orders
order_items
addresses
```

Use migrations rather than manually modifying production tables.

Create seed data for local/development environments.

---

## RLS Rules

At minimum:

### Public

Can read active product/category information.

### Authenticated customer

Can access only their:

- profile
- cart
- cart items
- orders
- order items
- addresses

A customer must never access another customer's order.

Never use frontend-only checks as a substitute for RLS.

---

## Payment

Do not fake payment processing.

The initial application should be payment-ready.

Use a payment abstraction:

```text
PaymentProvider
```

Future providers may include:

- Paystack
- Flutterwave
- Bank Transfer

If no payment provider is configured, use:

```text
payment_status = pending
```

Never mark an order as paid without verified payment confirmation.

---

## Environment Variables

Create/update `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_FROM_EMAIL=

NEXT_PUBLIC_WHATSAPP_NUMBER=
```

Never commit `.env.local`.

If an environment variable is missing, provide a clear configuration error rather than silently using a secret or hardcoded fallback.

---

## Nigerian Commerce

Currency:

`₦`

Example:

`₦470,800`

Do not hardcode delivery charges into components.

Create a configurable delivery calculation service.

The architecture should later support logistics-provider integration.

---

## WhatsApp

Provide a floating WhatsApp support action.

Use:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

Keep the number configurable.

---

## UI/UX Rules

The website must be responsive at:

```text
320px
375px
425px
768px
1024px
1280px
1440px
1920px
```

Mobile is a first-class experience.

Always implement:

- loading state
- error state
- empty state
- disabled state where relevant
- success feedback

Avoid unnecessary animations.

Use accessible labels and keyboard navigation.

---

## SEO

Implement:

- page title
- meta description
- Open Graph metadata
- product metadata
- sitemap
- robots.txt
- SEO-friendly slugs

Product slug example:

```text
/shop/itel-energy-1-5kw-solar-inverter
```

---

## Error Handling

Never expose raw errors such as database errors, stack traces or API keys to customers.

Customer-facing errors should be understandable:

```text
Something went wrong. Please try again.
```

Log technical details server-side.

Do not silently catch errors.

---

## Testing

Add tests for critical business flows.

At minimum:

### Product

- listing
- search
- filtering
- detail page

### Cart

- add
- remove
- quantity changes
- persistence
- merge

### Authentication

- Google sign-in
- logout
- protected routes

### Checkout

- validation
- inventory validation
- server-side pricing
- order creation

### Security

- RLS
- cross-user access prevention
- price manipulation prevention

### Email

- confirmation trigger
- Mailgun failure handling

---

## Coding Rules

1. Prefer simple code over clever code.
2. Keep functions focused.
3. Use strong TypeScript types.
4. Avoid `any` unless genuinely necessary.
5. Validate external/user input.
6. Use reusable components.
7. Avoid duplicated business logic.
8. Keep API/database code out of presentation components.
9. Use server-side code for secrets and authoritative commerce operations.
10. Do not introduce dependencies without a clear reason.
11. Keep commits/changes logically scoped.
12. Update documentation when behavior/configuration changes.

---

## Product Data Rules

The supplied reference material confirms the advertised itel Energy 1.5KW inverter information:

```text
Rated Power: 1.5KW
DC Input: 12V
Output Voltage: 220–240V
Frequency: 50/60Hz
Max PV Input: 1000W
Output Waveform: Pure Sine Wave
Solar Charger: MPPT
Advertised Warranty: 3 Years
Advertised Price: ₦470,800
```

Use these only as development seed/reference data.

Do not infer or invent specifications not supplied by the product source.

---

## Definition of Done

Before considering the task complete, verify:

- [ ] App starts successfully.
- [ ] No broken imports.
- [ ] Homepage works.
- [ ] Shop works.
- [ ] Product search works.
- [ ] Product filters work.
- [ ] Product details work.
- [ ] Add-to-cart works.
- [ ] Cart updates correctly.
- [ ] Cart persists.
- [ ] Google authentication works when configured.
- [ ] Checkout validates input.
- [ ] Server calculates order totals.
- [ ] Inventory is checked.
- [ ] Orders are persisted.
- [ ] Order items contain price/name snapshots.
- [ ] Customer cannot access another customer's data.
- [ ] Mailgun integration is server-side.
- [ ] Confirmation email is triggered after successful order creation.
- [ ] Success page works.
- [ ] Account/order history works.
- [ ] Mobile UI works.
- [ ] Loading/error/empty states exist.
- [ ] SEO metadata exists.
- [ ] `.env.example` is complete.
- [ ] Secrets are not committed.
- [ ] Tests pass.
- [ ] README is updated.

---

## Agent Workflow

When implementing a task:

### Step 1 — Inspect

Before changing code:

- inspect the existing project structure
- inspect package.json
- inspect environment configuration
- inspect existing Supabase setup
- inspect existing components
- inspect existing database migrations
- inspect tests

Do not overwrite existing working functionality without understanding it.

### Step 2 — Plan

For non-trivial changes, identify:

- affected files
- database changes
- API/server changes
- UI changes
- security implications
- tests required

### Step 3 — Implement

Implement the smallest complete solution.

Prefer existing project patterns over introducing a new pattern.

### Step 4 — Validate

Run relevant:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Only run scripts that actually exist in the project; inspect `package.json` first.

### Step 5 — Review

Check:

- security
- responsive design
- accessibility
- error handling
- environment variables
- database/RLS implications
- unintended regressions

### Step 6 — Report

At the end of a task, report:

1. What changed.
2. Files changed.
3. Database changes.
4. Environment variables required.
5. Tests/checks run.
6. Any remaining manual configuration.

---

## Do Not

Do not:

- invent product specifications
- expose secrets
- commit `.env.local`
- trust frontend totals
- trust frontend prices
- bypass RLS
- fake payment success
- store plaintext passwords
- expose raw database errors
- hardcode business phone numbers
- hardcode product catalog data
- make unsupported claims about product availability
- introduce large dependencies for small features
- redesign unrelated parts of the application without a reason

---

## Final Principle

Build a store that feels like a real, trustworthy Nigerian renewable-energy retailer.

The priority order is:

```text
Correctness
   ↓
Security
   ↓
Reliable checkout
   ↓
Good UX
   ↓
Responsive design
   ↓
Performance
   ↓
Visual polish
```

Do not sacrifice security or data correctness for visual effects.
