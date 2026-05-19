# Fase 6 - Ajustes de frontend e performance

## Objetivo da fase
Conectar as telas Next aos endpoints nativos mantendo comportamento funcional e cache consistente no frontend.

## Status
Em andamento.

## Entrega desta etapa
- Pagina /ranking conectada aos endpoints /api/users/ranking e /api/exercises com React Query.
- Pagina /categories conectada aos endpoints /api/exercises e /api/progress com estatisticas por categoria.
- Fallbacks de loading/erro adicionados nas duas paginas.
- Build e lint validados apos a integracao.

## Arquivos alterados nesta etapa
- next-app/src/app/ranking/page.tsx
- next-app/src/app/categories/page.tsx

## Proximos passos imediatos
- Substituir shells restantes: /exercise, /exercise/[id], /exercises/[category], /feedback e /admin/add-exercise.
- Reaproveitar componentes existentes do client com adaptacao de roteamento para App Router.
