import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { database } from "@/lib/mongodb";
import { temples } from "@/lib/temples";
export async function POST(request: Request) {
  if (
    !process.env.CLERK_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  )
    return NextResponse.json(
      {
        error:
          "Secure sign-in is not configured yet. Connect Clerk to save your request.",
      },
      { status: 503 },
    );
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json(
      { error: "Please sign in before saving your request." },
      { status: 401 },
    );
  if (!process.env.MONGODB_URI)
    return NextResponse.json(
      {
        error:
          "Your request cannot be saved yet. Connect MongoDB to enable bookings and giving.",
      },
      { status: 503 },
    );
  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!data || typeof data !== "object")
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const temple = temples.find((t) => t.id === data.templeId);
  if (!temple)
    return NextResponse.json(
      { error: "Choose a valid temple." },
      { status: 400 },
    );
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  if (data.kind === "booking") {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
      !Number.isFinite(Date.parse(data.date)) ||
      new Date(data.date).toISOString().slice(0, 10) !== data.date ||
      data.date < today ||
      !["07:00", "09:00", "11:00", "15:00", "17:00"].includes(data.time) ||
      !Number.isInteger(data.people) ||
      data.people < 1 ||
      data.people > 10
    )
      return NextResponse.json(
        { error: "Choose a valid future date, time, and 1–10 devotees." },
        { status: 400 },
      );
  } else if (data.kind === "donation") {
    if (
      !Number.isInteger(data.amount) ||
      data.amount < 1 ||
      data.amount > 1000000 ||
      !["Temple upkeep", "Community meals", "Local family essentials"].includes(
        data.cause,
      )
    )
      return NextResponse.json(
        { error: "Choose a valid donation amount and intention." },
        { status: 400 },
      );
  } else
    return NextResponse.json(
      { error: "Unknown request type." },
      { status: 400 },
    );
  try {
    const db = await database();
    const record =
      data.kind === "booking"
        ? {
            date: data.date,
            time: data.time,
            people: data.people,
            amount: temple.price * data.people,
          }
        : { amount: data.amount, cause: data.cause };
    await db
      .collection(
        data.kind === "booking" ? "bookingRequests" : "donationIntentions",
      )
      .insertOne({
        ...record,
        userId,
        templeId: temple.id,
        status: "pending",
        createdAt: new Date(),
      });
    return NextResponse.json({
      message:
        data.kind === "booking"
          ? "Your visit request is saved. A confirmed ticket has not yet been issued."
          : "Your intention is saved for this temple only. No payment has been collected.",
    });
  } catch {
    return NextResponse.json(
      { error: "We couldn’t save your request. Please try again shortly." },
      { status: 503 },
    );
  }
}
