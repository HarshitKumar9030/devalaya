import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  insertOne: vi.fn(),
  database: vi.fn(),
  collection: vi.fn(),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("@/lib/mongodb", () => ({ database: mocks.database }));
import { POST } from "@/app/api/intent/route";
import { requireUser } from "@/lib/auth";
import { validateIntent, readRequestBody } from "@/lib/intent-validation";

function request(data: unknown, origin = "http://localhost:3000") {
  return new Request("http://0.0.0.0:3000/api/intent", {
    method: "POST",
    headers: {
      host: "localhost:3000",
      origin,
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "test-configured");
  vi.stubEnv("CLERK_SECRET_KEY", "test-configured");
  vi.stubEnv("APP_URL", "");
  mocks.auth.mockResolvedValue({ userId: "owner-a", sessionId: "session-a" });
  mocks.insertOne.mockResolvedValue({ insertedId: "123" });
  mocks.collection.mockReturnValue({ insertOne: mocks.insertOne });
  mocks.database.mockResolvedValue({ collection: mocks.collection });
});
describe("resource authentication and writes", () => {
  it("rechecks sessions inside the route, independent of middleware", async () => {
    mocks.auth.mockResolvedValue({ userId: null, sessionId: null });
    const response = await POST(request({}));
    expect(response.status).toBe(401);
    expect(mocks.database).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("rejects a missing session identifier", async () => {
    mocks.auth.mockResolvedValue({ userId: "owner-a", sessionId: null });
    await expect(requireUser()).rejects.toMatchObject({ status: 401 });
  });
  it("fails closed when Clerk is not configured", async () => {
    vi.stubEnv("CLERK_SECRET_KEY", "");
    expect((await POST(request({}))).status).toBe(503);
    expect(mocks.auth).not.toHaveBeenCalled();
    expect(mocks.database).not.toHaveBeenCalled();
  });
  it("accepts only fully active browser sessions", async () => {
    await requireUser();
    expect(mocks.auth).toHaveBeenCalledWith({
      acceptsToken: "session_token",
      treatPendingAsSignedOut: true,
    });
  });
  it("rejects cross-site submissions before reaching MongoDB", async () => {
    expect((await POST(request({}, "https://evil.example"))).status).toBe(403);
    expect(mocks.database).not.toHaveBeenCalled();
  });
  it("uses the verified user and catalogue price, ignoring forged ownership and confirmation", async () => {
    const response = await POST(
      request({
        kind: "booking",
        holderName: "Harshit Kumar",
        templeId: "tirupati",
        date: "2099-11-01",
        time: "09:00",
        people: 2,
        userId: "victim",
        amount: 1,
        status: "confirmed",
      }),
    );
    expect(response.status).toBe(201);
    expect(mocks.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner-a",
        holderName: "Harshit Kumar",
        amount: 600,
        status: "pending",
        templeId: "tirupati",
      }),
    );
  });
  it("keeps each donation intention scoped to a single known temple", async () => {
    expect(
      (
        await POST(
          request({
            kind: "donation",
            templeId: "kashi",
            cause: "Community meals",
            amount: 501,
          }),
        )
      ).status,
    ).toBe(201);
    expect(mocks.collection).toHaveBeenCalledWith("donationIntentions");
    expect(mocks.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner-a",
        templeId: "kashi",
        cause: "Community meals",
      }),
    );
  });
  it.each([
    null,
    [],
    {
      kind: "booking",
      holderName: "Harshit Kumar",
      templeId: "kashi",
      date: "2099-02-30",
      time: "07:00",
      people: 1,
    },
    { kind: "donation", templeId: "kashi", amount: -1, cause: "Temple upkeep" },
    {
      kind: "donation",
      templeId: { $ne: null },
      amount: 1,
      cause: "Temple upkeep",
    },
  ])("rejects malformed payloads without DB access", async (input) => {
    expect((await POST(request(input))).status).toBe(400);
    expect(mocks.database).not.toHaveBeenCalled();
  });
  it("limits request body size", async () => {
    await expect(
      readRequestBody(request({ value: "x".repeat(9000) })),
    ).rejects.toMatchObject({ status: 413 });
  });
  it("rejects expired visit dates", () =>
    expect(() =>
      validateIntent({
        kind: "booking",
        holderName: "Harshit Kumar",
        templeId: "kashi",
        date: "2000-01-01",
        time: "07:00",
        people: 1,
      }),
    ).toThrow());
});

it("preserves Indian-script attendee names and normalizes spacing", () => {
  expect(
    validateIntent({
      kind: "booking",
      holderName: "  हर्षित   कुमार  ",
      templeId: "kashi",
      date: "2099-01-01",
      time: "07:00",
      people: 1,
    }),
  ).toMatchObject({ holderName: "हर्षित कुमार" });
});
it.each(["", "<script>alert(1)</script>", "x".repeat(101)])(
  "rejects invalid attendee names: %s",
  (holderName) => {
    expect(() =>
      validateIntent({
        kind: "booking",
        holderName,
        templeId: "kashi",
        date: "2099-01-01",
        time: "07:00",
        people: 1,
      }),
    ).toThrow();
  },
);
