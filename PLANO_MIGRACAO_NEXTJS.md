# Plano de Migracao por Fases: React + Express para Next.js

## Objetivo
Migrar a aplicacao atual para Next.js mantendo o comportamento, as telas, os fluxos e os contratos de API exatamente como estao hoje.

## Escopo
- Preservar layout, rotas, autenticacao e regras de negocio atuais.
- Migrar frontend e backend para estrutura Next.js.
- Evitar mudancas de produto durante a migracao.

## Principio de execucao
Paridade funcional: cada fase so avanca quando a nova implementacao estiver equivalente ao comportamento atual.

## Fase 0 - Preparacao e baseline
## Objetivo
Criar uma base de comparacao para garantir que o resultado final continue igual ao sistema atual.

## Atividades
- Congelar novas features durante a migracao.
- Listar todas as rotas de pagina e endpoints API existentes.
- Registrar fluxos criticos para validacao: login, cadastro, sessao, exercicios, progresso, ranking, feedback e admin.
- Definir checklist de validacao funcional por tela e endpoint.

## Entregaveis
- Inventario oficial de rotas e endpoints.
- Checklist de regressao funcional.

## Fase 1 - Estrutura inicial Next.js
## Objetivo
Subir a nova base Next.js sem quebrar o projeto atual.

## Atividades
- Criar estrutura Next.js no repositorio.
- Configurar TypeScript, Tailwind, aliases e providers globais.
- Configurar React Query e Sentry na nova base.
- Preparar layout raiz e shell da aplicacao.

## Entregaveis
- App Next.js inicial rodando localmente.
- Build de desenvolvimento funcionando.

## Fase 2 - Migracao de rotas de pagina
## Objetivo
Migrar o roteamento do frontend para App Router mantendo as mesmas URLs atuais.

## Atividades
- Mapear cada rota atual para pasta/arquivo em app/.
- Migrar paginas publicas e autenticadas mantendo componentes atuais.
- Garantir navegacao e fallback 404 equivalentes.

## Entregaveis
- Todas as paginas existentes acessiveis nas mesmas rotas.
- Validacao visual e funcional basica concluida.

## Fase 3 - Migracao da camada de API
## Objetivo
Substituir Express por Route Handlers do Next mantendo os mesmos contratos.

## Atividades
- Migrar endpoints /api/auth/*.
- Migrar endpoints /api/exercises, /api/progress, /api/code/save, /api/user, /api/users/ranking.
- Migrar endpoints de IA e administrativos.
- Reaplicar validacoes, limites de requisicao e tratamento de erros.

## Entregaveis
- API em Next com mesmas rotas, payloads e respostas.
- Teste de paridade dos endpoints principais aprovado.

## Fase 4 - Autenticacao e sessao
## Objetivo
Manter o fluxo atual de autenticacao no novo stack, sem alterar experiencia do usuario.

## Atividades
- Migrar fluxo de sign-in, sign-up, sign-out e recuperacao de sessao.
- Adaptar middleware de autenticacao para ambiente Next.
- Garantir funcionamento de rotas protegidas e operacoes admin.

## Entregaveis
- Fluxo completo de autenticacao funcionando igual ao atual.
- Permissoes e protecoes equivalentes.

## Fase 5 - Integracao de dados e regras de negocio
## Objetivo
Preservar regras existentes e reduzir retrabalho de manutencao.

## Atividades
- Extrair servicos e regras para modulos compartilhados.
- Reaproveitar schemas/validacoes existentes.
- Garantir compatibilidade com camada de storage atual.

## Entregaveis
- Regras de negocio centralizadas e reutilizaveis.
- Funcionalidades criticas de exercicios e progresso equivalentes.

## Fase 6 - Ajustes de frontend e performance
## Objetivo
Concluir o frontend no Next sem mudar experiencia do usuario.

## Atividades
- Ajustar chamadas de API no frontend para o novo runtime.
- Revisar comportamento de loading, cache e atualizacao de dados.
- Validar responsividade e comportamento em mobile/desktop.

## Entregaveis
- Frontend com comportamento equivalente ao sistema atual.
- Navegacao e estados de tela validados.

## Fase 7 - Homologacao funcional
## Objetivo
Garantir que tudo que existe hoje funcione igual na nova versao.

## Atividades
- Executar checklist completo de regressao.
- Validar fluxos ponta a ponta com usuarios internos.
- Corrigir divergencias de comportamento encontradas.

## Entregaveis
- Homologacao aprovada.
- Lista final de ajustes concluida.

## Fase 8 - Go-live e desativacao do legado
## Objetivo
Publicar a versao Next.js e retirar a stack antiga com seguranca.

## Atividades
- Publicar em ambiente de producao.
- Monitorar operacao apos deploy.
- Encerrar pipeline e scripts da stack antiga apos estabilizacao.

## Entregaveis
- Aplicacao operando em Next.js.
- Legado React + Express desativado.

## Cronograma sugerido
- Semana 1: Fases 0, 1 e 2.
- Semana 2: Fases 3 e 4.
- Semana 3: Fases 5 e 6.
- Semana 4: Fases 7 e 8.

## Definicao de pronto por fase
- Todas as rotas da fase respondendo corretamente.
- Fluxos da fase validados no checklist.
- Sem regressao funcional nas funcionalidades ja migradas.
