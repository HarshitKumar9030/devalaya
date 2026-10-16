import { describe, expect, it } from "vitest";
import {
  assertSameOrigin,
  isPublicPath,
  requestOrigin,
  safeReturnPath,
} from "@/lib/auth-policy";

describe("public route allowlist", () => {
  it.each([
    "/",
    "/sign-in",
    "/sign-in/factor-one",
    "/sign-up/verify-email-address",
  ])("allows %s", (path) => expect(isPublicPath(path)).toBe(true));
  it.each([
    "/account",
    "/account/bookings",
    "/account/tickets/abc",
    "/api/intent",
    "/api/bookings",
    "/api/tickets/abc/qr",
    "/new-private-page",
    "/sign-in-admin",
  ])("protects %s by default", (path) =>
    expect(isPublicPath(path)).toBe(false),
  );
});
describe("redirects", () => {
  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\nevil.example",
    null,
    ["/account"],
  ])("rejects unsafe return URL %s", (value) =>
    expect(safeReturnPath(value)).toBe("/"),
  );
  it("keeps internal destinations", () =>
    expect(safeReturnPath("/account/bookings?tab=past")).toBe(
      "/account/bookings?tab=past",
    ));
});
describe("public origin resolution and CSRF", () => {
  it("handles a dev server binding to 0.0.0.0 while the browser uses localhost", () => {
    const request = new Request("http://0.0.0.0:3000/api/intent", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
    });
    expect(requestOrigin(request)).toBe("http://localhost:3000");
    expect(() => assertSameOrigin(request)).not.toThrow();
  });
  it("uses the configured deployment origin", () =>
    expect(
      requestOrigin(
        new Request("http://internal:3000"),
        "https://devalaya.example",
      ),
    ).toBe("https://devalaya.example"));
  it.each([
    {},
    { origin: "https://evil.example" },
    { origin: "http://localhost:3000", "sec-fetch-site": "cross-site" },
  ])("rejects missing or cross-site origins", (headers) =>
    expect(() =>
      assertSameOrigin(
        new Request("http://localhost:3000/api/intent", {
          method: "POST",
          headers: new Headers(
            Object.entries({
              ...headers,
              "content-type": "application/json",
            }).filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === "string",
            ),
          ),
        }),
      ),
    ).toThrow(),
  );
  it("rejects non-JSON writes", () =>
    expect(() =>
      assertSameOrigin(
        new Request("http://localhost:3000/api/intent", {
          method: "POST",
          headers: {
            origin: "http://localhost:3000",
            "content-type": "text/plain",
          },
        }),
      ),
    ).toThrow());
});
