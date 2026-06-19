type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiClientOptions = {
    method?: ApiMethod;
    body?: unknown;
    headers?: HeadersInit;
};

function getSessionId(): string | null {
    if (globalThis.window === undefined) {
        return null;
    }

    return localStorage.getItem("codequest_session_id");
}

function handleUnauthorized(): void {
    if (globalThis.window === undefined) {
        return;
    }

    localStorage.removeItem("codequest_user");
    localStorage.removeItem("codequest_session_id");

    const { pathname, search } = globalThis.location;
    if (pathname.startsWith("/auth/")) {
        return;
    }

    const redirectTarget = `${pathname}${search}`;
    globalThis.location.href = `/auth/signin?redirect=${encodeURIComponent(redirectTarget)}`;
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
    const method = options.method ?? "GET";
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const sessionId = getSessionId();
    const body = options.body === undefined ? undefined : JSON.stringify(options.body);

    const headers = new Headers(options.headers);
    if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    if (sessionId && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${sessionId}`);
    }

    const response = await fetch(`/api${normalizedPath}`, {
        method,
        headers,
        body,
        credentials: "include",
    });

    if (!response.ok) {
        if (response.status === 401) {
            handleUnauthorized();
        }

        const text = (await response.text()) || response.statusText;
        throw new Error(`${response.status}: ${text}`);
    }

    return (await response.json()) as T;
}
