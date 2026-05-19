# Fase 3 - Migracao da camada de API

## Objetivo da fase
Migrar a camada de API para Next.js sem alterar os contratos atuais consumidos pelo frontend.

## Status
Concluida.

## Entrega atual
- Estrutura de Route Handlers criada em next-app/src/app/api com rotas explicitas por endpoint.
- Endpoints principais montados: auth, user, exercises, progress, code save, complete, ranking, feedback, admin e IA.
- Storage migrado para dentro do Next em src/lib/server/storage.ts.
- Tipos de dominio internos criados em src/lib/server/storage-types.ts.
- Camada local de validacao e servico temporario de IA criada para manter compatibilidade dos contratos.
- Api client reutilizavel criado para consumo de /api no frontend Next.

## Arquivos principais
- next-app/src/app/api/**/route.ts
- next-app/src/app/api/route.ts
- next-app/src/lib/server/storage.ts
- next-app/src/lib/server/storage-types.ts
- next-app/src/lib/server/validation-engine.ts
- next-app/src/lib/server/ai-service.ts
- next-app/src/lib/api-client.ts

## Proximo passo da fase
Iniciar a substituicao das telas shell da Fase 2 por componentes reais consumindo os endpoints nativos do Next.
