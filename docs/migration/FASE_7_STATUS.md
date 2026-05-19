# Fase 7 - Homologacao funcional

## Objetivo da fase
Garantir que os fluxos principais da aplicacao migrada em Next.js funcionem com paridade funcional em relacao ao legado.

## Status
Concluida.

## Entrega desta etapa
- Criado smoke test automatizado da Fase 7 em scripts/phase7-smoke.ps1.
- Smoke test executado com sucesso (FAILURES=0) contra ambiente local em modo producao.
- Checklist de regressao atualizado com itens validados automaticamente.
- Fluxos autenticados validados via Bearer token (modelo hibrido suportado pelo backend).
- Cobertura de profile/admin autenticados validada via cookie de sessao (header Cookie) para exercitar protecao por proxy.
- Rate limit validado com cenario dedicado (status 429 esperado).
- Resposta 500 controlada validada com endpoint de telemetria.
- Captura de eventos Sentry validada para origem backend e frontend.

## Evidencias tecnicas
- Comando de execucao: .\scripts\phase7-smoke.ps1
- Cobertura principal validada:
  - Navegacao: home, categories, ranking, exercise, exercise/[id], exercises/[category], feedback.
  - Auth API: sign-up, sign-in valido/invalido, /api/user, sign-out.
  - Exercicios: listar, buscar por id, validar, salvar codigo, completar exercicio.
  - IA: ai-hint e ai-review.
  - Admin API: criar e excluir exercicio com usuario autenticado.
  - Erros esperados: 401 para rotas protegidas sem autenticacao e 404 para rota inexistente.
  - Erro 500 controlado: validado em /api/telemetry/sentry-test.
  - Rate limit: validado com 429 em /api/auth/sign-in.
  - Sentry: eventos backend/frontend validados via /api/telemetry/sentry-test.

## Observacoes importantes
- Em modo producao local com HTTP, o cookie de sessao e marcado como secure.
- Para homologacao local automatizada, os fluxos autenticados foram validados por Authorization Bearer, que tambem e suportado oficialmente pelas rotas.

## Pendencias para concluir a fase
Nenhuma pendencia aberta no checklist de regressao funcional.

## Proximos passos imediatos
- Iniciar Fase 8 (go-live e desativacao do legado).
- Executar limpeza dos arquivos legados de Vite/Express com validacao final de build/start do Next.
