import { randomBytes, timingSafeEqual } from "node:crypto";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const clientId = process.env.TESLA_CLIENT_ID;
  const redirectUri = process.env.TESLA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({
      error: "Tesla OAuth environment variables are missing"
    });
  }

  const state = randomBytes(32).toString("hex");

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Set-Cookie",
    `oxisols_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=600`
  );

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: [
      "openid",
      "offline_access",
      "vehicle_device_data",
      "vehicle_cmds",
      "vehicle_location",
      "vehicle_charging_cmds"
    ].join(" "),
    state
  });

  const authorizationUrl =
    `https://auth.tesla.com/oauth2/v3/authorize?${params}`;

  return res.redirect(302, authorizationUrl);
}
