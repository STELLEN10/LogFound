# Logfound

Logfound is a Next.js 15 foundation for a focused workspace that helps people find signal with AI agents.

## Stack

- Next.js 15 App Router and React 19
- TypeScript in strict mode
- Tailwind CSS with shadcn/ui-compatible design tokens and primitives
- Supabase SSR/browser boundaries
- Vercel-ready deployment configuration

## Getting started

```bash
npm install
Copy-Item .env.example .env.local # PowerShell; use cp on macOS/Linux
npm run dev
```

Supabase is optional during local UI development. Add the values from your Supabase project to `.env.local` when auth/data work begins.

## Architecture

```text
src/
  app/                 App Router routes, metadata, and global styles
  components/          Composable UI and application shell
    ui/                shadcn/ui-compatible primitives
  hooks/               Client-only interaction hooks
  lib/
    agents/            Typed agent contracts and registry (Nova, Atlas, Echo)
    supabase/          Browser, server, and middleware client boundaries
    env.ts             Runtime-safe public environment parsing
```

Feature domains should be added beneath `src/features/<domain>` with their server actions, queries, schemas, and UI kept together. Keep shared primitives domain-agnostic.

## Quality gates

```bash
npm run typecheck
npm run lint
npm run build
```

The default shell deliberately contains no fake product workflows. New surfaces should earn their route and be composed from the shared primitives.
