import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { internalError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const category = url.searchParams.get("category");
        const difficulty = url.searchParams.get("difficulty");

        const exercises = await storage.getExercises();
        let filteredExercises = exercises;

        if (category && category !== "all") {
            filteredExercises = filteredExercises.filter((ex) => ex.category === category);
        }

        if (difficulty && difficulty !== "all") {
            filteredExercises = filteredExercises.filter((ex) => ex.difficulty === difficulty);
        }

        return NextResponse.json(filteredExercises);
    } catch {
        return internalError();
    }
}
