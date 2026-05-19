import { NextResponse } from "next/server";
import { getExerciseHint, storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import type { CodeTriplet } from "@/lib/server/storage-types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };
type HintPayload = { userCode?: Partial<CodeTriplet> };

export async function POST(request: Request, { params }: Params) {
    try {
        const limited = enforceRateLimit(request, {
            id: "ai-hint",
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: "Muitas requisicoes de IA. Tente novamente em alguns minutos.",
        });

        if (limited) {
            return limited;
        }

        const { id } = await params;
        const body = await parseJsonBody<HintPayload>(request);
        const exercise = await storage.getExercise(id);

        if (!exercise) {
            return NextResponse.json({ message: "Exercise not found" }, { status: 404 });
        }

        const userCode = body?.userCode || { html: "", css: "", javascript: "" };
        const hint = await getExerciseHint(
            userCode.html || "",
            userCode.css || "",
            userCode.javascript || "",
            exercise.title,
            exercise.instructions || "",
        );

        return NextResponse.json({ hint });
    } catch {
        return internalError();
    }
}
