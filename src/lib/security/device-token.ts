import crypto from "crypto";

const DEVICE_TOKEN_TTL_MS = 5 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not configured");
  }
  return secret;
}

export function createDeviceManageToken(
  userId: string,
  ttlMs: number = DEVICE_TOKEN_TTL_MS,
): string {
  const exp = Date.now() + ttlMs;
  const payload = `${userId}.${exp}`;
  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  // token format: userId.exp.signature
  return `${userId}.${exp}.${hmac}`;
}

export function verifyDeviceManageToken(token: string): {
  valid: boolean;
  userId?: string;
  error?: string;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" };
    }
    const [userId, expStr, providedSig] = parts;
    const exp = Number(expStr);
    if (!userId || !exp || !providedSig) {
      return { valid: false, error: "Malformed token" };
    }
    if (Date.now() > exp) {
      return { valid: false, error: "Token expired" };
    }
    const payload = `${userId}.${exp}`;
    const expectedSig = crypto
      .createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");
    if (
      !crypto.timingSafeEqual(
        Buffer.from(providedSig),
        Buffer.from(expectedSig),
      )
    ) {
      return { valid: false, error: "Signature mismatch" };
    }
    return { valid: true, userId };
  } catch {
    return { valid: false, error: "Token verification failed" };
  }
}
