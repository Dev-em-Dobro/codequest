export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
      <div className="w-full max-w-3xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">CodeQuest</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Fase 2 iniciada: rotas no App Router</h1>
        <p className="mt-4 text-zinc-600">
          O mapeamento das URLs da aplicacao atual para o Next.js ja foi criado. O proximo passo e conectar
          cada rota aos componentes existentes para manter o comportamento funcional.
        </p>
        <ul className="mt-6 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
          <li>/categories</li>
          <li>/exercise</li>
          <li>/exercise/[id]</li>
          <li>/exercises/[category]</li>
          <li>/ranking</li>
          <li>/feedback</li>
          <li>/auth/signin</li>
          <li>/auth/signup</li>
          <li>/auth/forgot-password</li>
          <li>/auth/profile</li>
          <li>/admin/add-exercise</li>
        </ul>
      </div>
    </main>
  );
}
