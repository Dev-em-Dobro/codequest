# Checklist de Regressao Funcional

Use este checklist a cada fase para validar paridade funcional da aplicacao.

## 1) Autenticacao
- [x] Login com credenciais validas
- [x] Login com credenciais invalidas
- [x] Cadastro de usuario
- [x] Validacao de email no cadastro
- [x] Persistencia de sessao apos refresh
- [x] Logout e limpeza de sessao
- [x] Carregamento de sessao em /api/user

## 2) Navegacao e Paginas
- [x] Home (/)
- [x] Categories (/categories)
- [x] Lista de exercicios por categoria (/exercises/:category)
- [x] Detalhe do exercicio (/exercise/:id)
- [x] Exercicio simples (/exercise)
- [x] Ranking (/ranking)
- [x] Feedback (/feedback)
- [x] Profile (/auth/profile)
- [x] Signup (/auth/signup)
- [x] Signin (/auth/signin)
- [x] Forgot password (/auth/forgot-password)
- [x] Admin add exercise (/admin/add-exercise)
- [x] Fallback de pagina inexistente

## 3) Exercicios e Progresso
- [x] Buscar lista de exercicios
- [x] Buscar exercicio por ID
- [x] Salvar codigo (/api/code/save)
- [x] Buscar progresso geral (/api/progress)
- [x] Buscar progresso por exercicio (/api/progress/:exerciseId)
- [x] Validar exercicio (/api/exercises/:id/validate)
- [x] Completar exercicio (/api/exercises/:id/complete)

## 4) Ranking e Feedback
- [x] Ranking de usuarios (/api/users/ranking)
- [x] Envio de feedback autenticado (/api/feedbacks)

## 5) IA
- [x] Revisao de codigo IA (/api/exercises/:id/ai-review)
- [x] Dica IA (/api/exercises/:id/ai-hint)

## 6) Admin
- [x] Criar exercicio admin (/api/admin/exercises)
- [x] Excluir exercicio admin (/api/admin/exercises/:id)

## 7) Nao Funcional
- [x] Rate limit ativo nas rotas correspondentes
- [x] Erros 401/404/500 com resposta esperada
- [x] Sentry recebendo eventos (frontend e backend)
- [x] Build e start locais funcionando
