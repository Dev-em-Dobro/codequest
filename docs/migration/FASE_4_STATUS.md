# Fase 4 - Autenticacao e sessao

## Objetivo da fase
Manter o fluxo de autenticacao no stack Next.js sem alterar a experiencia principal do usuario.

## Status
Concluida.

## Entrega atual
- AuthProvider criado no frontend Next com estado de sessao, bootstrap por localStorage e sincronizacao com /api/auth/session.
- Paginas reais de autenticacao implementadas: /auth/signin, /auth/signup, /auth/profile e /auth/forgot-password.
- Fluxos de sign-in, sign-up, sign-out e validacao de email conectados aos endpoints da API Next.
- Middleware Next adicionado para protecao de /auth/profile e /admin/* com redirecionamento para /auth/signin.
- Sessao em cookie httpOnly adicionada no backend Next (sign-in/sign-up) e removida no sign-out.
- Helper server-side de autenticacao atualizado para aceitar Authorization Bearer e fallback por cookie.

## Arquivos principais
- next-app/src/lib/auth-client.tsx
- next-app/src/hooks/use-auth.ts
- next-app/src/app/providers.tsx
- next-app/src/app/auth/signin/page.tsx
- next-app/src/app/auth/signup/page.tsx
- next-app/src/app/auth/profile/page.tsx
- next-app/src/app/auth/forgot-password/page.tsx
- next-app/src/proxy.ts
- next-app/src/lib/server/auth.ts
- next-app/src/app/api/auth/sign-in/route.ts
- next-app/src/app/api/auth/sign-up/route.ts
- next-app/src/app/api/auth/sign-out/route.ts
- next-app/src/app/api/auth/session/route.ts

## Proximo passo da fase
Iniciar Fase 5 com consolidacao de regras de negocio compartilhadas e reaproveitamento de validacoes entre frontend e backend.
