import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/server/auth";
import { storage } from "@/lib/server/deps";
import {
    SOLUTION_UNLOCK_AFTER,
    hasSolutionContent,
} from "@/lib/server/exercise-public";
import { internalError } from "@/lib/server/http";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
    try {
        const userId = getCurrentUserId(request);
        if (!userId) {
            return unauthorized();
        }

        const { id } = await params;
        const exercise = await storage.getExercise(id);

        if (!exercise) {
            return NextResponse.json({ message: "Exercise not found" }, { status: 404 });
        }

        if (!hasSolutionContent(exercise.solutionCode)) {
            return NextResponse.json(
                { message: "Este exercicio ainda nao possui solucao oficial cadastrada." },
                { status: 404 },
            );
        }

        const progress = await storage.getExerciseProgress(userId, id);
        const incorrectAttempts = progress?.incorrectAttempts ?? 0;
        const unlocked =
            Boolean(progress?.completed) || incorrectAttempts >= SOLUTION_UNLOCK_AFTER;

        if (!unlocked) {
            return NextResponse.json(
                {
                    message: `A solucao libera apos ${SOLUTION_UNLOCK_AFTER} tentativas incorretas.`,
                    incorrectAttempts,
                    requiredAttempts: SOLUTION_UNLOCK_AFTER,
                    unlocked: false,
                },
                { status: 403 },
            );
        }

        return NextResponse.json({
            unlocked: true,
            incorrectAttempts,
            requiredAttempts: SOLUTION_UNLOCK_AFTER,
            solutionCode: exercise.solutionCode,
        });
    } catch {
        return internalError();
    }
}
