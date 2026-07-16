import { db } from "@/lib/db";

// Intentionally open, no auth check yet — see docs/llm.yml.
export async function GET() {
  const activeProvider = db.llmProviders.find((p) => p.is_active);

  return Response.json({
    success: true,
    message: "ok",
    data: {
      provider: activeProvider?.name ?? null,
      models: db.llmModels, // list ของ model ทั้งหมดที่เลือกได้
    },
  });
}