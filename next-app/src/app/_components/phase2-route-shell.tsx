type Phase2RouteShellProps = {
    path: string;
    title: string;
    description: string;
};

export function Phase2RouteShell({ path, title, description }: Readonly<Phase2RouteShellProps>) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
            <div className="w-full max-w-3xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">CodeQuest - Fase 2</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-2 text-sm text-zinc-500">Rota: {path}</p>
                <p className="mt-4 text-zinc-600">{description}</p>
            </div>
        </main>
    );
}
