import { NextResponse } from "next/server";

type RateLimitConfig = Readonly<{
    id: string;
    windowMs: number;
    max: number;
    message: string;
}>;

type Bucket = {
    count: number;
    resetAt: number;
};

type RateLimitStore = Map<string, Bucket>;

declare global {
    var __codequestRateLimitStore: RateLimitStore | undefined;
}

function getStore(): RateLimitStore {
    globalThis.__codequestRateLimitStore ??= new Map<string, Bucket>();

    return globalThis.__codequestRateLimitStore;
}

function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        const firstIp = forwardedFor.split(",")[0]?.trim();
        if (firstIp) {
            return firstIp;
        }
    }

    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) {
        return realIp;
    }

    return "unknown";
}

function consumeLimit(key: string, windowMs: number, max: number): { limited: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const store = getStore();
    const current = store.get(key);

    if (!current || current.resetAt <= now) {
        store.set(key, {
            count: 1,
            resetAt: now + windowMs,
        });

        return { limited: false, retryAfterSeconds: 0 };
    }

    if (current.count >= max) {
        const remainingMs = current.resetAt - now;
        return {
            limited: true,
            retryAfterSeconds: Math.max(1, Math.ceil(remainingMs / 1000)),
        };
    }

    current.count += 1;
    store.set(key, current);

    return { limited: false, retryAfterSeconds: 0 };
}

export function enforceRateLimit(request: Request, config: RateLimitConfig): NextResponse | null {
    const ip = getClientIp(request);
    const key = `${config.id}:${ip}`;
    const result = consumeLimit(key, config.windowMs, config.max);

    if (!result.limited) {
        return null;
    }

    return NextResponse.json(
        { error: config.message },
        {
            status: 429,
            headers: {
                "Retry-After": String(result.retryAfterSeconds),
            },
        },
    );
}
