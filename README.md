# Logfound

**Logfound is an AI-powered founder operating system.** It gives solo founders and startup teams a calm, connected place to remember why decisions were made, understand how a product has evolved, collaborate with specialist agents, and stay aligned from the first idea to the next release.

Built for Build Week, Logfound treats product work as a living system rather than a collection of disconnected tasks. Decisions, repository activity, founder context, and AI guidance are designed to be read together.

> **Project status:** the product is a polished, functional prototype with a live server-side Groq integration. Several product surfaces use realistic seeded workspace data while their persistence and third-party sync layers are prepared for production implementation.

## Features

- **Username/password authentication** — a production-safe demo Credentials flow signs HTTP-only sessions, protects workspace routes, persists sessions across refreshes, and requires no email address.
- **Founder dashboard** — a focused daily workspace with project momentum, streaks, active work, timeline activity, team discussion, focus planning, quick actions, and keyboard shortcuts.
- **Timeline** — an elegant activity feed for decisions, notes, milestones, repository changes, and AI recommendations.
- **AI agents** — five distinct server-side specialists: **Nova** for founder strategy, **Atlas** for engineering, **Echo** for founder memory, **Pulse** for market signals, and **Compass** for long-term direction. Focused requests are routed to the right agent; mixed requests use a collaborative council and synthesis.
- **Streaming AI workspace** — progressive server-sent responses expose thinking states, individual agent contributions, a shared recommendation, and a Groq health check. The browser never receives an API key.
- **Founder Intelligence** — a strategy-room experience that brings independent agent perspectives, trade-offs, risks, confidence, and a recommended action plan into one decision surface.
- **GitHub OAuth and Intelligence** — authenticated users can connect GitHub from Settings, securely select one or more repositories for the active project, and load live commits, pull requests, issues, branches, and contributors through server-only APIs. The legacy intelligence view still includes curated demo context alongside connected repository data.
- **Founder Replay** — an immersive, connected view of a decision's original problem, conversations, reasoning, commits, outcomes, and lessons.
- **Voice Workspace** — a browser speech-to-text and text-to-speech abstraction with a focused, multi-agent voice workflow. Support depends on the visitor's browser.
- **Command Center** — a keyboard-first command palette for navigation, actions, search, agent entry points, replay, and voice mode.
- **Weekly Intelligence** — seeded weekly reviews surface wins, mistakes, patterns, momentum, engineering context, and founder learnings.
- **Knowledge Graph and collaboration workspace** — interactive demo views connect projects, features, decisions, commits, conversations, feedback, lessons, and tasks. Presence, cursors, and live updates are currently simulated rather than backed by a realtime service.
- **Founder DNA** — a living founder-profile experience that frames decision speed, consistency, learning velocity, risk appetite, focus, communication style, and shipping momentum as an evolving narrative.
- **Product polish** — first-run onboarding, useful empty and error states, five premium themes, responsive layouts, reduced-motion-aware transitions, and accessible focus and keyboard interactions.

## Tech Stack

