import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Download,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { AccessError } from "@/lib/auth-policy";
import { getOwnedTicket } from "@/lib/tickets";
import { SacredWorld } from "@/components/sacred-world";
import { TicketHolderName } from "@/components/ticket-holder-name";
import { PrivateContent } from "@/components/auth/private-content";

export const dynamic = "force-dynamic";
export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await requirePageUser(`/account/tickets/${id}`);
  let ticket;
  try {
    ticket = await getOwnedTicket(id);
  } catch (error) {
    if (error instanceof AccessError && error.status === 404) notFound();
    throw error;
  }
  const confirmed = ticket.status === "confirmed";
  return (
    <PrivateContent ownerId={userId}>
      <main className="ticket-detail-page section-wrap">
        <Link href="/account/bookings" className="text-link">
          <ArrowLeft size={15} />
          Back to your journeys
        </Link>
        <div className="ticket-detail-heading">
          <span className="section-caption">A MOMENT THAT MATTERS</span>
          <h1>
            {confirmed
              ? "Your visit, made simple."
              : "Your journey is taking shape."}
          </h1>
          <p>
            {confirmed
              ? "Keep your visit details close."
              : "Your request is saved. Wait for the temple to confirm your visit."}
          </p>
        </div>
        <article className={`large-ticket ${ticket.color}`}>
          <div className="large-ticket-main">
            <div className="large-ticket-art">
              <SacredWorld compact variant={ticket.color} />
            </div>
            <span className={`ticket-status status-${ticket.status}`}>
              {confirmed
                ? "Confirmed visit"
                : ticket.status === "pending"
                  ? "Awaiting confirmation"
                  : ticket.status}
            </span>
            <h2>{ticket.temple}</h2>
            <TicketHolderName name={ticket.holderName} detail />
            <p className="ticket-place">
              <MapPin size={14} />
              {ticket.location}
            </p>
            <dl className="ticket-facts">
              <div>
                <dt>
                  <CalendarDays size={15} />
                  Date
                </dt>
                <dd>{ticket.date}</dd>
              </div>
              <div>
                <dt>
                  <Clock3 size={15} />
                  Time
                </dt>
                <dd>{ticket.time}</dd>
              </div>
              <div>
                <dt>
                  <Users size={15} />
                  Devotees
                </dt>
                <dd>{ticket.people}</dd>
              </div>
              <div>
                <dt>Darshan total</dt>
                <dd>
                  {ticket.amount
                    ? `₹${ticket.amount.toLocaleString("en-IN")}`
                    : "Free"}
                </dd>
              </div>
            </dl>
          </div>
          <div className="ticket-qr-stub">
            <span className="qr-label">YOUR PRIVATE REFERENCE</span>
            <img
              src={`/api/tickets/${ticket.id}/qr`}
              width="230"
              height="230"
              alt={`Private QR reference for ${ticket.temple}`}
            />
            <strong>{ticket.reference}</strong>
            <p>
              Scan to view this visit.
              <br />
              Sign in with your account to open.
            </p>
            <a
              href={`/api/tickets/${ticket.id}/qr?download=1`}
              className="button soft"
            >
              <Download size={15} />
              Save QR code
            </a>
          </div>
        </article>
        <p className="ticket-honesty">
          <ShieldCheck size={17} />
          {confirmed
            ? "Your QR opens your private visit record. Follow the temple’s entry instructions."
            : "This QR is a request reference, not an entry pass. A pending request does not guarantee admission."}
        </p>
      </main>
    </PrivateContent>
  );
}
