"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";
import type { AuthUser } from "@/lib/auth-client";

type UpdateUserResponse = {
    success: boolean;
    user: {
        id: string;
        name?: string;
        email?: string;
        points?: number;
        level?: number;
        description?: string;
        avatar?: string;
        github?: string;
        linkedin?: string;
    };
};

type ProfileFormProps = {
    currentUser: AuthUser;
    onSignOut: () => Promise<void>;
    updateAuthUser: (user: AuthUser | null) => void;
};

function ProfileForm({ currentUser, onSignOut, updateAuthUser }: Readonly<ProfileFormProps>) {
    const [name, setName] = useState(currentUser.name || "");
    const [description, setDescription] = useState(currentUser.description || "");
    const [avatar, setAvatar] = useState(currentUser.avatar || "");
    const [github, setGithub] = useState(currentUser.github || "");
    const [linkedin, setLinkedin] = useState(currentUser.linkedin || "");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (event: { preventDefault: () => void }) => {
        event.preventDefault();

        if (!name.trim()) {
            setError("Informe seu nome antes de salvar.");
            return;
        }

        setError(null);
        setMessage(null);
        setIsSaving(true);

        try {
            const result = await apiClient<UpdateUserResponse>("/auth/update-user", {
                method: "POST",
                body: {
                    name: name.trim(),
                    description: description.trim(),
                    avatar: avatar.trim(),
                    github: github.trim(),
                    linkedin: linkedin.trim(),
                },
            });

            if (!result.user?.id) {
                throw new Error("Resposta de perfil invalida");
            }

            updateAuthUser({
                id: result.user.id,
                name: result.user.name || name.trim(),
                email: result.user.email || currentUser.email,
                points: Number(result.user.points || currentUser.points),
                level: Number(result.user.level || Math.floor((result.user.points || currentUser.points) / 100) + 1),
                description: result.user.description || description,
                avatar: result.user.avatar || avatar,
                github: result.user.github || github,
                linkedin: result.user.linkedin || linkedin,
            });

            setMessage("Perfil atualizado com sucesso.");
        } catch (saveError) {
            const saveMessage = saveError instanceof Error ? saveError.message : "Falha ao atualizar perfil";
            setError(saveMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Meu perfil</h1>
                    <p className="mt-2 text-sm text-zinc-600">Atualize seus dados para manter seu progresso identificado.</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        void onSignOut();
                    }}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                >
                    Sair
                </button>
            </div>

            <div className="mt-4 grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 sm:grid-cols-2">
                <p>
                    <span className="font-medium">Email:</span> {currentUser.email}
                </p>
                <p>
                    <span className="font-medium">Pontos:</span> {currentUser.points}
                </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSave}>
                <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium text-zinc-700">
                        Nome
                    </label>
                    <input
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                        placeholder="Seu nome"
                        disabled={isSaving}
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="description" className="text-sm font-medium text-zinc-700">
                        Descricao
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                        placeholder="Conte um pouco sobre voce"
                        disabled={isSaving}
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="avatar" className="text-sm font-medium text-zinc-700">
                        Avatar (URL)
                    </label>
                    <input
                        id="avatar"
                        value={avatar}
                        onChange={(event) => setAvatar(event.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                        placeholder="https://..."
                        disabled={isSaving}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <label htmlFor="github" className="text-sm font-medium text-zinc-700">
                            GitHub
                        </label>
                        <input
                            id="github"
                            value={github}
                            onChange={(event) => setGithub(event.target.value)}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                            placeholder="https://github.com/seu-usuario"
                            disabled={isSaving}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="linkedin" className="text-sm font-medium text-zinc-700">
                            LinkedIn
                        </label>
                        <input
                            id="linkedin"
                            value={linkedin}
                            onChange={(event) => setLinkedin(event.target.value)}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                            placeholder="https://linkedin.com/in/seu-usuario"
                            disabled={isSaving}
                        />
                    </div>
                </div>

                {error ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                ) : null}

                {message ? (
                    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {message}
                    </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSaving}
                    >
                        {isSaving ? "Salvando..." : "Salvar perfil"}
                    </button>

                    <Link
                        href="/"
                        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                    >
                        Voltar para inicio
                    </Link>
                </div>
            </form>
        </section>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, signOut, setUser } = useAuth();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace(`/auth/signin?redirect=${encodeURIComponent("/auth/profile")}`);
        }
    }, [authLoading, isAuthenticated, router]);

    const handleSignOut = async () => {
        await signOut();
        router.replace("/auth/signin");
    };

    if (authLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="rounded-xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600 shadow-sm">
                    Carregando perfil...
                </div>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <main className="flex min-h-screen justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
            <ProfileForm currentUser={user} onSignOut={handleSignOut} updateAuthUser={setUser} />
        </main>
    );
}
