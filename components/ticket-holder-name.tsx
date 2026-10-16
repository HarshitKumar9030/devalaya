"use client";
import { useUser } from "@clerk/nextjs";

export function TicketHolderName({
  name,
  detail = false,
}: {
  name: string | null;
  detail?: boolean;
}) {
  const { user } = useUser();
  // Older requests stored only the account owner, so do not invent an attendee name.
  return (
    <div className={detail ? "ticket-holder-detail" : "ticket-holder-line"}>
      <span>{name ? "Ticket on name" : "Booked by"}</span>
      <strong>{name || user?.fullName || "Your account"}</strong>
    </div>
  );
}
