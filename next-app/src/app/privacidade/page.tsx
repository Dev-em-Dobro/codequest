import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Política de Privacidade · CodeQuest",
  description:
    "Como o CodeQuest coleta, usa e protege os seus dados. Seus dados são usados apenas para o acesso aos exercícios, sem finalidade comercial.",
};

const lastUpdate = "18 de junho de 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="fantasy-card p-6 sm:p-10">
          <header className="mb-8 border-b border-[#9d4edd]/20 pb-6">
            <h1 className="text-3xl font-bold text-[#9d4edd] [font-family:var(--font-title)]">
              Política de Privacidade
            </h1>
            <p className="mt-2 text-sm text-[#fff6e9]/70 [font-family:var(--font-inter)]">
              Última atualização: {lastUpdate}
            </p>
          </header>

          <div className="space-y-8 text-[0.95rem] leading-7 text-[#fff6e9]/90 [font-family:var(--font-inter)]">
            <section>
              <p>
                Esta Política de Privacidade descreve como o <strong>CodeQuest</strong> — plataforma
                de aprendizado de programação web — coleta, utiliza, armazena e protege os dados das
                pessoas que utilizam a plataforma. Ao criar uma conta e usar o CodeQuest, você
                concorda com as práticas descritas neste documento.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                1. Compromisso: sem finalidade comercial
              </h2>
              <p>
                Os seus dados são coletados <strong>exclusivamente para permitir o acesso aos
                exercícios</strong> e para acompanhar a sua evolução de aprendizado dentro da
                plataforma. <strong>Não temos qualquer objetivo financeiro ou comercial com os seus
                dados.</strong> Não vendemos, alugamos, comercializamos ou compartilhamos suas
                informações pessoais com terceiros para fins de marketing, publicidade ou lucro.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                2. Dados que coletamos
              </h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Dados de cadastro:</strong> nome completo, e-mail e senha (a senha é
                  armazenada de forma criptografada e nunca é visível para nós).
                </li>
                <li>
                  <strong>Dados de progresso:</strong> exercícios concluídos, pontos de experiência
                  (XP), número de tentativas e o código que você escreve ao resolver os desafios.
                </li>
                <li>
                  <strong>Dados de perfil (opcionais):</strong> avatar, descrição, e os seus
                  endereços do <strong>GitHub</strong> e do <strong>LinkedIn</strong>.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                3. GitHub e LinkedIn
              </h2>
              <p>
                Os links do seu <strong>GitHub</strong> e <strong>LinkedIn</strong> são totalmente
                opcionais e ficam salvos com um único propósito: <strong>exibi-los no seu perfil
                dentro da plataforma</strong>, para que outras pessoas da comunidade possam conhecer
                o seu trabalho. Não acessamos esses serviços em seu nome, não coletamos dados a
                partir deles e você pode removê-los a qualquer momento editando o seu perfil.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                4. Como usamos os seus dados
              </h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>Autenticar o seu acesso e manter a sua conta segura.</li>
                <li>Liberar e exibir os exercícios e o seu progresso de aprendizado.</li>
                <li>Calcular pontos de experiência (XP), conquistas e posições no ranking.</li>
                <li>
                  Enviar o código que você escreve para análise por inteligência artificial, com o
                  objetivo de gerar feedback educativo sobre as suas soluções.
                </li>
                <li>Exibir as informações que você optar por tornar públicas no seu perfil.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                5. Feedback por inteligência artificial
              </h2>
              <p>
                Ao solicitar uma revisão automática, o código do exercício é enviado a um serviço de
                inteligência artificial apenas para gerar o feedback educativo. Esse processamento
                ocorre exclusivamente para fins de aprendizado e não é utilizado para nenhuma
                finalidade comercial.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                6. Armazenamento e segurança
              </h2>
              <p>
                Adotamos medidas técnicas e organizacionais para proteger os seus dados contra acesso
                não autorizado, perda ou divulgação indevida. As senhas são armazenadas de forma
                criptografada. Mantemos os seus dados apenas pelo tempo necessário para a prestação
                do serviço.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                7. Os seus direitos
              </h2>
              <p>
                Conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você pode, a
                qualquer momento, acessar, corrigir, atualizar ou solicitar a exclusão dos seus
                dados pessoais. A maior parte dessas ações pode ser feita diretamente na página do
                seu perfil; para solicitações adicionais, basta entrar em contato conosco.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                8. Alterações nesta política
              </h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Sempre que houver
                mudanças relevantes, a data de &ldquo;Última atualização&rdquo; no topo desta página
                será revisada.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                9. Contato
              </h2>
              <p>
                Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus
                dados, entre em contato pelo canal de{" "}
                <Link href="/feedback" className="font-medium text-[#9d4edd] underline">
                  feedback
                </Link>{" "}
                da plataforma ou pelo e-mail: suportedevquest@gmail.com
              </p>
            </section>
          </div>

          <footer className="mt-10 border-t border-[#9d4edd]/20 pt-6">
            <Link href="/" className="text-sm font-medium text-[#9d4edd] underline">
              ← Voltar para o início
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
