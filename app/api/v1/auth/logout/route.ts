import { authenticate, getBearerToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (!auth.ok) {
    return Response.json(
      { success: false, message: "invalid or expired token" },
      { status: 401 }
    );
  }

  const token = getBearerToken(request);
  if (token) db.revokedTokens.add(token);

  return Response.json({ success: true, message: "logged out successfully" });
}
