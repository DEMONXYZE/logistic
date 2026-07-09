import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return Response.json(
      { success: false, message: "invalid request body" },
      { status: 400 }
    );
  }

  const { phone, email, password, fullName, role, driver } = body as Record<
    string,
    unknown
  >;

  if (
    typeof phone !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof fullName !== "string" ||
    (role !== "driver" && role !== "shipper")
  ) {
    return Response.json(
      {
        success: false,
        message:
          "phone, email, password, fullName are required and role must be 'driver' or 'shipper'",
      },
      { status: 400 }
    );
  }

  if (role === "driver") {
    const d = driver as Record<string, unknown> | undefined;
    if (!d || typeof d.licenseNo !== "string" || typeof d.carType !== "string") {
      return Response.json(
        {
          success: false,
          message: "driver.licenseNo and driver.carType are required when role is 'driver'",
        },
        { status: 400 }
      );
    }
  }

  if (db.users.some((u) => u.email === email || u.phone === phone)) {
    return Response.json(
      { success: false, message: "phone or email already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const id = randomUUID();

  db.users.push({
    id,
    phone,
    email,
    passwordHash,
    fullName,
    role,
    isActive: true,
    verificationStatus: "approved",
    createdAt: now,
    ...(role === "driver"
      ? {
          driver: {
            licenseNo: (driver as Record<string, unknown>).licenseNo as string,
            carType: (driver as Record<string, unknown>).carType as string,
            currentScore: 0,
            productivityIndex: 0,
            riskLevel: "low",
            availability: "offline",
          },
        }
      : {}),
  });

  return Response.json(
    {
      success: true,
      message: "registration successful",
      data: {
        id,
        phone,
        email,
        full_name: fullName,
        role,
        verification_status: "approved",
        created_at: now,
      },
    },
    { status: 201 }
  );
}
