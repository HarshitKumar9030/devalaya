import { expect, it } from "vitest";
import sharp from "sharp";
import jsQR from "jsqr";
import { ticketQrSvg } from "@/lib/ticket-qr";

it.each([
  "http://localhost:3000/account/tickets/1234567890abcdef12345678",
  "https://devalaya.example/account/tickets/1234567890abcdef12345678",
])("the custom rounded lotus QR is actually scannable: %s", async (payload) => {
  const { data, info } = await sharp(Buffer.from(ticketQrSvg(payload)))
    .resize(660, 660)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  expect(jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data).toBe(
    payload,
  );
});
