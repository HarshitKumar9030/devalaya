# Devalaya

A centered, responsive temple discovery experience with animated inline SVG islands, darshan requests, and independent temple donation intentions. Built with Next.js App Router, React, TypeScript, Clerk and MongoDB. No CSS borders or shadows.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. The landing page, filters and request forms work without external credentials. Sample temples and prices are explicitly illustrative.

## Connect services

Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from your Clerk application, plus `MONGODB_URI` and optionally `MONGODB_DB`. Restart the dev server. The root provider and Next.js proxy enable Clerk automatically. No fake authentication is used.

`POST /api/intent` requires a Clerk session and validates all inputs server-side. It stores pending visit requests or donation intentions in MongoDB, always associated with exactly one `templeId`. Donation intentions include an explicit cause for temple upkeep, community meals or local family essentials. Donation records are not pooled. Requests contain the authenticated user's Clerk ID; no client-supplied ownership is trusted.

This is a product foundation, not a live ticket or payment service. Booking requests are not confirmed tickets. Donation intentions do not move money. Before launching, integrate verified temple inventory, an appropriate payment processor with independently configured temple recipients, verified webhooks, and a temple-admin interface that restricts access by temple membership. Configure production Clerk keys and MongoDB access controls.

## Verification

```sh
npm run typecheck
npm run build
```
