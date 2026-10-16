import { requireMutationUser, privateJson, accessFailure } from "@/lib/auth";
import { database } from "@/lib/mongodb";
import { readRequestBody, validateIntent } from "@/lib/intent-validation";

export async function POST(request: Request) {
  try {
    const { userId } = await requireMutationUser(request);
    const { kind, ...record } = validateIntent(await readRequestBody(request));
    const db = await database();
    const result = await db
      .collection(kind === "booking" ? "bookingRequests" : "donationIntentions")
      .insertOne({
        ...record,
        userId,
        status: "pending",
        createdAt: new Date(),
      });
    return privateJson(
      {
        id: String(result.insertedId),
        message:
          kind === "booking"
            ? "Your visit request is saved. A confirmed ticket has not yet been issued."
            : "Your intention is saved for this temple only. No payment has been collected.",
      },
      201,
    );
  } catch (error) {
    return accessFailure(error);
  }
}
