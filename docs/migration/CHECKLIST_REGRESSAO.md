# Checklist de Regressao Funcional

Use este checklist a cada fase para validar paridade funcional da aplicacao.

## 1) Autenticacao
- [ ] Login com credenciais validas
- [ ] Login com credenciais invalidas
- [ ] Cadastro de usuario
- [ ] Validacao de email no cadastro
- [ ] Persistencia de sessao apos refresh
- [ ] Logout e limpeza de sessao
- [ ] Carregamento de sessao em /api/user

## 2) Navegacao e Paginas
- [ ] Home (/)
- [ ] Categories (/categories)
- [ ] Lista de exercicios por categoria (/exercises/:category)
- [ ] Detalhe do exercicio (/exercise/:id)
- [ ] Exercicio simples (/exercise)
- [ ] Ranking (/ranking)
- [ ] Feedback (/feedback)
- [ ] Profile (/auth/profile)
- [ ] Signup (/auth/signup)
- [ ] Signin (/auth/signin)
- [ ] Forgot password (/auth/forgot-password)
- [ ] Admin add exercise (/admin/add-exercise)
- [ ] Fallback de pagina inexistente

## 3) Exercicios e Progresso
- [ ] Buscar lista de exercicios
- [ ] Buscar exercicio por ID
- [ ] Salvar codigo (/api/code/save)
- [ ] Buscar progresso geral (/api/progress)
- [ ] Buscar progresso por exercicio (/api/progress/:exerciseId)
- [ ] Validar exercicio (/api/exercises/:id/validate)
- [ ] Completar exercicio (/api/exercises/:id/complete)

## 4) Ranking e Feedback
- [ ] Ranking de usuarios (/api/users/ranking)
- [ ] Envio de feedback autenticado (/api/feedbacks)

## 5) IA
- [ ] Revisao de codigo IA (/api/exercises/:id/ai-review)
- [ ] Dica IA (/api/exercises/:id/ai-hint)

## 6) Admin
- [ ] Criar exercicio admin (/api/admin/exercises)
- [ ] Excluir exercicio admin (/api/admin/exercises/:id)

## 7) Nao Funcional
- [ ] Rate limit ativo nas rotas correspondentes
- [ ] Erros 401/404/500 com resposta esperada
- [ ] Sentry recebendo eventos (frontend e backend)
- [ ] Build e start locais funcionando
