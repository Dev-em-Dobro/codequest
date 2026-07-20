import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/server/auth";
import { storage } from "@/lib/server/deps";
import { internalError } from "@/lib/server/http";

export const runtime = "nodejs";

type Params = { params: Promise<{ exerciseId: string }> };

export async function GET(request: Request, { params }: Params) {
    try {
        const userId = getCurrentUserId(request);
        if (!userId) {
            return unauthorized();
        }

        const { exerciseId } = await params;
        let progress = await storage.getExerciseProgress(userId, exerciseId);

        progress ??= await storage.createUserProgress({
            id: `${userId}_${exerciseId}`,
            userId,
            exerciseId,
            completed: false,
            userCode: { html: "", css: "", javascript: "" },
            pointsEarned: 0,
            attempts: 0,
            incorrectAttempts: 0,
        });

        return NextResponse.json(progress);
    } catch {
        return internalError();
    }
}
