import { db } from "@/lib/db";

// Intentionally open, no auth check yet — see docs/llm.yml.
export async function PUT(req: Request) {
  const body = await req.json();
  const { provider_id, model } = body;

  const provider = db.llmProviders.find((p) => p.id === provider_id);

  if (!provider) {
    return Response.json(
      { success: false, message: "provider not found" },
      { status: 404 }
    );
  }

  db.llmProviders.forEach((p) => (p.is_active = p.id === provider_id));
  provider.active_model = model;
  provider.updated_at = new Date().toISOString();

  return Response.json({
    success: true,
    message: "config updated successfully",
  });
}