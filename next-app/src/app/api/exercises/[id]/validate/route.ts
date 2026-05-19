import { NextResponse } from "next/server";
import { storage, validationEngine } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import type { CodeTriplet } from "@/lib/server/storage-types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };
type ValidatePayload = { userCode?: Partial<CodeTriplet> };

export async function POST(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = await parseJsonBody<ValidatePayload>(request);
        const exercise = await storage.getExercise(id);

        if (!exercise) {
            return NextResponse.json({ message: "Exercise not found" }, { status: 404 });
        }

        const userCode = {
            html: body?.userCode?.html ?? "",
            css: body?.userCode?.css ?? "",
            javascript: body?.userCode?.javascript ?? "",
        };

        const validationResults = await validationEngine.validateExercise(exercise, userCode);

        return NextResponse.json(validationResults);
    } catch {
        return internalError();
    }
}
