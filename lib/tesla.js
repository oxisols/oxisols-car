import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const TOKEN_KEY = "oxisols:tesla:tokens";

const TOKEN_URL =
  "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token";

export async function exchangeCode(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.TESLA_CLIENT_ID,
    client_secret: process.env.TESLA_CLIENT_SECRET,
    code,
    redirect_uri: process.env.TESLA_REDIRECT_URI,
    audience: process.env.TESLA_AUDIENCE,
    scope: [
      "openid",
      "offline_access",
      "vehicle_device_data",
      "vehicle_cmds",
      "vehicle_location",
      "vehicle_charging_cmds"
    ].join(" ")
  });

  return requestToken(body);
}

async function requestToken(body) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Tesla token endpoint returned HTTP ${response.status}`
    );
  }

  return data;
}

export async function refreshTokens(refreshToken) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.TESLA_CLIENT_ID,
    refresh_token: refreshToken
  });

  return requestToken(body);
}

export async function saveTokens(data, previous = {}) {
  const now = Math.floor(Date.now() / 1000);

  const bundle = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? previous.refresh_token,
    expires_at: now + Number(data.expires_in ?? 3600),
    token_type: data.token_type ?? "Bearer"
  };

  if (!bundle.access_token || !bundle.refresh_token) {
    throw new Error("Tesla token response is incomplete");
  }

  // 토큰 갱신 실패 시 이전 토큰이 사라지지 않도록
  // 먼저 새 토큰을 검증한 뒤 저장한다.
  await redis.set(TOKEN_KEY, bundle);

  return bundle;
}

export async function getValidTokens() {
  const current = await redis.get(TOKEN_KEY);

  if (!current?.refresh_token) {
    throw new Error("Tesla authorization is required");
  }

  if (
    current.access_token &&
    current.expires_at > Math.floor(Date.now() / 1000) + 60
  ) {
    return current;
  }

  const updated = await refreshTokens(current.refresh_token);
  return saveTokens(updated, current);
}
