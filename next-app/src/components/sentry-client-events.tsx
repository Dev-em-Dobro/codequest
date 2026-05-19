"use client";

import { useEffect } from "react";

type FrontendTelemetryPayload = {
    source: "frontend";
    message: string;
    stack?: string;
    context: {
        kind: "error" | "unhandledrejection";
        pathname: string;
        userAgent: string;
    };
};

async function reportFrontendError(payload: FrontendTelemetryPayload) {
    try {
        await fetch("/api/telemetry/sentry-test", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
        });
    } catch {
        // Ignore telemetry failures to avoid impacting UX.
    }
}

function normalizeReason(reason: unknown): { message: string; stack?: string } {
    if (reason instanceof Error) {
        return {
            message: reason.message,
            stack: reason.stack,
        };
    }

    return {
        message: typeof reason === "string" ? reason : "Unhandled promise rejection",
    };
}

export function SentryClientEvents() {
    useEffect(() => {
        const pathname = globalThis.location.pathname;
        const userAgent = globalThis.navigator.userAgent;

        const onWindowError = (event: ErrorEvent) => {
            const message = event.message || "Unhandled error";

            void reportFrontendError({
                source: "frontend",
                message,
                stack: event.error instanceof Error ? event.error.stack : undefined,
                context: {
                    kind: "error",
                    pathname,
                    userAgent,
                },
            });
        };

        const onUnhandledRejection = (event: PromiseRejectionEvent) => {
            const normalized = normalizeReason(event.reason);

            void reportFrontendError({
                source: "frontend",
                message: normalized.message,
                stack: normalized.stack,
                context: {
                    kind: "unhandledrejection",
                    pathname,
                    userAgent,
                },
            });
        };

        globalThis.addEventListener("error", onWindowError);
        globalThis.addEventListener("unhandledrejection", onUnhandledRejection);

        return () => {
            globalThis.removeEventListener("error", onWindowError);
            globalThis.removeEventListener("unhandledrejection", onUnhandledRejection);
        };
    }, []);

    return null;
}
