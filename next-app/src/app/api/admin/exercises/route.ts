import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/server/auth";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import type { InsertExercise } from "@/lib/server/storage-types";

export const runtime = "nodejs";

type CreateExercisePayload = InsertExercise & { id: string };

export async function POST(request: Request) {
  try {
    const userId = getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const exerciseData = await parseJsonBody<CreateExercisePayload>(request);
    const requiredFields: Array<keyof CreateExercisePayload> = [
      "id",
      "title",
      "description",
      "difficulty",
      "category",
      "points",
      "instructions",
    ];

    for (const field of requiredFields) {
      if (!exerciseData?.[field]) {
        return NextResponse.json({ error: `Campo obrigatório: ${field}` }, { status: 400 });
      }
    }

    const existingExercise = await storage.getExercise(exerciseData.id);
    if (existingExercise) {
      return NextResponse.json({ error: "Já existe um exercício com este ID" }, { status: 400 });
    }

    const newExercise = await storage.createExercise(exerciseData);
    return NextResponse.json({ message: "Exercício criado com sucesso", exercise: newExercise }, { status: 201 });
  } catch {
    return internalError();
  }
}
