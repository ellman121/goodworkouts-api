import { createSecretKey } from "crypto";
import { jwtVerify, SignJWT } from "jose";

export type TokenType = "access" | "refresh";

interface TokenClaims {
  userId: string;
  type: TokenType;
}

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET env var is not set");
if (secret.length < 32)
  throw new Error("JWT_SECRET must be at least 32 characters");
const secretKey = createSecretKey(Buffer.from(secret));

// Access tokens are short-lived; refresh tokens last a month so a client stays
// signed in between sessions.
const tokenTTL: Record<TokenType, string> = {
  access: "10800s", // 3h
  refresh: "2592000s", // 30d
};

// The type is signed into the token, so a refresh token cannot be replayed as
// an access token (or vice versa) — each is only accepted where it belongs.
export async function generateJWT(userId: string, type: TokenType) {
  return new SignJWT({ userId, type })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("goodworkouts")
    .setAudience("goodworkouts")
    .setExpirationTime(tokenTTL[type])
    .sign(secretKey);
}

export async function generateTokenPair(userId: string) {
  const [token, refreshToken] = await Promise.all([
    generateJWT(userId, "access"),
    generateJWT(userId, "refresh"),
  ]);

  return { token, refreshToken };
}

export async function validateJWT(hash: string, expectedType: TokenType) {
  try {
    const { payload } = await jwtVerify<TokenClaims>(hash, secretKey, {
      audience: "goodworkouts",
      issuer: "goodworkouts",
    });

    if (payload.type !== expectedType) return { valid: false, payload: null };

    return {
      valid: true,
      payload,
    };
  } catch (_) {
    // Swallow JWT errors
    return {
      valid: false,
      payload: null,
    };
  }
}
