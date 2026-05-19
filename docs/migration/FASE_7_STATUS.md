# Fase 7 - Homologacao funcional

## Objetivo da fase
Garantir que os fluxos principais da aplicacao migrada em Next.js funcionem com paridade funcional em relacao ao legado.

## Status
Em andamento.

## Entrega desta etapa
- Criado smoke test automatizado da Fase 7 em scripts/phase7-smoke.ps1.
- Smoke test executado com sucesso (FAILURES=0) contra ambiente local em modo producao.
- Checklist de regressao atualizado com itens validados automaticamente.
- Fluxos autenticados validados via Bearer token (modelo hibrido suportado pelo backend).

## Evidencias tecnicas
- Comando de execucao: .\scripts\phase7-smoke.ps1
- Cobertura principal validada:
  - Navegacao: home, categories, ranking, exercise, exercise/[id], exercises/[category], feedback.
  - Auth API: sign-up, sign-in valido/invalido, /api/user, sign-out.
  - Exercicios: listar, buscar por id, validar, salvar codigo, completar exercicio.
  - IA: ai-hint e ai-review.
  - Admin API: criar e excluir exercicio com usuario autenticado.
  - Erros esperados: 401 para rotas protegidas sem autenticacao e 404 para rota inexistente.

## Observacoes importantes
- Em modo producao local com HTTP, o cookie de sessao e marcado como secure.
- Para homologacao local automatizada, os fluxos autenticados foram validados por Authorization Bearer, que tambem e suportado oficialmente pelas rotas.

## Pendencias para concluir a fase
- Validar item "Validacao de email no cadastro" com cenario controlado do webhook de validacao.
- Validar acesso autenticado direto da pagina /auth/profile via browser (fluxo completo de UI).
- Validar acesso autenticado direto da pagina /admin/add-exercise via browser (fluxo completo de UI).
- Executar verificacao dedicada de rate limit por rota sensivel.
- Executar verificacao dedicada de respostas 500 controladas (cenario de falha induzida).
- Confirmar captura de eventos no Sentry (frontend e backend).

## Proximos passos imediatos
- Rodar bloco manual assistido para os itens pendentes do checklist.
- Fechar pendencias de observabilidade e resiliencia.
- Atualizar status para concluida apos cobertura total da checklist.
