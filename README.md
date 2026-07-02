# Replica

Improve long-running AI workflows through reflection, not more prompts.

Replica is a **local-first, browser-only** app that helps you iterate on recurring AI workflows. You run prompts externally (e.g. Manus Scheduled Tasks), log outputs and reflections in Replica, get AI-proposed improvements, and copy prompts back for the next run.

Replica does **not** execute workflows, schedule tasks, or sync to the cloud. It is a reflection layer alongside the tools you already use.

## Features

- **Local-first, browser-only** — no backend, no account
- **IndexedDB storage** — workflows, iterations, and settings persist in your browser
- **Workflow creation** with a starter prompt
- **Run logging** — Manus output, outcome, observations, and prompt used
- **AI analysis (BYOK)** — proposed prompt, reasoning, and next recommendation via OpenAI
- **Copy-only loop** — you decide what to run; no auto-updating canonical prompt
- **Recommendation adherence tracking** — whether you followed prior recommendations
- **Cross-workflow Insights** — themes, timeline, workflow health, optional AI reflection
- **Full prompt history per workflow** — each iteration stores `promptUsed`; no separate version entity

## Screenshots

<!-- TODO: Add screenshot of workflow list -->
<!-- TODO: Add screenshot of log run + analysis -->
<!-- TODO: Add screenshot of Insights page -->

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [idb](https://github.com/jakearchibald/idb) (IndexedDB)
- [Zod](https://zod.dev/)
- OpenAI API (client-side, bring your own key)

## Getting started

```bash
git clone https://github.com/dan-tran-van/replica.git
cd replica
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The marketing landing is at `/`; the app starts at `/workflows`.

1. Go to **Settings** and add your OpenAI API key.
2. Create a workflow with a starter prompt.
3. Run your prompt externally, then **Log run** with output and reflections.
4. Review the AI proposal and copy it back for the next iteration.

## Self-hosting

### Vercel

Connect your repository and deploy. No environment variables are required.

### Netlify

Use the Next.js runtime with [`@netlify/plugin-nextjs`](https://docs.netlify.com/frameworks/next-js/overview/).

### VPS / Docker

Requires **Node.js 20+**:

```bash
pnpm install
pnpm run build
pnpm start   # listens on port 3000
```

### Static hosting

**Not recommended.** The App Router uses dynamic routes (`/workflows/[id]`). Use a Next.js-compatible host (Vercel, Netlify, Node server).

### OpenAI API key

The key is entered in the Settings UI, stored in browser IndexedDB, and sent only to `api.openai.com` from the client. For personal or self-hosted use this is acceptable; be aware the key is visible in browser devtools.

### Data isolation

All data lives in the user's browser IndexedDB. Each deployment **origin** has isolated storage—deploying a new instance does not migrate existing data.

## Project structure

```
app/
  (marketing)/     # Landing page at /
  (app)/           # App shell: /workflows, /insights, /settings
components/        # UI components (workflows, iterations, insights, marketing)
lib/
  domain/          # Types, derivation helpers
  insights/        # Cross-workflow analytics engine
  repositories/    # IndexedDB persistence
  ai/              # OpenAI client and analysis prompts
```

## Current scope

**Replica does:**

- Store workflows and iteration history locally
- Analyze runs with OpenAI when you provide a key
- Surface cross-workflow insights and optional AI reflection

**Replica does not:**

- Execute or schedule AI workflows
- Sync data across devices or browsers
- Provide authentication or multi-user support

## Roadmap (ideas, not commitments)

- Import/export workflows and iterations
- Multiple AI providers beyond OpenAI
- Semantic analytics across reflection text
- Offline-friendly analysis summaries
- Plugin architecture for external workflow sources

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint` and `pnpm build`
5. Open a pull request

## License

[MIT](LICENSE)
