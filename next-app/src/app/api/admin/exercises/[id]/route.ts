import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/current-user";
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

    const adminCheck = await requireAdmin(request);
    if (!adminCheck.ok) {
      return adminCheck.response;
    }

    const { id } = await params;
    await storage.deleteExercise(id);
    return NextResponse.json({ message: "Exercício removido com sucesso" });
  } catch {
    return internalError();
  }
}
