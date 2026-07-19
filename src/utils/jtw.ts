import { createSecretKey } from "crypto";
import { jwtVerify, SignJWT } from "jose";

interface JWTPayload {
  userId: string;
}

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET env var is not set");
const secretKey = createSecretKey(Buffer.from(secret));

// Expire times are either 3h or 30d in seconds
export async function generateJWT(p: JWTPayload, expireTime: "10800s" | "2592000s") {
  const token = await new SignJWT({
    ...p,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("goodworkouts")
    .setAudience("goodworkouts")
    .setExpirationTime(expireTime)
    .sign(secretKey);
  return token;
}

export async function validateJWT(hash: string) {
  try {
    const token = await jwtVerify<JWTPayload>(hash, secretKey, {
      audience: "goodworkouts",
      issuer: "goodworkouts",
    })

    return {
      valid: true,
      payload: token.payload,
    };
  } catch (_) {
    // Swallow JWT errors
    return {
      valid: false,
      payload: null,
    };
  }
}
