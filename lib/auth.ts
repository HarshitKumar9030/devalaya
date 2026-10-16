import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { isAuthConfigured } from "./auth-config";
import { AccessError, assertSameOrigin, safeReturnPath } from "./auth-policy";

export async function requireUser() {
  if (!isAuthConfigured())
    throw new AccessError(
      503,
      "Secure sign-in is temporarily unavailable. Please try again later.",
    );
  const session = await auth({
    acceptsToken: "session_token",
    treatPendingAsSignedOut: true,
  });
  if (!session.userId || !session.sessionId)
    throw new AccessError(401, "Please sign in to continue.");
  return { userId: session.userId, sessionId: session.sessionId };
}

export async function requirePageUser(returnTo: string) {
  try {
    return await requireUser();
  } catch (error) {
    if (error instanceof AccessError && error.status === 401)
      redirect(
        `/sign-in?redirect_url=${encodeURIComponent(safeReturnPath(returnTo))}`,
      );
    throw error;
  }
}

export async function requireMutationUser(request: Request) {
  const user = await requireUser();
  assertSameOrigin(request, process.env.APP_URL);
  return user;
}

export function privateJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      Vary: "Cookie, Authorization",
    },
  });
}

export function accessFailure(error: unknown) {
  return error instanceof AccessError
    ? privateJson({ error: error.message }, error.status)
    : privateJson(
        {
          error: "We couldn’t complete this request. Please try again shortly.",
        },
        503,
      );
}
