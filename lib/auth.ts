import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-only-insecure-secret"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function issueToken(user: {
  id: string;
  role: string;
}): Promise<string> {
  return new SignJWT({ user_id: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
}

export type AuthResult =
  | { ok: true; userId: string; role: string }
  | { ok: false };

export async function authenticate(request: Request): Promise<AuthResult> {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return { ok: false };
  if (db.revokedTokens.has(token)) return { ok: false };

  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.user_id !== "string" || typeof payload.role !== "string") {
      return { ok: false };
    }
    return { ok: true, userId: payload.user_id, role: payload.role };
  } catch {
    return { ok: false };
  }
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}
