# Devalaya

A centered, responsive temple discovery experience with animated inline SVG islands, darshan requests, and independent temple donation intentions. Built with Next.js App Router, React, TypeScript, Clerk and MongoDB. No CSS borders or shadows.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. Temple discovery and filters are public. Booking, donation intentions, the ticket dashboard, and QR references require Clerk sign-in. Sample temples and prices are explicitly illustrative.

## Connect services

Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from your Clerk application. Local MongoDB uses `mongodb://127.0.0.1:27017/devalaya` by default; ensure the MongoDB service is running. `MONGODB_DB` defaults to `devalaya`. Restart the dev server. Set `APP_URL` to the exact public origin in production. Local requests resolve the browser-facing Host so a server binding of `0.0.0.0` does not invalidate sessions issued for `localhost`.

`proxy.ts` is the Next.js 16 middleware convention. It protects all routes by default, with a small public allowlist for discovery and sign-in/up. Unauthenticated APIs return JSON 401; private pages redirect to sign-in. Missing Clerk configuration fails closed with 503 on protected routes. Every resource also rechecks the session, so access does not rely on middleware or UI alone. Incomplete sessions and non-session tokens are rejected. Private responses are not cached.

`POST /api/intent` validates same-origin JSON requests, caps bodies at 8 KB, and validates every field server-side. Booking requires a `holderName`, date, time, and devotee count. The server supplies the owner, pending status, and catalogue price. Donations belong to exactly one temple and cause; they are never pooled. Client-supplied owners, prices, and confirmation states are ignored.

`/account/bookings` shows upcoming and past visit requests, filters, and giving intentions. `/account/tickets/[id]` shows ticket details and the visiting person's name. `GET /api/bookings` returns only the signed-in user's records. Every ticket lookup filters by both MongoDB ID and authenticated owner. Other people's IDs return 404. Signing out or switching accounts immediately hides stale private content.

`GET /api/tickets/[id]/qr` generates an owner-protected, rounded SVG QR with a lotus mark. Add `?download=1` to download it. The QR encodes a first-party link to the protected visit record, not personal information or an access credential. Pending request codes are explicitly reference codes, not entry passes. Existing records without an attendee name show the signed-in booking owner's name as “Booked by”. New requests display “Ticket on name”.

This is a product foundation, not a live ticket or payment service. Booking requests are not confirmed tickets. Donation intentions do not move money. Before launching, integrate verified temple inventory, an appropriate payment processor with independently configured temple recipients, verified webhooks, and a temple-admin interface that restricts access by temple membership. Configure production Clerk keys and MongoDB access controls.

## Verification

```sh
npm run typecheck
npm run build
npm test
```

Tests cover route protection, missing configuration, account switching, cross-origin rejection, forged owners/prices/status, input validation, ticket ownership, custom-control keyboard interaction, and decoding the rendered branded QR image.
