import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/server/auth";
import {
    storage,
    validationEngine,
    explainValidationFailures,
    reviewExerciseByInstructions,
} from "@/lib/server/deps";
import { SOLUTION_UNLOCK_AFTER } from "@/lib/server/exercise-public";
import { getExerciseReviewMode } from "@/lib/server/validation-engine";
import { parseJsonBody } from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import type { CodeTriplet, UserProgress } from "@/lib/server/storage-types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };
type ReviewPayload = { userCode?: Partial<CodeTriplet> };

async function ensureProgress(userId: string, exerciseId: string): Promise<UserProgress> {
    const existing = await storage.getExerciseProgress(userId, exerciseId);
    if (existing) {
        return existing;
    }

    return storage.createUserProgress({
        id: `${userId}_${exerciseId}`,
        userId,
        exerciseId,
        completed: false,
        userCode: { html: "", css: "", javascript: "" },
        pointsEarned: 0,
        attempts: 0,
        incorrectAttempts: 0,
    });
}

async function recordIncorrectAttempt(userId: string, exerciseId: string): Promise<number> {
    const progress = await ensureProgress(userId, exerciseId);
    const nextCount = (progress.incorrectAttempts || 0) + 1;
    await storage.updateUserProgress(userId, exerciseId, {
        incorrectAttempts: nextCount,
    });
    return nextCount;
}

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

        const progress = await ensureProgress(userId, id);

        const buildFailurePayload = async (payload: {
            feedback: string;
            suggestions: string[];
            score: number;
        }) => {
            const incorrectAttempts = await recordIncorrectAttempt(userId, id);
            return {
                ...payload,
                isCorrect: false,
                incorrectAttempts,
                solutionUnlocked: incorrectAttempts >= SOLUTION_UNLOCK_AFTER || progress.completed,
                requiredAttempts: SOLUTION_UNLOCK_AFTER,
            };
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

            const isCorrect = Boolean(review.isCorrect) && (review.score ?? 0) >= 100;
            if (isCorrect) {
                return NextResponse.json({
                    feedback: review.feedback,
                    suggestions: review.suggestions,
                    isCorrect: true,
                    score: 100,
                    incorrectAttempts: progress.incorrectAttempts || 0,
                    solutionUnlocked: true,
                    requiredAttempts: SOLUTION_UNLOCK_AFTER,
                });
            }

            return NextResponse.json(
                await buildFailurePayload({
                    feedback: review.feedback,
                    suggestions: review.suggestions,
                    score: Math.round(review.score ?? 0),
                }),
            );
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
                incorrectAttempts: progress.incorrectAttempts || 0,
                solutionUnlocked: true,
                requiredAttempts: SOLUTION_UNLOCK_AFTER,
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

        return NextResponse.json(
            await buildFailurePayload({
                feedback: explanation.feedback,
                suggestions: explanation.suggestions,
                score,
            }),
        );
    } catch (error) {
        console.error("ai-review failed:", error);
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
