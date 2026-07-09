import { authenticate } from "@/lib/auth";
import { findUserById } from "@/lib/db";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (!auth.ok) {
    return Response.json(
      { success: false, message: "invalid or expired token" },
      { status: 401 }
    );
  }

  const user = findUserById(auth.userId);
  if (!user) {
    return Response.json(
      { success: false, message: "invalid or expired token" },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    message: "ok",
    data: {
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
