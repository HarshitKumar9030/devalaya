export class AccessError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AccessError";
  }
}

// Public content is explicit. New pages and every API route are protected by default.
export function isPublicPath(path: string) {
  return (
    path === "/" ||
    /^\/sign-(?:in|up)(?:\/|$)/.test(path) ||
    ["/favicon.ico", "/robots.txt", "/sitemap.xml"].includes(path)
  );
}

export function safeReturnPath(value: unknown, fallback = "/") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020\u007f]/.test(value)
  )
    return fallback;
  try {
    const url = new URL(value, "https://devalaya.invalid");
    return url.origin === "https://devalaya.invalid"
      ? url.pathname + url.search + url.hash
      : fallback;
  } catch {
    return fallback;
  }
}

export function requestOrigin(request: Request, appUrl?: string) {
  if (appUrl) {
    const configured = new URL(appUrl);
    if (
      !["http:", "https:"].includes(configured.protocol) ||
      configured.username ||
      configured.password
    )
      throw new AccessError(
        503,
        "The application origin is not configured correctly.",
      );
    return configured.origin;
  }
  const incoming = new URL(request.url);
  const host = request.headers.get("host");
  // Next dev binds to 0.0.0.0, so request.url may differ from the actual Host.
  // Use the HTTP Host, never a client-supplied Origin, to resolve the public origin.
  if (!host) return incoming.origin;
  if (/[\s\/\\@?#]/.test(host))
    throw new AccessError(400, "Invalid request host.");
  return new URL(`${incoming.protocol}//${host}`).origin;
}

export function assertSameOrigin(request: Request, appUrl?: string) {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (
    site === "cross-site" ||
    !origin ||
    origin !== requestOrigin(request, appUrl)
  )
    throw new AccessError(403, "This request must come from Devalaya.");
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    throw new AccessError(415, "Send a JSON request.");
}
