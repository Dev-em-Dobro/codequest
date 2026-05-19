import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
            <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight">Recuperar senha</h1>
                <p className="mt-3 text-sm text-zinc-600">
                    Para redefinir a senha, entre em contato com o suporte pelo WhatsApp.
                </p>

                <a
                    href="http://wa.me/555197034968"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                    Falar com o suporte
                </a>

                <Link href="/auth/signin" className="mt-4 inline-block text-sm text-zinc-700 hover:underline">
                    Voltar para o login
                </Link>
            </section>
        </main>
    );
}
