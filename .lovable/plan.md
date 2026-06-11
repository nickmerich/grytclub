## GRYT Lovable scorecard

Audit only — no code changes. Compared the current project (routes, components, Cloud tables) against your 10-item checklist and the original build order.

### What's actually in the project today

Routes that exist:
- `/` — homepage (hero, next-run preview, runs section, how, first-saturday, who, FAQ, join CTA)
- `/api/public/rsvp` — RSVP form handler (writes to `rsvps`, enqueues confirmation email)
- `/email/unsubscribe` + `/lovable/email/*` — transactional email plumbing
- `/sitemap.xml`

Tables in Cloud: `rsvps`, `cta_clicks`, `email_send_log`, `email_send_state`, `email_unsubscribe_tokens`, `suppressed_emails`. **No** `events`, `profiles`, `attendance`, `user_roles`, `crews`, `challenges`.

Auth: not wired. No `_authenticated/` subtree, no `/auth` route, no profile table, no Google provider configured.

### Scorecard

| # | Check | Status | Evidence |
|---|---|---|---|
| 1 | Homepage has one primary CTA | **Pass** | Hero now = primary `RSVP for Saturday` + secondary `SEE THIS SATURDAY →` (scroll). Sticky bottom CTA reinforces same action. |
| 2 | Upcoming run above-the-fold-ish | **Pass** | `#next-run` section sits directly under hero with countdown, going-counter, inline RSVP. |
| 3 | Dedicated runs listing page | **Fail** | No `/runs` route. Saturday run is a static section on `/`. |
| 4 | Event detail template (host, location, pace, distance, RSVP state) | **Fail** | No `/runs/$id` route, no `events` table. Details are hardcoded copy. |
| 5 | Auth with persistent member identity | **Fail** | No `/auth`, no `_authenticated` layout, no `profiles`. |
| 6 | Onboarding (pace, goals, area, times) | **Fail** | Doesn't exist. |
| 7 | Logged-in dashboard (next RSVP, streak, recent) | **Fail** | Doesn't exist. |
| 8 | Data-driven community / directory | **Fail** | `#who` and CrewCarousel are static copy + photos. |
| 9 | Check-in / attendance flow | **Fail** | No attendance table or mobile check-in. |
| 10 | Admin/host controls (events, attendance, announcements) | **Fail** | No admin surface, no `user_roles`. |

### Red-flag check

| Red flag | Triggered? |
|---|---|
| Polished homepage, no auth | **Yes** |
| Community page is text/photos only | **Yes** |
| No RSVP state change anywhere | **Partial** — RSVP captures name+email to a flat `rsvps` table; no per-user state, no going/maybe/can't, no cancel |
| Events hardcoded, not structured | **Yes** |
| No member dashboard | **Yes** |
| No host/admin layer | **Yes** |
| No mobile-first check-in | **Yes** |

### Diagnosis

Phase 1 (public conversion shell) is **done and on-plan**. Phase 2 (operational event product) and Phase 3 (member retention) are **not started**. The roadmap's build order — Homepage → Runs listing → Run detail → Auth → Onboarding → Dashboard → Community → Challenges → Check-in → Admin — is currently at step 1 of 10.

### Exact next prompts to paste into Lovable, in order

Each one is scoped so it can ship without dragging the next step in. Paste them one at a time and verify the preview before moving on.

**Prompt 2 — Runs listing page**
> Create a public `/runs` route that lists upcoming runs from a new `events` table in Lovable Cloud (date, start_time, location_name, location_address, distance_mi, pace_label, host_name, capacity, description, slug, published). Migration must include GRANTs and RLS: anon + authenticated can SELECT published events; only `service_role` writes for now. Seed 4 upcoming Saturdays at 7 AM, Montour/Peters Trail, McMurray, ~4 mi. Card layout matches the homepage Saturday block. Link each card to `/runs/$slug` (route comes next).

**Prompt 3 — Run detail page**
> Add `/runs/$slug` route. Loader uses a public server fn that reads the event by slug from Cloud. Show date, time, location with map (reuse `RouteMap`), pace, distance, host, description, and a going-counter. Reuse the existing `RsvpForm` but wire it to insert `rsvps.event_id`. Add `errorComponent` and `notFoundComponent`. head() sets per-event title/description/og.

**Prompt 4 — Auth (email + Google)**
> Enable email/password and Google sign-in. Create `/auth` route with sign-in/sign-up tabs. Create a `profiles` table (id → auth.users, display_name, city, avatar_url) with RLS (user reads/updates own; anyone reads), auto-create trigger on signup, and GRANTs. Add `src/routes/_authenticated/route.tsx` only when the first protected child is created in the next prompt. Configure the Google provider in the same turn.

**Prompt 5 — Onboarding**
> After first sign-in, redirect to `/_authenticated/onboarding` if `profiles.onboarded_at` is null. Collect: running level (returning / consistent / new), typical pace (min/mi range), neighborhood, goals (multi), preferred run times. Add columns to `profiles` with a migration. On submit, set `onboarded_at = now()` and redirect to `/dashboard`.

**Prompt 6 — Member dashboard**
> Add `/_authenticated/dashboard` showing: next event the user RSVP'd to (with cancel), upcoming events they haven't RSVP'd to (with one-click RSVP using their profile), attendance streak (count of consecutive Saturdays attended), last 5 attendance rows, and announcements feed (empty state for now). Move the "home" of logged-in users here — header shows Dashboard link when signed in.

**Prompt 7 — Community directory**
> Add `/_authenticated/community` listing public profiles (display_name, neighborhood, pace, attendance count). Server fn does the join + count. Filter by neighborhood and pace. Profile detail at `/_authenticated/members/$id`. Respect a `profiles.is_public` flag (default true, toggle in profile settings).

**Prompt 8 — Challenges hub**
> Add `challenges` and `challenge_progress` tables with RLS + GRANTs. `/_authenticated/challenges` lists active challenges (e.g., "4 Saturdays in May"). Auto-credit progress when an attendance row is inserted for a qualifying event (trigger). Show progress bar on dashboard.

**Prompt 9 — Check-in flow**
> Mobile-first `/_authenticated/runs/$slug/check-in` route. Host opens it on run day; signed-in members tap "I'm here" within a time window (event.start_time ± 30 min) and it inserts into `attendance(event_id, user_id, checked_in_at)`. RLS: user inserts own row only; host (via `user_roles`) can view all. Add `user_roles` table with `has_role` security-definer fn per the user-roles standard.

**Prompt 10 — Admin console**
> `/_authenticated/admin` gated by `has_role(auth.uid(), 'admin')`. Pages: create/edit/publish events, view attendance per event with CSV export, broadcast announcement (writes to `announcements`, shown on dashboard). Grant first admin via a one-off migration that inserts into `user_roles`.

### Notes / decisions captured

- Runs will be a **real `events` table in Cloud** (your pick), so prompt 2 ships the schema once and prompts 3–10 build on it.
- Phase 1 homepage stays as the public shell; the member app lives under `_authenticated/` beside it, exactly as you described.
- `rsvps` today is anonymous (name + email). Prompt 3 starts associating RSVPs with events; once auth lands in prompt 4, future RSVPs from signed-in users also get `user_id`. Existing `rsvps` rows stay as-is.
- No code changes in this turn — switch to build mode and approve to start with Prompt 2.
