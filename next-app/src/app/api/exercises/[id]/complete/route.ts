import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/server/auth";
import { storage } from "@/lib/server/deps";
import { internalError } from "@/lib/server/http";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
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

        const user = await storage.getUser(userId);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const points = exercise.points || 10;
        const progress = await storage.updateUserProgress(userId, id, {
            completed: true,
            pointsEarned: points,
        });

        await storage.updateUser(userId, {
            totalPoints: (user.totalPoints || 0) + points,
            completedExercises: (user.completedExercises || 0) + 1,
        });

        return NextResponse.json(progress);
    } catch {
        return internalError();
    }
}
