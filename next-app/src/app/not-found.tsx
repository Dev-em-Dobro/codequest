import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
            <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">CodeQuest</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">Pagina nao encontrada</h1>
                <p className="mt-4 text-zinc-600">A rota solicitada nao existe no novo App Router.</p>
                <Link
                    href="/"
                    className="mt-6 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                    Voltar para inicio
                </Link>
            </div>
        </main>
    );
}
