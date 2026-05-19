import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/server/auth";
import { storage } from "@/lib/server/deps";
import { internalError } from "@/lib/server/http";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
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
