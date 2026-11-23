# Personal Control Next

Versão Next.js do Personal Control. As páginas autenticadas seguem o fluxo de sessão no navegador e usam Supabase com RLS e TanStack Query.

## Desenvolvimento

1. Copie `.env.example` para `.env.local` e preencha a URL e a chave publicável do mesmo projeto Supabase.
2. Execute `npm install` e `npm run dev`.
3. Verifique `npm run typecheck`, `npm test` e `npm run build`.

A chave de serviço não é usada pelo aplicativo. As tabelas e políticas RLS continuam administradas pelo projeto Supabase existente. OAuth do Google exige que a URL deste novo app conste entre as URLs de redirecionamento permitidas no Supabase.

Rotas públicas: `/`, `/auth`, `/reset-password`. Rotas privadas: `/painel`, `/alunos`, `/alunos/[id]`, `/aulas`, `/avaliacoes`, `/financeiro`, `/relatorios`, `/conta`.

## Migrations do projeto original

`drizzle/migrations/` contém as duas migrations SQL e os snapshots copiados sem alterações do projeto original. `drizzle/schema.ts` e `drizzle.config.ts` também foram copiados para preservar o contexto. O Next.js não executa esses arquivos automaticamente. A migration inicial cria tabelas; confira o histórico do banco antes de aplicá-la a um banco que já esteja em uso.
