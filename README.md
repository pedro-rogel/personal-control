# Personal Control Next

Monólito modular em Next.js. O frontend usa TanStack Query para chamar as rotas do próprio aplicativo. O backend usa Drizzle e PostgreSQL; autenticação e sessões são gerenciadas pelo Better Auth no mesmo banco.

## Desenvolvimento local

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`. Gere um segredo com pelo menos 32 caracteres aleatórios. O arquivo `.env` é ignorado pelo Git.
3. Crie o banco PostgreSQL indicado em `DATABASE_URL` e execute `npx drizzle-kit migrate --config=drizzle.local.config.ts`.
4. Inicie com `npm run dev`. A URL padrão é `http://localhost:3000`.
5. Confira `npm run typecheck`, `npm test` e `npm run build`.

As migrations locais ficam em `drizzle/local-migrations/`. Os arquivos em `drizzle/migrations/` são uma cópia histórica do projeto Supabase e não devem ser aplicados ao banco local.

## Autenticação e dados

O cadastro e o login usam e-mail e senha. O usuário pode alterar sua senha em **Conta e backup** depois de entrar. Login com Google e recuperação de senha por e-mail exigem configuração externa e não estão disponíveis nesta versão local.

As rotas em `src/app/api/records/` exigem uma sessão válida, atribuem `owner_id` no servidor e filtram leituras, alterações e exclusões pelo usuário autenticado. Ao vincular uma aula, avaliação ou transação a um aluno, o backend confere se o aluno pertence ao mesmo usuário. A URL do PostgreSQL nunca é enviada ao navegador.

Contas e dados existentes no Supabase não são migrados automaticamente. Crie uma conta local e use **Conta e backup** para importar um arquivo exportado da aplicação anterior. A importação adiciona registros e pode ficar parcial se houver falha no meio do processo.
