import { timingSafeEqual } from "node:crypto";
import { getValidTokens } from "../lib/tesla.js";

function authorized(req) {
  const expected = process.env.TASKER_API_SECRET;
  const provided = req.headers["x-api-key"];

  if (
    typeof expected !== "string" ||
    typeof provided !== "string"
  ) {
    return false;
  }

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);

  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  if (!authorized(req)) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  try {
    const tokens = await getValidTokens();

    return res.status(200).json({
      access_token: tokens.access_token,
      token_type: tokens.token_type,
      expires_at: tokens.expires_at
    });
  } catch {
    return res.status(503).json({
      error: "Token unavailable. Complete Tesla authorization or check configuration."
    });
  }
}
