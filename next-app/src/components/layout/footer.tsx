import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#9d4edd]/20 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-[#fff6e9]/70 sm:flex-row sm:px-6 lg:px-8">
        <span className="number text-xs">© {year} CodeQuest</span>

        <nav className="flex items-center gap-4">
          <Link href="/privacidade" className="transition-colors hover:text-[#9d4edd]">
            Política de Privacidade
          </Link>
          <Link href="/termos" className="transition-colors hover:text-[#9d4edd]">
            Termos de Serviço
          </Link>
        </nav>
      </div>
    </footer>
  );
}
