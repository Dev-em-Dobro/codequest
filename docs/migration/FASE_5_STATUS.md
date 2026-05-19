# Fase 5 - Integracao de dados e regras de negocio

## Objetivo da fase
Preservar regras existentes e reduzir retrabalho de manutencao com modulos compartilhados no backend Next.

## Status
Concluida.

## Entrega atual
- Regra de pontos e nivel de usuario centralizada em modulo compartilhado server-side.
- Contrato publico de usuario centralizado para evitar divergencia entre endpoints de autenticacao.
- Endpoints de auth (sign-in, sign-up, session e update-user) migrados para usar o mesmo mapper de dominio.
- Tipos de dominio e storage local do Next mantidos como fonte unica para compatibilidade da camada de dados.
- Build e lint validados apos refatoracao.

## Arquivos principais
- next-app/src/lib/server/user-contract.ts
- next-app/src/app/api/auth/sign-in/route.ts
- next-app/src/app/api/auth/sign-up/route.ts
- next-app/src/app/api/auth/session/route.ts
- next-app/src/app/api/auth/update-user/route.ts

## Proximo passo da fase
Iniciar Fase 6 conectando as rotas shell restantes a componentes reais e consolidando comportamento de loading/cache no frontend Next.
