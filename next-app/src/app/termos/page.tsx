import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Termos de Serviço · CodeQuest",
  description:
    "Termos e condições de uso da plataforma CodeQuest. Conheça as regras de uso, direitos e responsabilidades ao utilizar a plataforma de aprendizado de programação.",
};

const lastUpdate = "19 de junho de 2026";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="fantasy-card p-6 sm:p-10">
          <header className="mb-8 border-b border-[#9d4edd]/20 pb-6">
            <h1 className="text-3xl font-bold text-[#9d4edd] [font-family:var(--font-title)]">
              Termos de Serviço
            </h1>
            <p className="mt-2 text-sm text-[#fff6e9]/70 [font-family:var(--font-inter)]">
              Última atualização: {lastUpdate}
            </p>
          </header>

          <div className="space-y-8 text-[0.95rem] leading-7 text-[#fff6e9]/90 [font-family:var(--font-inter)]">
            <section>
              <p>
                Estes Termos de Serviço regulam o uso do <strong>CodeQuest</strong> — plataforma
                gratuita de aprendizado de programação web. Ao criar uma conta e utilizar a
                plataforma, você declara que leu, compreendeu e concorda com as condições descritas
                neste documento. Caso não concorde, por favor, não utilize a plataforma.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                1. Sobre a plataforma
              </h2>
              <p>
                O CodeQuest é uma plataforma educacional que oferece exercícios de programação,
                acompanhamento de progresso, pontos de experiência (XP), conquistas e feedback por
                inteligência artificial. O serviço é oferecido <strong>gratuitamente</strong> e tem
                finalidade exclusivamente educativa, <strong>sem qualquer objetivo financeiro ou
                comercial</strong>.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                2. Cadastro e conta
              </h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Para usar a plataforma é necessário criar uma conta com nome, e-mail e senha.
                </li>
                <li>
                  Você é responsável por manter a confidencialidade da sua senha e por todas as
                  atividades realizadas na sua conta.
                </li>
                <li>
                  Você se compromete a fornecer informações verdadeiras e a mantê-las atualizadas.
                </li>
                <li>
                  É proibido criar contas em nome de terceiros ou se passar por outra pessoa.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                3. Uso aceitável
              </h2>
              <p className="mb-3">Ao utilizar o CodeQuest, você concorda em não:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Utilizar a plataforma para fins ilícitos ou que violem a legislação vigente.</li>
                <li>
                  Tentar comprometer a segurança, a integridade ou a disponibilidade da plataforma.
                </li>
                <li>
                  Inserir conteúdo ofensivo, discriminatório, difamatório ou que viole direitos de
                  terceiros nos campos de perfil ou nas soluções enviadas.
                </li>
                <li>
                  Utilizar robôs, scripts ou mecanismos automatizados para manipular pontuações,
                  ranking ou conquistas.
                </li>
                <li>Reproduzir, distribuir ou comercializar o conteúdo da plataforma sem autorização.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                4. Conteúdo que você cria
              </h2>
              <p>
                O código e as soluções que você escreve ao resolver os exercícios permanecem seus.
                Ao enviá-los, você autoriza o CodeQuest a processá-los para registrar o seu
                progresso e, quando solicitado, encaminhá-los a um serviço de inteligência artificial
                para gerar feedback educativo. Esse processamento ocorre exclusivamente para fins de
                aprendizado, conforme descrito na nossa{" "}
                <Link href="/privacidade" className="font-medium text-[#9d4edd] underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                5. Propriedade intelectual
              </h2>
              <p>
                Os exercícios, textos, marcas, layout e demais elementos da plataforma são protegidos
                por direitos de propriedade intelectual e pertencem ao CodeQuest ou aos seus
                respectivos titulares. O acesso à plataforma não transfere a você qualquer direito
                sobre esses elementos, exceto o uso pessoal para fins de aprendizado.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                6. Feedback por inteligência artificial
              </h2>
              <p>
                O feedback gerado por inteligência artificial tem caráter educativo e pode conter
                imprecisões. Ele deve ser interpretado como uma sugestão de apoio ao aprendizado e
                não como uma verdade absoluta ou orientação profissional definitiva.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                7. Disponibilidade do serviço
              </h2>
              <p>
                Nos esforçamos para manter a plataforma disponível e funcionando corretamente, mas o
                serviço é oferecido &ldquo;no estado em que se encontra&rdquo;. Não garantimos
                disponibilidade ininterrupta e podemos, a qualquer momento, alterar, suspender ou
                descontinuar funcionalidades, sempre que possível com aviso prévio.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                8. Limitação de responsabilidade
              </h2>
              <p>
                Por se tratar de uma plataforma educacional gratuita, o CodeQuest não se
                responsabiliza por eventuais danos decorrentes do uso ou da impossibilidade de uso do
                serviço, nem pela perda de dados resultante de falhas técnicas, observadas sempre as
                garantias previstas na legislação aplicável.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                9. Encerramento da conta
              </h2>
              <p>
                Você pode solicitar a exclusão da sua conta a qualquer momento. Também podemos
                suspender ou encerrar contas que violem estes Termos de Serviço. O tratamento dos
                seus dados após o encerramento segue o disposto na nossa{" "}
                <Link href="/privacidade" className="font-medium text-[#9d4edd] underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                10. Alterações nestes termos
              </h2>
              <p>
                Podemos atualizar estes Termos de Serviço periodicamente. Sempre que houver mudanças
                relevantes, a data de &ldquo;Última atualização&rdquo; no topo desta página será
                revisada. O uso contínuo da plataforma após as alterações representa a sua
                concordância com os novos termos.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-[#9d4edd] [font-family:var(--font-title)]">
                11. Lei aplicável e contato
              </h2>
              <p>
                Estes Termos de Serviço são regidos pela legislação brasileira. Em caso de dúvidas
                sobre estes termos, entre em contato pelo canal de{" "}
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
