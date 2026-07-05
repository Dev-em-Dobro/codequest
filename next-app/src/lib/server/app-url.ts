function normalizeOrigin(value: string): string {
    return value.startsWith("http") ? value : `https://${value}`;
}

export function resolveAppBaseUrl(): string {
    const candidates = [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.APP_URL,
        process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL)
            : undefined,
        process.env.VERCEL_URL ? normalizeOrigin(process.env.VERCEL_URL) : undefined,
        "http://localhost:3000",
    ];

    for (const candidate of candidates) {
        if (candidate) {
            return candidate.replace(/\/$/, "");
        }
    }

    return "http://localhost:3000";
}
