import "server-only";
import { ObjectId, type Document } from "mongodb";
import { requireUser } from "./auth";
import { AccessError } from "./auth-policy";
import { database } from "./mongodb";
import { temples } from "./temples";

export type TicketData = {
  holderName: string | null;
  id: string;
  templeId: string;
  temple: string;
  location: string;
  color: "blue" | "peach" | "lilac" | "mint";
  date: string;
  time: string;
  people: number;
  amount: number;
  status: "pending" | "confirmed" | "cancelled" | "checked-in";
  reference: string;
};
export type GivingData = {
  id: string;
  temple: string;
  cause: string;
  amount: number;
  status: string;
  date: string;
};

function ticketDto(record: Document): TicketData {
  const temple = temples.find((t) => t.id === record.templeId);
  const id = String(record._id);
  return {
    id,
    holderName:
      typeof record.holderName === "string" ? record.holderName : null,
    templeId: String(record.templeId),
    temple: temple?.name ?? "Temple visit",
    location: temple?.place ?? "India",
    color: temple?.color ?? "blue",
    date: String(record.date),
    time: String(record.time),
    people: Number(record.people),
    amount: Number(record.amount),
    status: ["confirmed", "cancelled", "checked-in"].includes(record.status)
      ? record.status
      : "pending",
    reference: `DV-${id.slice(-8).toUpperCase()}`,
  };
}

export async function loadDashboard() {
  const { userId } = await requireUser();
  const db = await database();
  const [bookings, giving] = await Promise.all([
    db
      .collection("bookingRequests")
      .find(
        { userId },
        {
          projection: {
            _id: 1,
            templeId: 1,
            holderName: 1,
            date: 1,
            time: 1,
            people: 1,
            amount: 1,
            status: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray(),
    db
      .collection("donationIntentions")
      .find(
        { userId },
        {
          projection: {
            _id: 1,
            templeId: 1,
            cause: 1,
            amount: 1,
            status: 1,
            createdAt: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray(),
  ]);
  return {
    tickets: bookings.map(ticketDto),
    giving: giving.map((record) => ({
      id: String(record._id),
      temple: temples.find((t) => t.id === record.templeId)?.name ?? "Temple",
      cause: String(record.cause),
      amount: Number(record.amount),
      status: String(record.status),
      date:
        record.createdAt instanceof Date ? record.createdAt.toISOString() : "",
    })) satisfies GivingData[],
  };
}

export async function getOwnedTicket(id: string) {
  const { userId } = await requireUser();
  if (!/^[a-f\d]{24}$/i.test(id))
    throw new AccessError(404, "This ticket could not be found.");
  const db = await database();
  const record = await db
    .collection("bookingRequests")
    .findOne(
      { _id: new ObjectId(id), userId },
      {
        projection: {
          _id: 1,
          templeId: 1,
          holderName: 1,
          date: 1,
          time: 1,
          people: 1,
          amount: 1,
          status: 1,
        },
      },
    );
  if (!record) throw new AccessError(404, "This ticket could not be found.");
  return ticketDto(record);
}
