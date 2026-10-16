import { AccessError } from "./auth-policy";
import { temples } from "./temples";

export function validateIntent(
  input: unknown,
  today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new AccessError(400, "Send a valid request.");
  const data = input as Record<string, unknown>;
  const temple = temples.find((t) => t.id === data.templeId);
  if (!temple) throw new AccessError(400, "Choose a valid temple.");
  if (data.kind === "booking") {
    const holderName =
      typeof data.holderName === "string"
        ? data.holderName.trim().replace(/\s+/g, " ").normalize("NFC")
        : "";
    if (
      holderName.length < 2 ||
      holderName.length > 100 ||
      !/^[\p{L}\p{M}][\p{L}\p{M} .'’\-]*$/u.test(holderName)
    )
      throw new AccessError(
        400,
        "Enter the name of the person visiting the temple.",
      );
    if (
      typeof data.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
      !Number.isFinite(Date.parse(data.date)) ||
      new Date(data.date).toISOString().slice(0, 10) !== data.date ||
      data.date < today ||
      typeof data.time !== "string" ||
      !["07:00", "09:00", "11:00", "15:00", "17:00"].includes(data.time) ||
      typeof data.people !== "number" ||
      !Number.isInteger(data.people) ||
      data.people < 1 ||
      data.people > 10
    )
      throw new AccessError(
        400,
        "Choose a valid visit date, time, and 1–10 devotees.",
      );
    return {
      kind: "booking" as const,
      templeId: temple.id,
      holderName,
      date: data.date,
      time: data.time,
      people: data.people,
      amount: temple.price * data.people,
    };
  }
  if (data.kind === "donation") {
    if (
      typeof data.amount !== "number" ||
      !Number.isSafeInteger(data.amount) ||
      data.amount < 1 ||
      data.amount > 1000000 ||
      typeof data.cause !== "string" ||
      !["Temple upkeep", "Community meals", "Local family essentials"].includes(
        data.cause,
      )
    )
      throw new AccessError(
        400,
        "Choose a valid donation amount and intention.",
      );
    return {
      kind: "donation" as const,
      templeId: temple.id,
      amount: data.amount,
      cause: data.cause,
    };
  }
  throw new AccessError(400, "Unknown request type.");
}

export async function readRequestBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new AccessError(400, "Send a valid request.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        throw new AccessError(413, "This request is too large.");
      }
      chunks.push(value);
    }
    const body = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    try {
      return JSON.parse(new TextDecoder().decode(body));
    } catch {
      throw new AccessError(400, "Send valid JSON.");
    }
  } finally {
    reader.releaseLock();
  }
}
