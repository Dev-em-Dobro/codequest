import { NextResponse } from "next/server";
import { captureServerError, flushSentry, isSentryEnabled } from "@/lib/server/sentry";
import { internalError, parseJsonBody } from "@/lib/server/http";

export const runtime = "nodejs";

type SentryTestPayload = {
    source?: "backend" | "frontend";
    message?: string;
    stack?: string;
    context?: Record<string, unknown>;
    forceInternalError?: boolean;
};

export async function POST(request: Request) {
    try {
        const body = await parseJsonBody<SentryTestPayload>(request);

        if (body.forceInternalError) {
            throw new Error("Forced internal error for regression testing");
        }

        if (!isSentryEnabled()) {
            return NextResponse.json(
                { captured: false, reason: "SENTRY_DSN not configured" },
                { status: 503 },
            );
        }

        const source = body.source === "frontend" ? "frontend" : "backend";
        const message = typeof body.message === "string" && body.message.trim() ? body.message.trim() : "Sentry test event";

        const error = new Error(message);
        if (typeof body.stack === "string" && body.stack.trim()) {
            error.stack = body.stack;
        }

        const errorContext: Record<string, unknown> = { source };
        if (body.context) {
            Object.assign(errorContext, body.context);
        }

        captureServerError(error, errorContext);

        await flushSentry();

        return NextResponse.json({
            captured: true,
            source,
        });
    } catch (error) {
        return internalError(error, {
            route: "api/telemetry/sentry-test",
        });
    }
}
