# GRYT Club

Private application repository for **GRYT** — a Pittsburgh-area run club for adults 30+ that meets Saturdays on the Montour/Peters Trail. This web app powers the public landing and walk-up RSVP flow, member dashboards, run check-ins, challenges, leaderboards, and the transactional/reminder email system.

> **Private project.** This repository and its contents are confidential. Do not share source, environment values, database credentials, or member data outside the team.

---

## Tech Stack

| Layer              | Technology                                                                     |
| ------------------ | ------------------------------------------------------------------------------ |
| Language           | TypeScript (strict mode)                                                       |
| Framework          | [TanStack Start](https://tanstack.com/start) (TanStack Router + React 19, SSR) |
| Build tool         | Vite 7 (via `@lovable.dev/vite-tanstack-config`)                               |
| Styling            | Tailwind CSS 4, shadcn/ui (new-york), Radix primitives, Framer Motion          |
| Data / Auth        | Supabase (`@supabase/supabase-js` v2) with Postgres + Row Level Security       |
| Forms / Validation | React Hook Form + Zod                                                          |
| Email              | React Email templates + Lovable email service                                  |
| Hosting            | Cloudflare Workers (Wrangler, `nodejs_compat`)                                 |
| Package manager    | Bun (`bun.lockb`); npm lockfile also present                                   |

---

## System Architecture

This is a full-stack TanStack Start application that renders on the server (Cloudflare Workers) and hydrates on the client.

```
src/
├── routes/                     # File-based routing (TanStack Router)
│   ├── __root.tsx              # Root layout, head/meta, QueryClient provider
│   ├── index.tsx               # Public landing page
│   ├── welcome.tsx             # Public QR-code walk-up RSVP flow
│   ├── auth.tsx                # Sign-in / sign-up
│   ├── _authenticated/         # Auth-guarded routes (dashboard, challenges,
│   │                           #   community, leaderboard, members, onboarding)
│   ├── api/public/             # Public server routes (rsvp, welcome, cron hooks)
│   └── lovable/email/          # Email queue / transactional / suppression routes
├── integrations/supabase/      # Supabase clients & auth (see below)
├── lib/                        # *.functions.ts server functions + helpers
│   └── email-templates/        # React Email templates + registry
├── components/                 # Feature components + ui/ (shadcn)
├── hooks/                      # React hooks
└── router.tsx / start.ts       # Router + Start instance wiring

supabase/
├── config.toml                 # Supabase project linkage
└── migrations/                 # Timestamped SQL migrations (schema + RLS)
```

### Data access pattern

The app uses **three** distinct Supabase client surfaces, each with a clear trust boundary:

1. **Browser / SSR client** — `src/integrations/supabase/client.ts`
   Uses the **publishable (anon) key**. Subject to Row Level Security. Safe for client code and SSR. Imported as `supabase`.

2. **Authenticated server middleware** — `src/integrations/supabase/auth-middleware.ts`
   `requireSupabaseAuth` validates the incoming `Bearer` token, calls `supabase.auth.getClaims`, and injects a per-request RLS-scoped client (`context.supabase`) plus `userId`/`claims`. Used by server functions that act **as the signed-in user**.

3. **Admin / service-role client** — `src/integrations/supabase/client.server.ts`
   Uses the **service role key** and **bypasses RLS**. Server-only. Imported lazily as `supabaseAdmin` for trusted operations (public RSVP inserts, cron jobs, email logging). **Never import this into client code.**

Server logic lives in `src/lib/*.functions.ts` as TanStack `createServerFn` handlers (e.g. `dashboard.functions.ts`, `challenges.functions.ts`, `rsvps.functions.ts`, `welcome.functions.ts`).

### Database

Postgres managed by Supabase. Core tables (from `supabase/migrations/`): `profiles`, `events`, `rsvps`, `welcome_signups`, `event_checkins`, `member_props`, `run_recaps`, `cta_clicks`, the `challenges*` family (`challenges`, `challenge_steps`, `challenge_participants`, `challenge_invites`, `challenge_invite_acceptances`, `challenge_step_completions`), and the email-infra tables (`email_send_log`, `email_send_state`, `email_unsubscribe_tokens`, `suppressed_emails`). RLS policies are defined alongside each migration.

### Email & background jobs

React Email templates (`src/lib/email-templates/`) are rendered and dispatched through the Lovable email service. Cron-style hooks (e.g. the email-queue processor and hooks under `src/routes/api/public/hooks/` such as `send-saturday-reminders`, `generate-recaps`) are triggered externally and authenticated via a `Bearer` token compared against an expected key.

> **Cron auth hardening:** today these hooks accept a Supabase key (the service-role key for the email-queue processor) as the `Bearer` token. A Supabase **publishable/anon** key is _not_ a real secret and must never be relied on as a cron credential, and reusing the **service-role** key as a long-lived bearer gives every scheduler the keys to the whole database. Prefer a dedicated, rotatable **server-only cron secret** (e.g. `CRON_SECRET`) stored in the secret manager / vault and compared in constant time, so it can be rotated independently without touching Supabase keys.

---

## Prerequisites

- [Bun](https://bun.sh) (preferred — repo ships `bun.lockb` and `bunfig.toml`) or Node.js 20+ with npm
- A Supabase project (the team's shared project, or your own for local development)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for migrations / local stack)

---

## Local Setup

```bash
# 1. Install dependencies
bun install            # or: npm install

# 2. Create your environment file from the tracked template
cp .env.example .env.local   # then fill in the values described below
                             # (.env.local is gitignored — do NOT commit real secrets)

# 3. Start the dev server
bun run dev            # or: npm run dev
```

The app will start on the Vite dev server (port is managed by the Lovable/TanStack config). Open the printed local URL.

### Available scripts

| Command             | Description                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| `bun run dev`       | Start the Vite dev server (SSR + HMR)                                               |
| `bun run build`     | Production build, then validates the deployed sitemap (`scripts/check-sitemap.mjs`) |
| `bun run build:dev` | Build in development mode                                                           |
| `bun run preview`   | Preview the production build locally                                                |
| `bun run lint`      | Run ESLint across the project                                                       |
| `bun run format`    | Format with Prettier                                                                |

> The `build` script runs a post-build sitemap check against the live site. Set `SKIP_SITEMAP_CHECK=1` (or `SITEMAP_URL=...`) when building in CI or offline.

---

## Environment Variables

Environment values are read from `.env.local` (and any platform-provided environment). The repo tracks **`.env.example`** as the canonical template — copy it to `.env.local` and fill in the values. Real `.env*` files (other than `.env.example`) are gitignored and must never be committed. Two parallel sets exist: **`VITE_`-prefixed** variables are inlined into the **client bundle at build time** (publicly visible), while the **unprefixed** variables are read from `process.env` on the **server only**.

> **Security:** Treat the service role key as a top secret. It bypasses Row Level Security and grants full database access. It must **only** ever exist server-side and must never be given a `VITE_` prefix.

### Client-exposed (safe to ship to the browser)

| Variable                        | Required | Description                                   |
| ------------------------------- | -------- | --------------------------------------------- |
| `VITE_SUPABASE_URL`             | ✅       | Supabase project URL                          |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅       | Supabase anon/publishable key (RLS-protected) |
| `VITE_SUPABASE_PROJECT_ID`      | ✅       | Supabase project ref/ID                       |

### Server-side, non-secret (publishable values used by SSR & middleware)

| Variable                   | Required | Description                                         |
| -------------------------- | -------- | --------------------------------------------------- |
| `SUPABASE_URL`             | ✅       | Supabase project URL (SSR fallback)                 |
| `SUPABASE_PUBLISHABLE_KEY` | ✅       | Anon key for SSR + auth middleware token validation |
| `SUPABASE_PROJECT_ID`      | ✅       | Supabase project ref/ID                             |

### Private / server-only secrets (NEVER expose to the client)

| Variable                    | Required                                            | Description                                       |
| --------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (for admin ops, cron hooks, public RSVP inserts) | Service role key — **bypasses RLS**. Server-only. |
| `LOVABLE_API_KEY`           | ✅ (for email sending)                              | API key for the Lovable email service             |
| `LOVABLE_SEND_URL`          | ⛅ optional                                         | Override URL for the email send endpoint          |

No real environment values are committed to this repo. Start from `.env.example` (placeholders only) and fill in the publishable Supabase values plus any server-only secrets you need locally. **Server-only secrets** — `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`, and any cron secret — must be supplied locally in `.env.local` (gitignored) or your deployment platform's secret store; obtain them from the team secrets manager. For Cloudflare, use `.dev.vars` locally (gitignored) and Wrangler secrets in production. Never give a server-only secret a `VITE_` prefix.

---

## Supabase-js Workflow

The Supabase JS SDK (`@supabase/supabase-js`) is already a dependency. Clients are pre-wired — **do not hand-edit the generated files** in `src/integrations/supabase/` (`client.ts`, `client.server.ts`, `auth-middleware.ts`, `types.ts` are marked auto-generated).

### Using the client

```ts
// Browser / SSR (RLS-enforced)
import { supabase } from "@/integrations/supabase/client";

// Server-only admin (bypasses RLS — import lazily inside a handler)
const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

// As the signed-in user inside a server function
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
// → context.supabase, context.userId, context.claims
```

### Database types

Table types live in `src/integrations/supabase/types.ts` (`Database` type). Regenerate them after schema changes:

```bash
supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts
```

### Migrations

Schema changes are tracked as timestamped SQL files in `supabase/migrations/`. Each migration should include both the DDL and its RLS policies/grants.

```bash
# Link to the project (once)
supabase link --project-ref <project-id>

# Create a new migration
supabase migration new <descriptive_name>

# Apply migrations to the linked/remote project
supabase db push

# Run a full local stack (optional)
supabase start            # local Postgres + Studio
supabase db reset         # rebuild local DB from migrations
```

> Always pair new tables/columns with explicit RLS policies and grants. The public RSVP/welcome flow relies on service-role inserts plus narrowly-scoped SELECT policies — follow the existing patterns in `supabase/migrations/` rather than loosening RLS.

---

## Contribution Workflow

This is a private, team-owned project. Please follow the conventions below.

### Branching

- Branch off `main`: `feature/<short-desc>`, `fix/<short-desc>`, or `chore/<short-desc>`.
- Keep branches focused and short-lived.

### Commits

- Write clear, imperative commit messages describing the change (e.g. `Add welcome signups INSERT`).
- Keep commits scoped and reviewable.

### Before opening a PR

Run the local checks and make sure they pass:

```bash
bun run lint      # ESLint (+ Prettier via eslint-plugin-prettier)
bun run format    # Prettier auto-format
bun run build     # Type-check + production build (use SKIP_SITEMAP_CHECK=1 offline)
```

- Code style is enforced by Prettier (`printWidth: 100`, semicolons, double quotes, trailing commas) and ESLint (`eslint.config.js`).
- TypeScript runs in `strict` mode — keep the build type-clean.

### Pull requests

- Open a PR against `main` with a clear summary and testing notes.
- At least one teammate review is expected before merge. **Do not self-approve.**
- Include any new migrations and note schema/RLS impact in the description.

### Secrets handling

- **Never commit** real secrets (service role keys, `LOVABLE_API_KEY`, member data exports).
- Keep secrets in `.env.local` / `.dev.vars` (both gitignored) or the platform secret store.
- If a secret is ever committed, rotate it immediately in Supabase/Lovable.

### Database migrations

- Add a migration for every schema change; never edit applied migrations.
- Include RLS policies + grants in the same migration.
- Regenerate `types.ts` and include it in the same PR.

---

## Current Technical Debt

An honest snapshot of areas to improve, based on the current state of the repo:

- **Two lockfiles.** Both `bun.lockb` and `package-lock.json` are committed. Pick one package manager as the source of truth to avoid dependency drift between contributors and CI.
- **Generated files are version-controlled and editable-by-accident.** The Supabase clients, `types.ts`, and `routeTree.gen.ts` are auto-generated; there is no guard preventing manual edits from being committed.
- **Environment template via `.env.example`.** A placeholder-only `.env.example` is committed as the canonical template; real `.env*` files are gitignored so no environment values (even anon-tier keys) land in version control. If the previously-committed anon key needs to be treated as compromised, rotate it in Supabase.
- **No automated test suite.** There are no unit/integration/e2e tests; correctness relies on type-checking, linting, and manual QA. The only automated guards are build-time sitemap/domain redirect scripts.
- **No CI configuration in-repo.** Lint/build/type checks are run manually; there is no committed CI workflow to enforce them on PRs.
- **Cron hook auth reuses Supabase keys.** Background hooks authenticate via a `Bearer` token compared against a Supabase key (the service-role key for the email-queue processor). An anon/publishable key is not a real secret, and the service-role key is too broad and hard to rotate for this purpose — a dedicated, rotatable server-only cron secret (e.g. `CRON_SECRET`) compared in constant time would be more robust.
- **Email send reliability.** Email dispatch depends on the external Lovable service; failure handling, retries, and the suppression/queue lifecycle deserve a focused review.
- **Tooling churn.** Several dependencies are on beta/edge versions (e.g. `nitro` beta, React 19, Tailwind 4); expect occasional breakage on upgrades.

---

## Proposed Roadmap

> No formal roadmap is committed to the repo. The items below are **proposed** next steps inferred from the current application surface — confirm priorities with the team before building.

- **Testing & CI (proposed).** Add a test runner (Vitest) with coverage for server functions and Zod validators, plus a CI workflow running `lint` + `build` on every PR.
- **Bring-a-friend leaderboard (proposed).** Wire `welcome_signups` inviter attribution into the existing invite/leaderboard system (explicitly flagged as out-of-scope in `.lovable/plan.md`).
- **Account creation from RSVP (proposed).** Optional magic-link / account creation at the trailhead, building on the existing `/welcome` confirmation CTA.
- **Challenges expansion (proposed).** Deepen the challenges feature (step completions, invites, participant progress) and surface it more prominently in the dashboard.
- **Run recaps automation (proposed).** Harden the `generate-recaps` hook and the recap publishing flow (`runs.$slug.recap`).
- **Notifications (proposed).** Extend beyond Saturday email reminders (e.g. captain Slack pings on signup, configurable per-member preferences).
- **Observability (proposed).** Add structured logging/metrics for email delivery and cron hooks, plus error monitoring.
- **Secrets/config hardening (proposed).** `.env.example` now replaces the committed `.env`; remaining steps are to introduce a dedicated rotatable cron secret (replacing the Supabase-key bearer) and to fully document the deployment secret store.

---

## License

Proprietary and confidential. © GRYT Club. All rights reserved. Internal use only.
