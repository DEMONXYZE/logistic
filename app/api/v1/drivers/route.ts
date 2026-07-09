import { db } from "@/lib/db";

// Intentionally open, no auth check yet — see docs/drivers.yml.
export async function GET() {
  const data = db.users
    .filter((u) => u.role === "driver" && u.driver)
    .map((u) => ({
      userId: u.id,
      licenseNo: u.driver!.licenseNo,
      carType: u.driver!.carType,
      currentScore: u.driver!.currentScore,
      productivityIndex: u.driver!.productivityIndex,
      riskLevel: u.driver!.riskLevel,
      availability: u.driver!.availability,
    }));

  return Response.json({
    success: true,
    message: "Get data successfull",
    data,
  });
}
