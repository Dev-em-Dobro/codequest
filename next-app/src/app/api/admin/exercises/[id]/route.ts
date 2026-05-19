import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/server/auth";
import { storage } from "@/lib/server/deps";
import { internalError } from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    const limited = enforceRateLimit(request, {
      id: "admin-delete-exercise",
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: "Muitas operacoes administrativas. Tente novamente mais tarde.",
    });

    if (limited) {
      return limited;
    }

    const userId = getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await storage.deleteExercise(id);
    return NextResponse.json({ message: "Exercício removido com sucesso" });
  } catch {
    return internalError();
  }
}
