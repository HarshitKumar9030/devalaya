import QRCode from "qrcode";

// QR payloads contain only a first-party URL. Scanning never bypasses owner authentication.
export function ticketQrSvg(payload: string) {
  const qr = QRCode.create(payload, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const dimension = size + 8;
  const eyes = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ];
  let modules = "";
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      if (
        !qr.modules.get(y, x) ||
        eyes.some(([ex, ey]) => x >= ex && x < ex + 7 && y >= ey && y < ey + 7)
      )
        continue;
      modules += `<rect x="${x + 4}" y="${y + 4}" width="1" height="1" rx=".13"/>`;
    }
  const finders = eyes
    .map(
      ([x, y]) =>
        `<rect x="${x + 4}" y="${y + 4}" width="7" height="7" rx="1.1" fill="#20334e"/><rect x="${x + 5}" y="${y + 5}" width="5" height="5" rx=".65" fill="white"/><rect x="${x + 6}" y="${y + 6}" width="3" height="3" rx=".5" fill="#20334e"/>`,
    )
    .join("");
  const center = dimension / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="330" height="330" viewBox="0 0 ${dimension} ${dimension}" role="img" aria-label="Devalaya secure ticket reference"><rect width="${dimension}" height="${dimension}" rx="3" fill="white"/><g fill="#20334e">${modules}</g>${finders}<rect x="${center - 3}" y="${center - 3}" width="6" height="6" rx="1.5" fill="white"/><g transform="translate(${center} ${center})"><path d="M0 1.8C-3 1.5-3-1-2.5-1.2C-.9-1.1-.4.5 0 1.8ZM0 1.8C3 1.5 3-1 2.5-1.2C.9-1.1.4.5 0 1.8Z" fill="#91b9ed"/><path d="M0 1.8C-2.1-.1-1-1.8 0-2.7C1-1.8 2.1-.1 0 1.8Z" fill="#4589df"/></g></svg>`;
}
