import * as Sentry from "@sentry/node";

type ErrorContext = Record<string, unknown>;

let initialized = false;

function getDsn(): string {
    return (process.env.SENTRY_DSN || "").trim();
}

function ensureSentryInitialized() {
    if (initialized) {
        return;
    }

    const dsn = getDsn();
    if (!dsn) {
        return;
    }

    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    });

    initialized = true;
}

export function isSentryEnabled(): boolean {
    return Boolean(getDsn());
}

export function captureServerError(error: unknown, context?: ErrorContext) {
    if (!isSentryEnabled()) {
        return;
    }

    ensureSentryInitialized();

    let safeError: Error;
    if (error instanceof Error) {
        safeError = error;
    } else if (typeof error === "string") {
        safeError = new Error(error);
    } else {
        safeError = new Error("Unknown error");
    }

    Sentry.captureException(safeError, {
        extra: context,
    });
}

export async function flushSentry(timeoutMs = 2000): Promise<void> {
    if (!isSentryEnabled()) {
        return;
    }

    ensureSentryInitialized();
    await Sentry.flush(timeoutMs);
}
