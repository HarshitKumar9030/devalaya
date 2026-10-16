import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, type NextFetchEvent } from "next/server";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), middleware: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: (
    handler: (
      auth: typeof mocks.auth,
      request: NextRequest,
    ) => Promise<Response>,
    options: (request: NextRequest) => unknown,
  ) => {
    mocks.middleware.mockImplementation(async (request: NextRequest) => {
      options(request);
      return handler(mocks.auth, request);
    });
    return mocks.middleware;
  },
}));
import proxy from "@/proxy";

function request(path: string) {
  return new NextRequest(`http://0.0.0.0:3000${path}`, {
    headers: { host: "localhost:3000" },
  });
}
function run(path: string) {
  return Promise.resolve(proxy(request(path), {} as NextFetchEvent));
}
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "configured");
  vi.stubEnv("CLERK_SECRET_KEY", "configured");
  vi.stubEnv("APP_URL", "");
  mocks.auth.mockResolvedValue({ userId: null, sessionId: null });
});
describe("middleware enforcement", () => {
  it("keeps the landing page public", async () => {
    expect((await run("/"))?.status).toBe(200);
    expect(mocks.auth).not.toHaveBeenCalled();
  });
  it.each(["/api/intent", "/api/bookings", "/api/tickets/123/qr"])(
    "returns JSON 401 for %s",
    async (path) => {
      const response = await run(path);
      expect(response?.status).toBe(401);
      expect(response?.headers.get("content-type")).toContain(
        "application/json",
      );
    },
  );
  it("redirects private pages to the public host, preserving their internal destination", async () => {
    const response = await run("/account/bookings?tab=past");
    const target = new URL(response!.headers.get("location")!);
    expect(target.origin).toBe("http://localhost:3000");
    expect(target.pathname).toBe("/sign-in");
    expect(target.searchParams.get("redirect_url")).toBe(
      "/account/bookings?tab=past",
    );
  });
  it("allows a verified session and marks private responses uncacheable", async () => {
    mocks.auth.mockResolvedValue({ userId: "owner", sessionId: "session" });
    const response = await run("/account/bookings");
    expect(response?.status).toBe(200);
    expect(response?.headers.get("cache-control")).toBe("private, no-store");
  });
  it.each(["/account/bookings", "/api/intent"])(
    "fails closed without keys on %s",
    async (path) => {
      vi.stubEnv("CLERK_SECRET_KEY", "");
      expect((await run(path))?.status).toBe(503);
      expect(mocks.middleware).not.toHaveBeenCalled();
    },
  );
});
