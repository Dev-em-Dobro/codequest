"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

const STORAGE_USER_KEY = "codequest_user";
const STORAGE_SESSION_KEY = "codequest_session_id";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    points: number;
    level: number;
    description?: string;
    avatar?: string;
    github?: string;
    linkedin?: string;
};

type SignInCredentials = {
    email: string;
    password: string;
};

type SignUpCredentials = {
    email: string;
    password: string;
    name: string;
};

type AuthContextValue = {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signUp: (credentials: SignUpCredentials) => Promise<void>;
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;
    setUser: (user: AuthUser | null) => void;
};

type SessionResponse = {
    user: {
        id?: unknown;
        name?: unknown;
        email?: unknown;
        points?: unknown;
        totalPoints?: unknown;
        level?: unknown;
        description?: unknown;
        avatar?: unknown;
        github?: unknown;
        linkedin?: unknown;
    };
};

type SignInUpResponse = {
    sessionId?: unknown;
    user?: SessionResponse["user"];
};

const AuthContext = createContext<AuthContextValue | null>(null);

function asString(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeUser(rawUser: SessionResponse["user"] | undefined, fallbackId?: string): AuthUser | null {
    const id = asString(rawUser?.id, fallbackId ?? "");
    if (!id) {
        return null;
    }

    const points = asNumber(rawUser?.points ?? rawUser?.totalPoints, 0);
    const level = asNumber(rawUser?.level, Math.floor(points / 100) + 1);

    return {
        id,
        name: asString(rawUser?.name, "Usuario"),
        email: asString(rawUser?.email, ""),
        points,
        level,
        description: asOptionalString(rawUser?.description),
        avatar: asOptionalString(rawUser?.avatar),
        github: asOptionalString(rawUser?.github),
        linkedin: asOptionalString(rawUser?.linkedin),
    };
}

function persistSession(nextUser: AuthUser | null) {
    if (globalThis.window === undefined) {
        return;
    }

    if (nextUser) {
        globalThis.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
        globalThis.localStorage.setItem(STORAGE_SESSION_KEY, nextUser.id);
        return;
    }

    globalThis.localStorage.removeItem(STORAGE_USER_KEY);
    globalThis.localStorage.removeItem(STORAGE_SESSION_KEY);
}

function readStoredSession(): { user: AuthUser | null; sessionId: string | null } {
    if (globalThis.window === undefined) {
        return { user: null, sessionId: null };
    }

    const storedSessionId = globalThis.localStorage.getItem(STORAGE_SESSION_KEY);
    const storedUser = globalThis.localStorage.getItem(STORAGE_USER_KEY);

    if (!storedUser) {
        return { user: null, sessionId: storedSessionId };
    }

    try {
        const parsed = JSON.parse(storedUser) as Partial<AuthUser>;
        if (!parsed?.id) {
            return { user: null, sessionId: storedSessionId };
        }

        return {
            user: {
                id: parsed.id,
                name: parsed.name ?? "Usuario",
                email: parsed.email ?? "",
                points: parsed.points ?? 0,
                level: parsed.level ?? Math.floor((parsed.points ?? 0) / 100) + 1,
                description: parsed.description,
                avatar: parsed.avatar,
                github: parsed.github,
                linkedin: parsed.linkedin,
            },
            sessionId: storedSessionId ?? parsed.id,
        };
    } catch {
        return { user: null, sessionId: storedSessionId };
    }
}

async function fetchSession(sessionId: string): Promise<AuthUser | null> {
    const response = await fetch("/api/auth/session", {
        headers: {
            Authorization: `Bearer ${sessionId}`,
        },
        credentials: "include",
    });

    if (!response.ok) {
        return null;
    }

    const data = (await response.json()) as SessionResponse;
    return normalizeUser(data.user, sessionId);
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setUser = useCallback((nextUser: AuthUser | null) => {
        setAuthUser(nextUser);
        persistSession(nextUser);
    }, []);

    const clearSession = useCallback(() => {
        setUser(null);
    }, [setUser]);

    const refreshSession = useCallback(async () => {
        const stored = readStoredSession();
        if (!stored.sessionId) {
            clearSession();
            return;
        }

        const sessionUser = await fetchSession(stored.sessionId);
        if (!sessionUser) {
            clearSession();
            return;
        }

        setUser(sessionUser);
    }, [clearSession, setUser]);

    useEffect(() => {
        const bootstrapSession = async () => {
            try {
                const stored = readStoredSession();
                if (stored.user) {
                    setAuthUser(stored.user);
                }

                if (!stored.sessionId) {
                    clearSession();
                    return;
                }

                const sessionUser = await fetchSession(stored.sessionId);
                if (!sessionUser) {
                    clearSession();
                    return;
                }

                setUser(sessionUser);
            } finally {
                setIsLoading(false);
            }
        };

        void bootstrapSession();
    }, [clearSession, setUser]);

    useEffect(() => {
        (globalThis as { __authClient?: { getState: () => { user: AuthUser | null; sessionId: string | null; isLoading: boolean } } }).__authClient = {
            getState: () => ({
                user: authUser,
                sessionId: authUser?.id ?? null,
                isLoading,
            }),
        };
    }, [authUser, isLoading]);

    const signIn = useCallback(
        async (credentials: SignInCredentials) => {
            const response = await fetch("/api/auth/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
                credentials: "include",
            });

            const payload = (await response.json()) as SignInUpResponse & { message?: string };
            if (!response.ok) {
                throw new Error(payload.message || "Falha no login");
            }

            const normalizedUser = normalizeUser(payload.user, asString(payload.sessionId));
            if (!normalizedUser) {
                throw new Error("Nao foi possivel iniciar a sessao");
            }

            setUser(normalizedUser);
        },
        [setUser],
    );

    const signUp = useCallback(
        async (credentials: SignUpCredentials) => {
            const response = await fetch("/api/auth/sign-up", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
                credentials: "include",
            });

            const payload = (await response.json()) as SignInUpResponse & { message?: string };
            if (!response.ok) {
                throw new Error(payload.message || "Falha no cadastro");
            }

            const normalizedUser = normalizeUser(payload.user, asString(payload.sessionId));
            if (!normalizedUser) {
                throw new Error("Nao foi possivel criar a sessao");
            }

            setUser(normalizedUser);
        },
        [setUser],
    );

    const signOut = useCallback(async () => {
        await fetch("/api/auth/sign-out", {
            method: "POST",
            credentials: "include",
        });

        clearSession();
    }, [clearSession]);

    const contextValue = useMemo<AuthContextValue>(
        () => ({
            user: authUser,
            isAuthenticated: Boolean(authUser),
            isLoading,
            signIn,
            signUp,
            signOut,
            refreshSession,
            setUser,
        }),
        [authUser, isLoading, signIn, signUp, signOut, refreshSession, setUser],
    );

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}