import { getOwnedTicket } from "@/lib/tickets";
import { accessFailure } from "@/lib/auth";
import { ticketQrSvg } from "@/lib/ticket-qr";
import { requestOrigin } from "@/lib/auth-policy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ticket = await getOwnedTicket(id);
    const url = new URL(
      `/account/tickets/${ticket.id}`,
      requestOrigin(request, process.env.APP_URL),
    );
    return new Response(ticketQrSvg(url.href), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "private, no-store",
        Vary: "Cookie, Authorization",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Content-Disposition": `${new URL(request.url).searchParams.get("download") === "1" ? "attachment" : "inline"}; filename="devalaya-${ticket.reference}.svg"`,
      },
    });
  } catch (error) {
    return accessFailure(error);
  }
}