- [Next.js 15](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) in strict mode
- [Tailwind CSS](https://tailwindcss.com/), `tailwindcss-animate`, `clsx`, and `tailwind-merge`
- shadcn/ui-compatible component primitives built with [Class Variance Authority](https://cva.style/)
- [Framer Motion](https://www.framer.com/motion/) for interface motion
- [Supabase](https://supabase.com/) with `@supabase/ssr` and `@supabase/supabase-js`
- [Groq JavaScript SDK](https://github.com/groq/groq-typescript) for the active server-side runtime
- [Zod](https://zod.dev/) for API input validation
- [`next-themes`](https://github.com/pacocoursey/next-themes) for theme management
- [Lucide](https://lucide.dev/) icons
- Browser Web Speech APIs for the current voice abstraction
- [Vercel](https://vercel.com/) deployment configuration

## Project Structure

```text
src/
├── app/                         # App Router pages, global styles, route handlers
│   ├── api/ai/                  # Centralized streaming AI and health endpoints
│   ├── ai/                      # Dedicated AI Workspace route
│   ├── collaboration/           # Collaboration and knowledge graph experience
│   ├── github/                  # GitHub Intelligence experience
│   ├── intelligence/            # Founder Intelligence strategy room
│   ├── replay/                  # Founder Replay and weekly intelligence
│   ├── settings/                # Appearance, agent, voice, and privacy controls
│   └── voice/                   # Voice Workspace
├── components/
│   ├── ai/                      # Streaming AI client surface
│   ├── collaboration/           # Collaboration workspace UI
│   ├── dashboard/               # Founder dashboard
│   ├── github/                  # Repository and engineering intelligence UI
│   ├── intelligence/            # Strategy-room UI
│   ├── replay/                  # Replay experience UI
│   ├── settings/                # Settings UI
│   ├── ui/                      # Shared, shadcn/ui-compatible primitives
│   └── voice/                   # Voice Workspace UI
├── hooks/                       # Reusable client interaction hooks
└── lib/
    ├── agents/                  # UI agent registry and contracts
    ├── ai/                      # Server-only Groq client, prompts, router, memory
    ├── supabase/                # Browser, server, and middleware Supabase clients
    ├── voice/                   # Browser speech abstractions
    ├── collaboration.ts         # Seeded collaboration and graph data
    └── founder-memory.ts        # Seeded replay, review, and founder-profile data
```

The `src/lib/ai` directory contains one server-only Groq client alongside the prompts, routing, and memory abstractions. Browser components call internal application routes and never import the SDK.

## Installation

### Prerequisites

- Node.js 20.9 or later
- npm
- A Groq API key to enable live AI features
- A Supabase project with an authenticated Logfound user to enable GitHub connection storage
- A GitHub OAuth App to enable repository access

### 1. Clone and install

```bash
git clone https://github.com/STELLEN10/LogFound.git
cd LogFound
npm install
```

### 2. Create local environment configuration

```bash
# macOS/Linux
cp .env.example .env.local

# PowerShell
Copy-Item .env.example .env.local
```

Set the values described in [Environment Variables](#environment-variables). The UI can run without configuration; live AI requires `GROQ_API_KEY`.

### 3. Configure Supabase (optional for the current prototype)

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard).
2. Copy the project URL and publishable/anon key into `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for browser authentication. The server also accepts `SUPABASE_URL` and `SUPABASE_ANON_KEY` as deployment aliases.
4. Configure Supabase Auth providers and redirect URLs when adding an application sign-in flow.

The repository exposes typed browser/server Supabase clients for persistence. Apply the GitHub migrations, including `20260720_demo_auth_users.sql`, before enabling repository storage. They create encrypted-token storage, stable workspace-user identities, and project-repository links with Row Level Security enabled and no browser-role table access.

### 4. Configure demo authentication

Logfound uses a signed, HTTP-only session cookie for the demo workspace. No email address is required. In development, the default credentials are `founder` / `logfound-demo`; override them with `LOGFOUND_DEMO_USERNAME` and `LOGFOUND_DEMO_PASSWORD` in `.env.local`. For production, set `NEXTAUTH_SECRET` and prefer `LOGFOUND_DEMO_PASSWORD_HASH` with a bcrypt hash instead of a plaintext password.

Open [http://localhost:3000/login](http://localhost:3000/login) to sign in. Protected pages and API routes redirect or return `401` until a session is present. Use **Settings → Workspace session** to sign out.

### 5. Configure the Groq AI engine

Groq is active by default. Add its server-side key to `.env.local`:

```bash
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
```

Create a free Groq key in the [Groq Console](https://console.groq.com/keys), then place it only in the server-side `GROQ_API_KEY` variable. Never use a `NEXT_PUBLIC_` prefix for an AI key. Once running, open `/ai` or **Settings → Groq AI Engine** and select **Test Connection**, or request `GET /api/ai/health`, to confirm the connection without exposing the key. Logfound uses `llama-3.3-70b-versatile` as its fixed model.

### 6. Configure GitHub OAuth

1. Apply [`supabase/migrations/20260718_github_connections.sql`](supabase/migrations/20260718_github_connections.sql) to your Supabase project. For a Supabase CLI workflow, run `supabase db push` after linking the project.
2. Create an OAuth App in GitHub’s developer settings.
3. Set its **Authorization callback URL** to `http://localhost:3000/api/github/oauth/callback` for local development, or `https://your-domain.com/api/github/oauth/callback` in production.
4. Add the GitHub client ID and client secret to `.env.local`, along with the server-only Supabase service role key and a base64-encoded 32-byte encryption key.
5. Sign in at `/login`, open **Settings**, and select **Connect GitHub**. The OAuth flow uses the same stable authenticated workspace identity as the demo session.

The connection requests `read:user` and `repo` scopes so it can read repositories a founder is permitted to access. GitHub OAuth Apps do not offer a read-only scope for private repositories; Logfound’s service layer makes read-only GitHub requests and never exposes the access token to the browser.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Before publishing a change, run:

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment Variables

Copy `.env.example` to `.env.local`. These are the only environment variables currently consumed by the application:

| Variable                        | Required                  | Purpose                                                                                                                                                                                        |
| ------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Optional                  | Supabase project URL. Enables the existing Supabase browser, server, and middleware client boundaries.                                                                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional                  | Supabase publishable/anon key paired with the project URL. It is intended for client-safe use under Supabase's RLS model.                                                                      |
| `SUPABASE_URL`                  | Optional alias            | Server-side alias for the Supabase project URL. `NEXT_PUBLIC_SUPABASE_URL` remains the browser-compatible convention.                                                                          |
| `SUPABASE_ANON_KEY`             | Optional alias            | Server-side alias for the Supabase publishable/anon key.                                                                                                                                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Required for GitHub OAuth | Server-only Supabase key used to access the locked-down GitHub connection tables. Never expose or prefix it with `NEXT_PUBLIC_`.                                                               |
| `NEXT_PUBLIC_APP_URL`           | Required for GitHub OAuth | Absolute public Logfound origin, for example `http://localhost:3000`. It is used to construct the exact GitHub OAuth callback URL.                                                             |
| `NEXTAUTH_SECRET`               | Required in production    | Secret used to sign the Logfound demo session JWT. Generate a long random value and keep it server-only.                                                                                       |
| `NEXTAUTH_URL`                  | Optional                  | Canonical application URL retained for NextAuth-compatible deployments; use `http://localhost:3000` locally.                                                                                   |
| `LOGFOUND_DEMO_USERNAME`        | Optional                  | Username accepted by the demo Credentials flow; defaults to `founder` in development.                                                                                                          |
| `LOGFOUND_DEMO_PASSWORD`        | Development only          | Plaintext demo password; defaults to `logfound-demo` locally. Prefer `LOGFOUND_DEMO_PASSWORD_HASH` in production.                                                                              |
| `LOGFOUND_DEMO_PASSWORD_HASH`   | Production preferred      | Bcrypt hash for the demo password. Takes precedence over `LOGFOUND_DEMO_PASSWORD`.                                                                                                             |
| `AI_PROVIDER`                   | Required                  | Must be `groq`; Logfound has one AI runtime.                                                                                                                                                   |
| `GROQ_API_KEY`                  | Required                  | Secret Groq Console key read only by server-side route handlers. Never expose it to the browser or commit it.                                                                                  |
| `GITHUB_CLIENT_ID`              | Required for GitHub OAuth | GitHub OAuth App client ID, read only by server route handlers.                                                                                                                                |
| `GITHUB_CLIENT_SECRET`          | Required for GitHub OAuth | GitHub OAuth App client secret. Keep it server-only.                                                                                                                                           |
| `GITHUB_TOKEN_ENCRYPTION_KEY`   | Required for GitHub OAuth | Base64-encoded 32-byte AES-256-GCM key used to encrypt OAuth access tokens before persistence. Generate it with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. |

For Vercel deployments, configure the same values in the project's Environment Variables settings. Keep `GROQ_API_KEY`, `GITHUB_CLIENT_SECRET`, and any server-only storage secrets scoped to server runtime only.

## Architecture

### Frontend

Logfound is a Next.js App Router application organized by experience: dashboard, intelligence, GitHub, replay, voice, collaboration, settings, and the dedicated AI workspace. Shared components and tokens preserve the dark, keyboard-first visual language across routes. Client components call internal route handlers rather than third-party AI APIs directly.

### Backend

`POST /api/ai` is the centralized AI boundary. It validates every request with Zod, normalizes supplied context, limits request sizes, and emits Server-Sent Events for incremental UI updates. Supported operations are `ask`, `collaborate`, `summary`, `weekly_review`, `replay`, and `founder_dna`. `GET /api/ai/health` performs a small server-side connectivity check and returns only safe model, status, and latency information.

### Database and Authentication

Supabase SSR clients live in `src/lib/supabase` for browser, server, and middleware use. Middleware refreshes Supabase auth sessions whenever the public Supabase configuration is available. The GitHub migration adds two server-only tables for encrypted OAuth connections and project-repository links; RLS is enabled and the `anon` and `authenticated` database roles are denied table access. Broader workspace data remains seeded in the current prototype.

### AI Layer

`src/lib/ai` keeps Groq concerns server-only and separate from the UI:

- `client.ts` exposes the one Groq AI client and maps configuration, authentication, rate-limit, timeout, and network failures to safe responses.
- `groq.ts` owns the official Groq SDK, fixed model, timeout, retry, streaming, and safe error mapping.
- `agents.ts` defines the system prompt, responsibilities, personality, expertise, and response style for Nova, Atlas, Echo, Pulse, and Compass.
- `router.ts` selects a specialist for focused questions or coordinates multiple specialists and synthesizes their recommendation for mixed work.
- `prompts.ts` assembles context and defends against common prompt-injection patterns.
- `memory.ts` defines a replaceable memory-store interface. The current in-memory implementation supports local prototype sessions; it is designed to be swapped for Supabase persistence.

### GitHub Integration

`src/lib/github` centralizes GitHub OAuth, token encryption, API access, storage, and error handling. The OAuth flow validates a cryptographically random state in an HTTP-only cookie, exchanges authorization codes only on the server, validates the GitHub identity, and encrypts the access token with AES-256-GCM before writing it through the Supabase service role. Client components only call internal `/api/github` endpoints and receive safe repository metadata and activity data. A revoked or expired token is marked for reauthorization and surfaces a reconnect action instead of leaking a provider error.

The integration fetches repositories for the authenticated GitHub account and, for selected project repositories, reads repository metadata, commits, pull requests, issues, branches, and contributors. Webhook ingestion and background synchronization remain future work.

### Memory System

AI interactions can be remembered with the question, operation, workspace context, project, repository, agents involved, decision summary, timeline reference, and timestamp. Today this uses an in-memory store, so it resets with the running server. The interface is ready for a Supabase-backed adapter when durable founder memory is introduced.

## AI Usage

### How Codex contributed

Codex was used as a development collaborator throughout this project to accelerate implementation while keeping the codebase reviewable. It assisted with:

- generating and composing reusable React and TypeScript components;
- designing the centralized AI, agent-routing, memory, and streaming architecture;
- creating strongly typed API contracts and input-validation paths;
- refactoring shared UI and application boundaries;
- diagnosing build and TypeScript issues;
- improving responsive layout, keyboard navigation, focus states, and accessibility semantics; and
- implementing motion, theme behavior, and polished interaction details.

All generated work remains in the repository as conventional TypeScript, React, Tailwind, and Next.js code for maintainers to inspect, test, and evolve.

### How AI powers the product

When a Groq key is configured, the application sends founder requests only to the server-side AI route. The router chooses an appropriate specialist or runs a collaborative workflow, supplies relevant workspace context, streams contributions and conclusions to the interface, and can capture the interaction in the memory abstraction. Groq powers founder assistance, strategy and engineering summaries, decision support, weekly reviews, replay interpretation, and Founder DNA reflections.

AI recommendations are decision support, not an autonomous source of truth. Founders should review suggestions and verify any product, customer, repository, or market claims against their own evidence.

## Challenges

- **Designing for context, not chat.** The central product challenge was presenting AI guidance as a calm strategy room and operating system rather than a generic conversation feed.
- **Maintaining a single AI boundary.** Streaming specialist contributions, collaborative synthesis, safe failure states, and server-only credentials required a deliberate separation between the client UI and Groq.
- **Making a believable first-run experience.** The prototype needed realistic founder, repository, timeline, and engineering context without representing seeded data as a live integration. The GitHub layer now keeps the curated demo context distinct from connected repository data.
- **Planning for persistence without overbuilding.** The memory and Supabase boundaries are intentionally replaceable so durable data, RLS, and retrieval can arrive without rewriting agent callers.
- **Keeping rich interactions accessible.** Keyboard shortcuts, focus management, semantic regions, responsive layouts, theme choices, and motion restraint had to work together across the workspace.

## Future Improvements

- Add full Supabase authentication screens, workspace schema, Row Level Security policies, and persistent timeline, project, and memory records.
- Add GitHub webhooks, background synchronization, incremental repository indexing, and repository-aware retrieval for agents.
- Replace simulated presence and live cursors with Supabase Realtime collaboration.
- Add durable AI memory with retrieval, source citations, permission-aware context selection, and evaluation coverage.
- Connect voice commands to the AI workflow and explore a secure realtime voice transport.
- Introduce user-level usage controls, observability, agent evaluations, and production rate-limit policies.
- Add import/export, richer decision outcomes, and integrations for customer feedback and product metrics.

## License

Logfound is released under the [MIT License](LICENSE). Copyright © 2026 STELLEN.
