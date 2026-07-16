import { db } from "@/lib/db";

// Intentionally open, no auth check yet — see docs/llm.yml.
export async function GET() {
  return Response.json({
    success: true,
    message: "ok",
    data: {
      providers: db.llmProviders,
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, base_url, api_key } = body;

  if (!name || !base_url) {
    return Response.json(
      { success: false, message: "name and base_url are required" },
      { status: 400 }
    );
  }

  const newProvider = {
    id: db.llmProviders.length + 1,
    name,
    base_url,
    api_key, // เก็บไว้ก่อน ควรเข้ารหัส/ไม่ส่งกลับใน GET จริง
    is_active: false,
    active_model: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.llmProviders.push(newProvider);

  return Response.json({
    success: true,
    message: "provider created successfully",
  });
}