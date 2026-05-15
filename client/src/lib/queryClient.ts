import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Prefer in-memory auth state, fallback to persisted session for first render calls
  const authState = (globalThis as any).__authClient?.getState?.();
  const sessionId = authState?.sessionId || localStorage.getItem("codequest_session_id");

  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(sessionId ? { Authorization: `Bearer ${sessionId}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Prefer in-memory auth state, fallback to persisted session for first render calls
    const authState = (globalThis as any).__authClient?.getState?.();
    const sessionId = authState?.sessionId || localStorage.getItem("codequest_session_id");

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: {
        ...(sessionId ? { Authorization: `Bearer ${sessionId}` } : {}),
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      // Performance optimizations
      staleTime: 60 * 1000, // 60 seconds - reasonable stale time
      gcTime: 5 * 60 * 1000, // 5 minutes - longer garbage collection time
      refetchOnWindowFocus: false, // Disable refetch on window focus
      refetchOnReconnect: false, // Disable refetch on reconnect
      refetchOnMount: true, // Allow refetch on mount for fresh data
      refetchInterval: false, // Disable automatic polling
      retry: 1, // Only 1 retry instead of 3
      retryDelay: 1000, // 1 second delay between retries
      // Enable network mode for better offline handling
      networkMode: "online",
    },
    mutations: {
      retry: 1, // Allow 1 retry for mutations
      retryDelay: 1000,
      networkMode: "online",
    },
  },
});

