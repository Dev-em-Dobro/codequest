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
    /** Entra com um link de acesso gerado por um admin (/auth/link?token=...). */
    signInWithLoginLink: (token: string) => Promise<void>;
    /** Atualiza os dados do usuário logado (não mexe no token de sessão). */
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
    /** Token opaco da sessão (não é o id do usuário). */
    sessionId?: unknown;
    user?: SessionResponse["user"];
};

/** Erro de autenticação que carrega o `code` devolvido pela API (ex.: NEEDS_PASSWORD_RESET). */
export class AuthRequestError extends Error {
    readonly code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.name = "AuthRequestError";
        this.code = code;
    }
}

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

function normalizeUser(rawUser: SessionResponse["user"] | undefined): AuthUser | null {
    const id = asString(rawUser?.id);
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

/** Token da sessão atual, para mandar como `Authorization: Bearer`. */
export function getStoredSessionToken(): string | null {
    if (globalThis.window === undefined) {
        return null;
    }

    return globalThis.localStorage.getItem(STORAGE_SESSION_KEY);
}

/** Salva o usuário; o token só é trocado quando um novo é passado (login). */
function persistSession(nextUser: AuthUser | null, sessionToken?: string) {
    if (globalThis.window === undefined) {
        return;
    }

    if (nextUser) {
        globalThis.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
        if (sessionToken) {
            globalThis.localStorage.setItem(STORAGE_SESSION_KEY, sessionToken);
        }
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
            sessionId: storedSessionId,
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
    return normalizeUser(data.user);
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setUser = useCallback((nextUser: AuthUser | null) => {
        setAuthUser(nextUser);
        persistSession(nextUser);
    }, []);

    /** Guarda usuário + token devolvidos por sign-in, sign-up ou link de acesso. */
    const startSession = useCallback((payload: SignInUpResponse) => {
        const sessionToken = asString(payload.sessionId);
        const normalizedUser = normalizeUser(payload.user);
        if (!sessionToken || !normalizedUser) {
            throw new Error("Nao foi possivel iniciar a sessao");
        }

        setAuthUser(normalizedUser);
        persistSession(normalizedUser, sessionToken);
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
                sessionId: authUser ? getStoredSessionToken() : null,
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

            const payload = (await response.json()) as SignInUpResponse & { message?: string; code?: string };
            if (!response.ok) {
                throw new AuthRequestError(payload.message || "Falha no login", payload.code);
            }

            startSession(payload);
        },
        [startSession],
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

            startSession(payload);
        },
        [startSession],
    );

    const signInWithLoginLink = useCallback(
        async (token: string) => {
            const response = await fetch("/api/auth/login-link", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
                credentials: "include",
            });

            const payload = (await response.json()) as SignInUpResponse & { message?: string };
            if (!response.ok) {
                throw new Error(payload.message || "Link de acesso inválido");
            }

            startSession(payload);
        },
        [startSession],
    );

    const signOut = useCallback(async () => {
        const sessionToken = getStoredSessionToken();
        await fetch("/api/auth/sign-out", {
            method: "POST",
            headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
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
            signInWithLoginLink,
            setUser,
        }),
        [authUser, isLoading, signIn, signUp, signOut, refreshSession, signInWithLoginLink, setUser],
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