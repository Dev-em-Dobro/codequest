import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/server/auth";
import {
    storage,
    validationEngine,
    explainValidationFailures,
    reviewExerciseByInstructions,
} from "@/lib/server/deps";
import { getExerciseReviewMode } from "@/lib/server/validation-engine";
import { parseJsonBody } from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import type { CodeTriplet } from "@/lib/server/storage-types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };
type ReviewPayload = { userCode?: Partial<CodeTriplet> };

export async function POST(request: Request, { params }: Params) {
    try {
        const userId = getCurrentUserId(request);
        if (!userId) {
            return unauthorized();
        }

        const limited = enforceRateLimit(request, {
            id: "ai-review",
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: "Muitas requisicoes de IA. Tente novamente em alguns minutos.",
        });

        if (limited) {
            return limited;
        }

        const { id } = await params;
        const body = await parseJsonBody<ReviewPayload>(request);
        const exercise = await storage.getExercise(id);

        if (!exercise) {
            return NextResponse.json({ message: "Exercise not found" }, { status: 404 });
        }

        const userCode = {
            html: body?.userCode?.html || "",
            css: body?.userCode?.css || "",
            javascript: body?.userCode?.javascript || "",
        };

        // Enunciado aberto (cores/textos livres): IA julga só pelo enunciado.
        if (getExerciseReviewMode(exercise) === "ai") {
            const review = await reviewExerciseByInstructions({
                htmlCode: userCode.html,
                cssCode: userCode.css,
                javascriptCode: userCode.javascript,
                exerciseTitle: exercise.title,
                exerciseDescription: exercise.description || "",
                exerciseInstructions: exercise.instructions || "",
            });

            return NextResponse.json({
                feedback: review.feedback,
                suggestions: review.suggestions,
                isCorrect: Boolean(review.isCorrect) && (review.score ?? 0) >= 100,
                score: review.isCorrect ? 100 : Math.round(review.score ?? 0),
            });
        }

        const validation = await validationEngine.validateExercise(exercise, userCode);
        const score = Math.round(validation.overallScore);
        const isCorrect = validation.isValid && score >= 100;

        if (isCorrect) {
            return NextResponse.json({
                feedback: "Exercício concluído! Seu código atende aos requisitos do enunciado.",
                suggestions: [],
                isCorrect: true,
                score: 100,
            });
        }

        const explanation = await explainValidationFailures({
            exerciseTitle: exercise.title,
            exerciseInstructions: exercise.instructions || exercise.description || "",
            requirements: validation.requirements,
            failures: validation.failures,
            score,
            htmlCode: userCode.html,
            cssCode: userCode.css,
            javascriptCode: userCode.javascript,
        });

        return NextResponse.json({
            feedback: explanation.feedback,
            suggestions: explanation.suggestions,
            isCorrect: false,
            score,
        });
    } catch {
        return NextResponse.json(
            {
                feedback: "Desculpe, não foi possível analisar seu código no momento.",
                suggestions: ["Tente novamente em alguns instantes"],
                isCorrect: false,
                score: 0,
            },
            { status: 500 },
        );
    }
}
