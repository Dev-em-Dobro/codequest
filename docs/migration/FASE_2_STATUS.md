# Fase 2 - Migracao de rotas de pagina

## Objetivo da fase
Migrar o roteamento de paginas para App Router mantendo as mesmas URLs da aplicacao atual.

## Status
Em andamento.

## Entrega atual
- Estrutura de rotas criada no Next.js para as URLs principais da aplicacao.
- Rotas dinamicas /exercise/[id] e /exercises/[category] mapeadas.
- Pagina not-found criada para fallback.
- Shell padrao de pagina criado para acelerar a conexao funcional nas proximas etapas.

## Rotas mapeadas nesta etapa
- /
- /categories
- /exercise
- /exercise/[id]
- /exercises/[category]
- /ranking
- /feedback
- /auth/signin
- /auth/signup
- /auth/forgot-password
- /auth/profile
- /admin/add-exercise

## Proximo passo da fase
Conectar cada rota aos componentes existentes para manter comportamento funcional equivalente.
