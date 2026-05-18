# Fase 0 - Baseline e Inventario

## Escopo da Fase
Documentar o estado atual da aplicacao para garantir paridade funcional durante a migracao para Next.js.

## Rotas de Pagina Atuais (Frontend)
Fonte principal: client/src/App.tsx

- /
- /categories
- /exercise/:id
- /exercises/:category
- /ranking
- /auth/signin
- /auth/signup
- /auth/forgot-password
- /auth/profile
- /exercise
- /feedback
- /admin/add-exercise
- fallback: not-found

## Endpoints API Atuais (Backend Express)
Fonte principal: server/routes.ts

### Health
- GET /api/health

### Autenticacao e Sessao
- POST /api/auth/validate-email
- POST /api/auth/sign-in
- POST /api/auth/sign-up
- POST /api/auth/sign-out
- GET /api/auth/session
- POST /api/auth/update-user
- GET /api/user

### Feedback
- POST /api/feedbacks

### Exercicios
- GET /api/exercises
- GET /api/exercises/:id
- POST /api/exercises/:id/validate
- POST /api/exercises/:id/complete

### Progresso e Codigo
- GET /api/progress
- GET /api/progress/:exerciseId
- POST /api/code/save

### Ranking
- GET /api/users/ranking

### IA
- POST /api/exercises/:id/ai-review
- POST /api/exercises/:id/ai-hint

### Admin
- DELETE /api/admin/exercises/:id
- POST /api/admin/exercises

## Middleware e Comportamentos Globais
Fonte principal: server/index.ts e server/routes.ts

- express.json() e express.urlencoded()
- trust proxy habilitado
- logging de requisicoes /api no servidor
- rate limit global em /api/*
- rate limits especificos:
  - authLimiter
  - emailValidationLimiter
  - aiLimiter
  - adminLimiter
- autenticacao baseada em Authorization: Bearer <sessionId>
- sessao persistida no frontend em localStorage:
  - codequest_user
  - codequest_session_id

## Dependencias Criticas no Estado Atual
- Frontend: React + Vite + Wouter + React Query
- Backend: Express + Node + Zod + storage atual
- Observabilidade: Sentry (frontend e backend)

## Criterio de Conclusao da Fase 0
- Inventario de rotas e endpoints concluido
- Checklist de regressao definido
- Plano de migracao validado no repositorio
