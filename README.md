# production-erp-web

Frontend do ERP de manufatura — painel administrativo em **React + Vite +
TypeScript**, consumindo a API do
[`production-erp-api`](https://github.com/hlima-dev/production-erp-api)
(Java/Spring Boot).

> Projeto de portfólio/estudo, companion do backend acima — não é (e não
> pretende ser) um sistema pronto pra produção numa empresa real.

## Stack

- **React 19 + Vite + TypeScript**
- **React Router v7**
- **TanStack Query v5** (cache/estado de servidor)
- **Axios** (cliente HTTP, autenticação JWT via Bearer token)
- **React Hook Form + Zod** (formulários e validação)
- **Tailwind CSS** + **lucide-react**
- **Vitest + Testing Library**

## Como rodar

1. Suba o backend ([`production-erp-api`](https://github.com/hlima-dev/production-erp-api))
   local (`docker compose up -d && mvn spring-boot:run`), rodando em
   `http://localhost:8080`.
2. Copie `.env.example` pra `.env` (o default já aponta pro backend
   local).
3. `npm install`
4. `npm run dev` — abre em `http://localhost:5173`.

Login inicial (seedado pela migration do backend): `admin@erp.com.br` /
`Admin@123`.

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção (com type-check via tsc)
npm run lint     # ESLint
npm run test     # Vitest
```

## Arquitetura

```
src/
 ├── services/    # cliente axios + chamadas HTTP tipadas por módulo
 ├── routes/      # PrivateRoute (exige sessão) / AdminRoute (exige role ADMIN)
 ├── layouts/     # AppLayout (sidebar + navbar)
 ├── pages/       # telas, organizadas por módulo do backend
 └── types/       # tipos compartilhados (espelham os DTOs do backend)
```

Autenticação: `POST /auth/login` devolve `accessToken` (15min) +
`refreshToken` (7d), guardados no `localStorage`. Um 401 numa rota
protegida dispara uma tentativa de renovação via `/auth/refresh` antes de
redirecionar pro login — ver `src/services/api.ts`.

Módulos do backend refletidos na navegação (adicionados conforme
implementados): catalog (produtos/ficha técnica), inventory (estoque),
sales (clientes/pedidos), production (ordens de produção), fiscal (NF-e
simulada), logistics (veículos/motoristas/romaneios).
