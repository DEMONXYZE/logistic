import { findUserByIdentifier } from "@/lib/db";
import { comparePassword, issueToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { identifier, password } = (body ?? {}) as Record<string, unknown>;

  if (typeof identifier !== "string" || typeof password !== "string") {
    return Response.json(
      { success: false, message: "identifier and password are required" },
      { status: 400 }
    );
  }

  const user = findUserByIdentifier(identifier);
  if (!user) {
    return Response.json(
      { success: false, message: "invalid credentials" },
      { status: 401 }
    );
  }

  if (!user.isActive) {
    return Response.json(
      { success: false, message: "account is inactive" },
      { status: 403 }
    );
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return Response.json(
      { success: false, message: "invalid credentials" },
      { status: 401 }
    );
  }

  const accessToken = await issueToken(user);

  return Response.json({
    success: true,
    message: "login successful",
    data: {
      access_token: accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
      },
    },
  });
}
