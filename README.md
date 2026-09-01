# production-erp-web

Frontend do ERP de manufatura — painel administrativo em **React + Vite +
TypeScript**, consumindo a API do
[`production-erp-api`](https://github.com/hlima-dev/production-erp-api)
(Java/Spring Boot).

> Projeto de portfólio/estudo, companion do backend acima — não é (e não
> pretende ser) um sistema pronto pra produção numa empresa real. A NF-e
> emitida pelo módulo fiscal é **simulada** — ver aviso na própria tela e
> no README do backend.

## Stack

- **React 19 + Vite + TypeScript**
- **React Router v7**, com as ~20 telas do painel carregadas por rota via
  `React.lazy` (só Login e o Painel inicial entram no bundle principal)
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
 ├── hooks/       # TanStack Query (useQuery/useMutation) por módulo
 ├── routes/      # PrivateRoute (exige sessão) / AdminRoute (exige role ADMIN)
 ├── layouts/     # AppLayout (sidebar + navbar)
 ├── components/  # DataTable, StatusBadge, Modal, ConfirmDialog (reuso entre módulos)
 ├── pages/       # telas, organizadas por módulo do backend
 └── types/       # tipos compartilhados (espelham os DTOs do backend)
```

Padrão por tela: `service/*.ts` (chamada HTTP tipada) → `hooks/*.ts`
(`useQuery`/`useMutation`, invalidando o cache certo em cada mutação) →
`pages/*` (lista com `DataTable` + criar/editar via modal ou página
dedicada quando o form tem itens dinâmicos, como pedido e ficha técnica).

**Autenticação**: `POST /auth/login` devolve `accessToken` (15min) +
`refreshToken` (7d), guardados no `localStorage`. Um 401 numa rota
protegida dispara uma tentativa de renovação via `/auth/refresh` antes de
redirecionar pro login, com dedupe de chamadas concorrentes — ver
`src/services/api.ts`.

## Deploy (Vercel)

1. No [Vercel](https://vercel.com), **Add New** → **Project** → importe
   este repositório. Ele detecta Vite automaticamente (`npm run build`,
   saída em `dist/`) — não precisa mexer em build settings.
2. Em **Environment Variables**, adicione `VITE_API_URL` com a URL do
   backend já publicado no Render (ex: `https://erp-producao-api.onrender.com`,
   sem barra no final).
3. Deploy. `vercel.json` já inclui o rewrite pra SPA (todas as rotas caem
   em `index.html` — sem ele, um refresh em `/pedidos/123` daria 404).
4. Volte no Render e atualize `CORS_ALLOWED_ORIGINS` do backend com a URL
   que a Vercel gerou — ver o README do
   [`production-erp-api`](https://github.com/hlima-dev/production-erp-api).

Trocar `VITE_API_URL` depois do deploy exige um **redeploy** (é uma env
var de build, embutida no bundle estático — não lida em runtime).

## Módulos

| Módulo | Telas |
|---|---|
| **catalog** | Produtos (CRUD + desativar), ficha técnica (editor dinâmico de insumos no detalhe do produto acabado) |
| **inventory** | Almoxarifados, Estoque (saldo + lançamento manual de movimento) |
| **sales** | Clientes (CRUD), Pedidos (criar/editar com itens dinâmicos, detalhe com ações por status) |
| **production** | Ordens de produção (criar, detalhe com preview dos insumos necessários e ações iniciar/concluir/cancelar) |
| **fiscal** | Notas fiscais (emissão contextual a partir de um pedido, detalhe com impostos discriminados, cancelar) |
| **logistics** | Veículos, Motoristas, Romaneios (criar agrupando pedidos faturados, iniciar/concluir rota) |

### O pedido como "hub"

A tela de detalhe do pedido (`/pedidos/:id`) amarra visualmente os quatro
módulos de negócio: mostra os botões de ação válidos pro status atual
(confirmar → iniciar separação → **emitir NF-e** → aguarda romaneio →
marcar entregue), e os links pra nota fiscal emitida e pro romaneio de
expedição assim que existirem — sem endpoint dedicado "nota/romaneio por
pedido" no backend, a página busca as listas (já em cache na maioria das
navegações) e acha o registro do pedido em memória.

Isso reproduz o ciclo completo do backend: `RASCUNHO → CONFIRMADO →
EM_SEPARACAO → FATURADO → EXPEDIDO → ENTREGUE`, verificado ponta a ponta
pelo próprio painel (não só via API) na etapa de revisão final.

## Testes

```bash
npm run test
```

Cobertura de amostra sobre os componentes reutilizados por todos os
módulos (`StatusBadge`, `DataTable`) e a tela de login (validação de
formulário e chamada do serviço de autenticação). A cobertura funcional
de verdade do fluxo de negócio — criar produto, ficha técnica, pedido,
ordem de produção, NF-e, romaneio, e o ciclo completo do pedido entre os
5 módulos — foi verificada manualmente via Playwright contra o backend
real (Postgres + Spring Boot rodando local) durante o desenvolvimento de
cada módulo, sem erros de console em nenhum passo.

## Decisões conscientes

- **Sem tela de "emitir NF-e" avulsa**: emissão é sempre contextual a um
  pedido em separação — o botão fica na própria tela do pedido.
- **Vehicles/Drivers sem edição**: o backend só expõe criar e desativar
  pra esses dois cadastros (sem `PUT`), então o frontend não inventa uma
  tela de editar que a API não suporta.
- **Filtro de status sincronizado com a URL** só na lista de pedidos
  (`/pedidos?status=...`) — é o único filtro linkado a partir de outra
  tela (o painel inicial); os demais (produção, notas, romaneios) ficam
  como estado local, mais simples e suficiente por enquanto.
