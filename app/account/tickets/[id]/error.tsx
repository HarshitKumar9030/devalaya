"use client";
import Link from "next/link";
export default function TicketError({ reset }: { reset: () => void }) {
  return (
    <main className="account-empty">
      <h1>We couldn’t load this visit.</h1>
      <p>Please try again shortly.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <Link className="text-link" href="/account/bookings">
        Back to your dashboard
      </Link>
    </main>
  );
}
