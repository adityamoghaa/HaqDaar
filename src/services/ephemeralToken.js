// Ephemeral Token Service — fetches short-lived tokens from our backend
// for secure client-side Gemini Live API WebSocket connections

let cachedToken = null;
let tokenExpiry = 0;

export async function getEphemeralToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  const response = await fetch("/api/ephemeral-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Token request failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.token;
  // Tokens typically expire in ~2 minutes
  tokenExpiry = Date.now() + (data.expiresIn || 120) * 1000;

  return cachedToken;
}

export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = 0;
}
