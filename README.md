<div align="center">

# Layer1 Frontend (Next.js App Router)

Candidate ⇄ Job intelligence UI: upload resumes & job descriptions, monitor parsing & matching progress in real time, view strengths/gaps, manage subscription status.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix%20UI-Components-161618)](https://www.radix-ui.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth-Auth0%20Provider-orange)](https://next-auth.js.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Jest](https://img.shields.io/badge/Jest-Tests-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Subscriptions-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)

</div>

## Overview

This application consumes the Layer1 Backend (`../layer1/backend`) REST + WebSocket API to:

- Upload resumes / jobs (client side form → backend queue)
- Display parsing & matching status via Socket.IO realtime events
- Present match summaries (strengths, gaps, weighted score)
- Enforce session auth (Auth0 via NextAuth) and support pro‑member feature gating
- Prepare for subscription management (Stripe client library included; webhook backend integration pending)

Architecture (simplified):

```
Browser (Next.js App Router)
	│  fetch / upload (REST)
	│  WebSocket (Socket.IO client)
	▼
Layer1 Backend (Express + Socket.IO) ──> BullMQ ──> Python Worker (NLP/Match)
```

Session tokens (Auth0) obtained through NextAuth are used for authenticated API calls; `backend-client.ts` abstracts server vs browser base URL selection.

## Project Structure Notes

| Path                             | Purpose                                                            |
| -------------------------------- | ------------------------------------------------------------------ |
| `src/app/`                       | App Router layouts, pages (`page.tsx`, `dashboard/`, `signin/`)    |
| `src/auth/`                      | NextAuth provider configuration (Auth0 audience, token enrichment) |
| `src/services/backend-client.ts` | Typed fetch + upload helpers (SSR aware)                           |
| `src/components/ui/`             | Headless/styled components (Radix + Tailwind patterns)             |
| `src/components/providers/`      | Session & realtime providers                                       |
| `src/lib/utils.ts`               | Small utility helpers (classnames, formatting)                     |
| `src/types/`                     | Shared TypeScript interfaces (API contracts, session extensions)   |

## Environment Variables

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser bundle.

| Variable                 | Scope   | Description                                                    |
| ------------------------ | ------- | -------------------------------------------------------------- |
| AUTH0_CLIENT_ID          | Server  | Auth0 app client id (used by NextAuth provider)                |
| AUTH0_CLIENT_SECRET      | Server  | Auth0 client secret                                            |
| AUTH0_ISSUER             | Server  | Auth0 issuer base URL (https://your-tenant.region.auth0.com)   |
| AUTH0_AUDIENCE           | Server  | Audience (adds custom API claim for backend)                   |
| LAYER1_API_URL           | Server  | Internal base (SSR / Edge) e.g. `http://backend:4000/api/v1`   |
| NEXT_PUBLIC_API_BASE_URL | Browser | Public base URL e.g. `https://api.example.com/api/v1`          |
| NEXTAUTH_SECRET          | Server  | NextAuth JWT/session encryption secret                         |
| NEXTAUTH_URL             | Server  | Base URL of this frontend (needed in some deployment contexts) |
| STRIPE_PUBLISHABLE_KEY   | Browser | Stripe client key (future subscription UI)                     |
| NEXT_PUBLIC_SOCKET_URL   | Browser | Optional explicit Socket.IO endpoint (fallback: API base)      |

## Local Development

1. Ensure backend + python worker running (see backend README for compose workflow).
2. Create `.env.local` with the relevant variables above. Minimum for dev with auth disabled backend:

```
AUTH0_CLIENT_ID=dev
AUTH0_CLIENT_SECRET=dev
AUTH0_ISSUER=http://localhost:4000/dev-issuer   # placeholder if backend AUTH_DISABLED=true
AUTH0_AUDIENCE=http://localhost:4000/api/v1
LAYER1_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXTAUTH_SECRET=replace_me_with_random_string
```

3. Install dependencies & start dev server:

```bash
npm install
npm run dev
```

4. Visit http://localhost:3000

### Realtime Provider

`src/components/providers/realtime-provider.tsx` (not shown here) should establish a Socket.IO connection, joining the user room implicitly when authenticated. Ensure token passes in `auth: { token }` during connection when backend auth is enabled.

### Testing

Run all tests (Jest + Testing Library):

```bash
npm test
```

Add focused tests under `src/test/unit/` following existing patterns. For components using NextAuth session, wrap with a mocked `SessionProvider`.

### Linting & Type Checking

```bash
npm run lint
tsc --noEmit
```

## Production Build

```bash
npm run build
npm start   # serves .next/ on port 3000
```

## Deployment Considerations

| Concern       | Notes                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| CORS          | Prefer server-side `LAYER1_API_URL` for SSR to avoid extra preflights; browser hits `NEXT_PUBLIC_API_BASE_URL` |
| Auth          | Ensure Auth0 allowed callback/logouts include this frontend base URL                                           |
| Realtime      | If behind a proxy (NGINX/Vercel), confirm WebSocket upgrade is allowed                                         |
| Env Injection | Use platform secrets manager (Vercel / Azure / Docker swarm) for non-public vars                               |
| Cache         | Most fetches are `no-store` to ensure fresh status polling; adjust selectively if needed                       |

## Match Flow (UI Perspective)

1. User uploads resume/job → POST handled by backend → returns queued id
2. UI subscribes to realtime events; shows spinner/status chips
3. Upon `completed`, fetches parsed entities
4. User triggers match: UI shows pending state until summary arrives
5. Summary displayed: strengths, gaps, overall score, and gating (e.g., limit messaging if free tier)

## Roadmap (Frontend Focus)

- Add dashboard visualizations (Recharts) for usage & match distribution
- Integrate Stripe billing portal + plan upgrade CTA
- Implement optimistic UI for queued jobs
- Add accessibility audit (axe + CI rule)
- Add e2e tests (Playwright) for core flows

---

## Original Create-Next-App README (Preserved)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

You can still deploy via the [Vercel Platform](https://vercel.com/) or any container/Node host. Key steps:

1. Set production env vars (Auth0 + API bases + NEXTAUTH_SECRET).
2. Ensure backend API origin is reachable from Vercel edge.
3. If using custom Socket.IO domain, set `NEXT_PUBLIC_SOCKET_URL`.
4. Add `NEXTAUTH_URL=https://your-frontend-domain`.

For self-hosting (Docker multi-stage example outline):

```Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["npm","start"]
```

---

_Frontend README enhanced 2025-10-02: added architecture, badges, env guidance, and preserved original template._
