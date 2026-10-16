import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAuthConfigured } from "./auth-config";
import { safeReturnPath } from "./auth-policy";

export async function authPageReturnTo(
  params: Promise<Record<string, string | string[] | undefined>>,
) {
  const query = await params;
  const raw = safeReturnPath(query.redirect_url, "/account/bookings");
  const returnTo = /^\/sign-(?:in|up)(?:\/|\?|$)/.test(raw)
    ? "/account/bookings"
    : raw;
  if (isAuthConfigured()) {
    const { userId, sessionId } = await auth({
      acceptsToken: "session_token",
      treatPendingAsSignedOut: true,
    });
    if (userId && sessionId) redirect(returnTo);
  }
  return returnTo;
}
