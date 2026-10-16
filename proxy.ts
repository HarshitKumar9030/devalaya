import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import { isPublicPath, requestOrigin } from "./lib/auth-policy";
import { isAuthConfigured } from "./lib/auth-config";

const authenticate = clerkMiddleware(
  async (auth, request) => {
    if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next();
    const { userId, sessionId } = await auth({
      acceptsToken: "session_token",
      treatPendingAsSignedOut: true,
    });
    if (!userId || !sessionId) {
      if (request.nextUrl.pathname.startsWith("/api/"))
        return NextResponse.json(
          { error: "Please sign in to continue." },
          { status: 401, headers: { "Cache-Control": "private, no-store" } },
        );
      const url = new URL(
        "/sign-in",
        requestOrigin(request, process.env.APP_URL),
      );
      url.searchParams.set(
        "redirect_url",
        request.nextUrl.pathname + request.nextUrl.search,
      );
      return NextResponse.redirect(url);
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  },
  (request) => ({
    authorizedParties: [requestOrigin(request, process.env.APP_URL)],
  }),
);

// Next.js 16 renamed middleware.ts to proxy.ts. Never silently bypass protected routes.
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!isAuthConfigured()) {
    if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next();
    return NextResponse.json(
      { error: "Secure sign-in is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  return authenticate(request, event);
}
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};
