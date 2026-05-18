export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
      <div className="w-full max-w-3xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">CodeQuest</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Base Next.js criada com sucesso</h1>
        <p className="mt-4 text-zinc-600">
          Esta estrutura corresponde a Fase 1 da migracao. A partir daqui, as rotas e APIs do sistema atual
          serao migradas por fases, mantendo paridade funcional.
        </p>
      </div>
    </main>
  );
}
