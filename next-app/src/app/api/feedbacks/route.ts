import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/server/auth";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const userId = getCurrentUserId(request);
    if (!userId) {
      return unauthorized();
    }

    const body = await parseJsonBody(request);
    const feedback = typeof body?.feedback === "string" ? body.feedback.trim() : "";
    if (!feedback) {
      return NextResponse.json({ error: "Feedback é obrigatório" }, { status: 400 });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    await storage.createFeedback({
      feedback,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return internalError();
  }
}
