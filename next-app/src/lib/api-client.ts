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
        const text = (await response.text()) || response.statusText;
        throw new Error(`${response.status}: ${text}`);
    }

    return (await response.json()) as T;
}
