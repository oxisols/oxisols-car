import { timingSafeEqual } from "node:crypto";
import { exchangeCode, saveTokens } from "../../lib/tesla.js";

function getCookie(req, name) {
  const cookie = req.headers.cookie ?? "";

  for (const part of cookie.split(";")) {
    const item = part.trim();
    const index = item.indexOf("=");

    if (index < 0) continue;

    if (item.slice(0, index) === name) {
      return decodeURIComponent(item.slice(index + 1));
    }
  }

  return "";
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return (
    left.length === right.length &&
    timingSafeEqual(left, right)
  );
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { code, state, error } = req.query ?? {};

  res.setHeader(
    "Set-Cookie",
    "oxisols_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=0"
  );

  if (error) {
    return res.status(400).json({
      error: "Tesla authorization was not completed"
    });
  }

  const expectedState = getCookie(req, "oxisols_oauth_state");

  if (
    typeof state !== "string" ||
    typeof code !== "string" ||
    !expectedState ||
    !safeEqual(state, expectedState)
  ) {
    return res.status(400).json({
      error: "Invalid OAuth state or authorization code"
    });
  }

  try {
    const tokens = await exchangeCode(code);
    await saveTokens(tokens);

    return res.redirect(303, "/?auth=success");
  } catch (err) {
    console.error("Tesla OAuth callback failed");

    return res.status(502).json({
      error: "Tesla token exchange failed. Check server configuration."
    });
  }
}
