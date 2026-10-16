import { requirePageUser } from "@/lib/auth";
import { loadDashboard } from "@/lib/tickets";
import { TicketDashboard } from "@/components/ticket-dashboard";

export const dynamic = "force-dynamic";
export default async function BookingsPage() {
  const { userId } = await requirePageUser("/account/bookings");
  let data: Awaited<ReturnType<typeof loadDashboard>> = {
    tickets: [],
    giving: [],
  };
  let unavailable = false;
  try {
    data = await loadDashboard();
  } catch {
    unavailable = true;
  }
  return (
    <TicketDashboard
      ownerId={userId}
      tickets={data.tickets}
      giving={data.giving}
      unavailable={unavailable}
    />
  );
}
