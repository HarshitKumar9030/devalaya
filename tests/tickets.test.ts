import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId } from "mongodb";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  database: vi.fn(),
  findOne: vi.fn(),
  find: vi.fn(),
  collection: vi.fn(),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("@/lib/mongodb", () => ({ database: mocks.database }));
import { getOwnedTicket, loadDashboard } from "@/lib/tickets";
import { GET } from "@/app/api/tickets/[id]/qr/route";
const id = "1234567890abcdef12345678";
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "configured");
  vi.stubEnv("CLERK_SECRET_KEY", "configured");
  vi.stubEnv("APP_URL", "");
  mocks.auth.mockResolvedValue({ userId: "owner-a", sessionId: "session-a" });
  mocks.findOne.mockResolvedValue(null);
  const cursor = {
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockResolvedValue([]),
  };
  mocks.find.mockReturnValue(cursor);
  mocks.collection.mockReturnValue({
    findOne: mocks.findOne,
    find: mocks.find,
  });
  mocks.database.mockResolvedValue({ collection: mocks.collection });
});
describe("ticket ownership", () => {
  it("includes the authenticated owner in every ticket lookup", async () => {
    await expect(getOwnedTicket(id)).rejects.toMatchObject({ status: 404 });
    expect(mocks.findOne).toHaveBeenCalledWith(
      { _id: new ObjectId(id), userId: "owner-a" },
      expect.anything(),
    );
  });
  it("never queries MongoDB for unauthenticated readers", async () => {
    mocks.auth.mockResolvedValue({ userId: null, sessionId: null });
    await expect(getOwnedTicket(id)).rejects.toMatchObject({ status: 401 });
    expect(mocks.database).not.toHaveBeenCalled();
  });
  it("rejects invalid identifiers instead of allowing query operators", async () => {
    await expect(getOwnedTicket("$ne")).rejects.toMatchObject({ status: 404 });
    expect(mocks.database).not.toHaveBeenCalled();
  });
  it("scopes both dashboard collections to the current user", async () => {
    await loadDashboard();
    expect(mocks.find).toHaveBeenCalledTimes(2);
    for (const call of mocks.find.mock.calls)
      expect(call[0]).toEqual({ userId: "owner-a" });
  });
  it("does not generate a QR for a record belonging to someone else", async () => {
    const response = await GET(
      new Request(`http://localhost:3000/api/tickets/${id}/qr`),
      { params: Promise.resolve({ id }) },
    );
    expect(response.status).toBe(404);
  });
  it("generates owner-only QR images with the public host and no-store headers", async () => {
    mocks.findOne.mockResolvedValue({
      _id: new ObjectId(id),
      templeId: "kashi",
      date: "2099-01-01",
      time: "07:00",
      people: 1,
      amount: 300,
      status: "pending",
    });
    const response = await GET(
      new Request(`http://0.0.0.0:3000/api/tickets/${id}/qr`, {
        headers: { host: "localhost:3000" },
      }),
      { params: Promise.resolve({ id }) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.text()).toContain("Devalaya secure ticket reference");
  });
});
