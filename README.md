# Logfound

**Logfound is an AI-powered founder operating system.** It gives solo founders and startup teams a calm, connected place to remember why decisions were made, understand how a product has evolved, collaborate with specialist agents, and stay aligned from the first idea to the next release.

Built for OpenAI Build Week, Logfound treats product work as a living system rather than a collection of disconnected tasks. Decisions, repository activity, founder context, and AI guidance are designed to be read together.

> **Project status:** the product is a polished, functional prototype with a live server-side OpenAI integration. Several product surfaces use realistic seeded workspace data while their persistence and third-party sync layers are prepared for production implementation.

## Features

- **Supabase-ready authentication** — typed browser, server, and middleware boundaries refresh sessions when Supabase is configured. The dashboard can personalize its greeting from the active session.
- **Founder dashboard** — a focused daily workspace with project momentum, streaks, active work, timeline activity, team discussion, focus planning, quick actions, and keyboard shortcuts.
- **Timeline** — an elegant activity feed for decisions, notes, milestones, repository changes, and AI recommendations.
- **AI agents** — five distinct server-side specialists: **Nova** for founder strategy, **Atlas** for engineering, **Echo** for founder memory, **Pulse** for market signals, and **Compass** for long-term direction. Focused requests are routed to the right agent; mixed requests use a collaborative council and synthesis.
- **Streaming AI workspace** — progressive server-sent responses expose thinking states, individual agent contributions, a shared recommendation, and an OpenAI connection health check. The browser never receives an API key.
- **Founder Intelligence** — a strategy-room experience that brings independent agent perspectives, trade-offs, risks, confidence, and a recommended action plan into one decision surface.
- **GitHub Intelligence experience** — repository selection, AI-oriented commit stories, engineering memory, health observations, and context-aware agent recommendations, demonstrated with realistic SaaS repository data. Live GitHub OAuth and repository synchronization are not yet implemented.
- **Founder Replay** — an immersive, connected view of a decision's original problem, conversations, reasoning, commits, outcomes, and lessons.
- **Voice Workspace** — a browser speech-to-text and text-to-speech abstraction with a focused, multi-agent voice workflow. Support depends on the visitor's browser; it is not an OpenAI Realtime integration.
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
- [OpenAI Node SDK](https://github.com/openai/openai-node) for server-side GPT-5.6 requests
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
    ├── ai/                      # Server-only OpenAI client, prompts, router, memory
    ├── supabase/                # Browser, server, and middleware Supabase clients
    ├── voice/                   # Browser speech abstractions
    ├── collaboration.ts         # Seeded collaboration and graph data
    └── founder-memory.ts        # Seeded replay, review, and founder-profile data
```

## Installation

### Prerequisites

- Node.js 20.9 or later
- npm
- An OpenAI API key to enable live AI features
- A Supabase project if you want session-aware Supabase integration

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

Set the values described in [Environment Variables](#environment-variables). The UI can run without configuration; live AI requires `OPENAI_API_KEY`.

### 3. Configure Supabase (optional for the current prototype)

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard).
2. Copy the project URL and publishable/anon key into `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Configure Supabase Auth providers and redirect URLs when adding an application sign-in flow.

The repository already refreshes Supabase sessions in middleware and exposes typed browser/server clients. It does **not** ship application-specific database tables, Row Level Security policies, or a complete sign-in screen yet.

### 4. Configure the AI provider

Add your server-side key to `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.6
```

Never use a `NEXT_PUBLIC_` prefix for `OPENAI_API_KEY`. Once running, open `/ai` and select **Test AI**, or request `GET /api/ai/health`, to confirm the connection without exposing the key.

### 5. GitHub OAuth status

The GitHub Intelligence UI currently uses curated demo repository data; no GitHub OAuth callback, token storage, webhook handler, or GitHub environment variable is present in this codebase. Therefore, GitHub OAuth setup is **not required** to run Logfound today.

To add live sync after the hackathon, create a GitHub OAuth App, add its callback URL, store its client secret only on the server, encrypt user tokens, and implement server-side repository, commit, pull request, and webhook sync. Do not add credentials to `NEXT_PUBLIC_` variables.

### 6. Start the development server

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

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL. Enables the existing Supabase browser, server, and middleware client boundaries. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase publishable/anon key paired with the project URL. It is intended for client-safe use under Supabase's RLS model. |
| `OPENAI_API_KEY` | Required for live AI | Secret OpenAI API key read only by server-side route handlers. Never expose it to the browser or commit it. |
| `OPENAI_MODEL` | Optional | OpenAI model identifier. Defaults to `gpt-5.6`. |

There are currently no `GITHUB_*` environment variables because live GitHub OAuth and sync are not implemented.

For Vercel deployments, configure the same values in the project's Environment Variables settings. Keep `OPENAI_API_KEY` scoped to server runtime only.

## Architecture

### Frontend

Logfound is a Next.js App Router application organized by experience: dashboard, intelligence, GitHub, replay, voice, collaboration, settings, and the dedicated AI workspace. Shared components and tokens preserve the dark, keyboard-first visual language across routes. Client components call internal route handlers rather than third-party AI APIs directly.

### Backend

`POST /api/ai` is the centralized AI boundary. It validates every request with Zod, normalizes supplied context, limits request sizes, and emits Server-Sent Events for incremental UI updates. Supported operations are `ask`, `collaborate`, `summary`, `weekly_review`, `replay`, and `founder_dna`. `GET /api/ai/health` performs a small server-side connectivity check and returns only safe model, status, and latency information.

### Database and Authentication

Supabase SSR clients live in `src/lib/supabase` for browser, server, and middleware use. Middleware refreshes Supabase auth sessions whenever the public Supabase configuration is available. The current prototype intentionally keeps feature data seeded in the client and does not yet include a production schema, RLS policies, or persistent workspace data model.

### AI Layer

`src/lib/ai` keeps OpenAI concerns server-only and separate from the UI:

- `client.ts` creates the official OpenAI SDK client, applies a timeout, and maps configuration, authentication, rate-limit, and network failures to safe responses.
- `agents.ts` defines the system prompt, responsibilities, personality, expertise, and response style for Nova, Atlas, Echo, Pulse, and Compass.
- `router.ts` selects a specialist for focused questions or coordinates multiple specialists and synthesizes their recommendation for mixed work.
- `prompts.ts` assembles context and defends against common prompt-injection patterns.
- `memory.ts` defines a replaceable memory-store interface. The current in-memory implementation supports local prototype sessions; it is designed to be swapped for Supabase persistence.

### GitHub Integration

The GitHub Intelligence route establishes the presentation and product model for repository context, commit explanations, engineering memory, and health observations. It is intentionally not connected to GitHub's API yet; live OAuth, secure token persistence, webhook ingestion, and background synchronization are future work.

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

When an API key is configured, the application sends founder requests only to the server-side AI route. The router chooses an appropriate specialist or runs a collaborative workflow, supplies relevant workspace context, streams contributions and conclusions to the interface, and can capture the interaction in the memory abstraction. GPT-5.6 is used for founder assistance, strategy and engineering summaries, decision support, weekly reviews, replay interpretation, and Founder DNA reflections.

AI recommendations are decision support, not an autonomous source of truth. Founders should review suggestions and verify any product, customer, repository, or market claims against their own evidence.

## Challenges

- **Designing for context, not chat.** The central product challenge was presenting AI guidance as a calm strategy room and operating system rather than a generic conversation feed.
- **Maintaining a single AI boundary.** Streaming specialist contributions, collaborative synthesis, safe failure states, and server-only credentials required a deliberate separation between client UI and the OpenAI SDK.
- **Making a believable first-run experience.** The prototype needed realistic founder, repository, timeline, and engineering context without representing seeded data as a live integration.
- **Planning for persistence without overbuilding.** The memory and Supabase boundaries are intentionally replaceable so durable data, RLS, and retrieval can arrive without rewriting agent callers.
- **Keeping rich interactions accessible.** Keyboard shortcuts, focus management, semantic regions, responsive layouts, theme choices, and motion restraint had to work together across the workspace.

## Future Improvements

- Add full Supabase authentication screens, workspace schema, Row Level Security policies, and persistent timeline, project, and memory records.
- Implement GitHub OAuth, encrypted token storage, webhook ingestion, background synchronization, and repository-aware retrieval.
- Replace simulated presence and live cursors with Supabase Realtime collaboration.
- Add durable AI memory with retrieval, source citations, permission-aware context selection, and evaluation coverage.
- Connect voice commands to the AI workflow and explore a secure realtime voice transport.
- Introduce user-level usage controls, observability, agent evaluations, and production rate-limit policies.
- Add import/export, richer decision outcomes, and integrations for customer feedback and product metrics.

## License

Logfound is released under the [MIT License](LICENSE). Copyright © 2026 STELLEN.
