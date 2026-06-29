# Shagufta Manauwar — Listening & Reflection Sessions

A calm, trustworthy one-page website for Shagufta, a psychology student
offering **free, private listening and reflection sessions** — a safe,
respectful, and non-judgmental space to talk.

> These sessions are not therapy, counseling, diagnosis, or medical advice.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with a custom, warm editorial design system
  (adapted from `DESIGN.md`)
- **Convex** for storing private contact-form messages
- **Google Calendar Appointment Scheduling** for bookings
- Deployed on **Vercel**

## Design

The visual language lives in [`DESIGN.md`](./DESIGN.md): white/cream canvas,
dark-ink type, generous whitespace, signature forest & cream surfaces, a
near-black primary CTA, and a teal accent that matches the booking button.
Fonts: **Inter** (UI) + **Fraunces** (serif, for the personal note).

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

To enable the contact form database, run Convex in a second terminal and copy
the deployment URL into `.env.local`:

```bash
npx convex dev
echo 'NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud' > .env.local
```

See [`.env.example`](./.env.example) for the variables.

## How the pieces fit

| Concern | Where |
|---|---|
| Landing page | `src/app/page.tsx` |
| Design tokens | `src/app/globals.css` |
| Google Calendar booking button | `src/components/BookingButton.tsx` |
| Contact form (UI) | `src/components/ContactForm.tsx` |
| Contact API (writes to Convex) | `src/app/api/contact/route.ts` |
| Convex schema & mutation | `convex/schema.ts`, `convex/messages.ts` |

## Replacing the image placeholders

The page ships with labelled placeholders (`ImagePlaceholder`). To use real
photos, drop files in `/public` and swap the placeholder for `next/image`:

```tsx
import Image from "next/image";
<Image src="/portrait.jpg" alt="Shagufta" fill className="object-cover" />
```

Recommended shots: a warm portrait (~4:5), a calming scene (~4:3), and a few
cozy detail photos (~1:1) to build trust.

## Deployment

Pushed to GitHub and deployed on Vercel. Set `NEXT_PUBLIC_CONVEX_URL` in the
Vercel project's environment variables to connect the contact form database.
