import { NextResponse } from "next/server";
import { storage, reviewExerciseCode } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import type { CodeTriplet } from "@/lib/server/storage-types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };
type ReviewPayload = { userCode?: Partial<CodeTriplet> };

export async function POST(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = await parseJsonBody<ReviewPayload>(request);
        const exercise = await storage.getExercise(id);

        if (!exercise) {
            return NextResponse.json({ message: "Exercise not found" }, { status: 404 });
        }

        const userCode = body?.userCode || { html: "", css: "", javascript: "" };
        const review = await reviewExerciseCode(
            userCode.html || "",
            userCode.css || "",
            userCode.javascript || "",
            exercise.title,
            exercise.description || "",
            exercise.instructions || "",
        );

        return NextResponse.json(review);
    } catch {
        return internalError();
    }
}
