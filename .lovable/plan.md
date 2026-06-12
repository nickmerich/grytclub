# Social & Competitive Layer

Three additions that turn challenges from solo habit loops into a competitive social surface.

## 1. Global leaderboard

New route `/leaderboard` (under `_authenticated/`).

Aggregates across all published challenges:
- **Steps completed** (all-time across every challenge)
- **Challenges joined**
- **Challenges completed** (100%)
- **Current rank** with avatar, display name, athlete alignment badge, neighborhood

Filter chips: *All time* · *This month* · *Active challenges only*.
Top 3 get a podium treatment; rest is a clean table. The signed-in member's row is sticky-pinned at the bottom if they're outside the visible window.

Also adds a compact per-challenge leaderboard widget already shown on the challenge detail page — that one stays; this is the cross-challenge view.

## 2. Head-to-head comparison

New route `/members/$id` (public profile) with a "Compare with me" button when viewing another member.

Compare page `/compare/$otherId` shows two columns side by side:
- Avatars, names, neighborhoods, athlete alignment
- PRs (5K / 10K / Half / Marathon) with a green check on the faster side
- Shared challenges: progress bars stacked, who's ahead
- Totals: steps completed, challenges done, runs attended (once check-ins land)
- A single "winner so far" summary line based on a simple point system (PR wins + challenge leads)

Members directory gets a "Compare" button on each card.

## 3. Challenge invite links

On each challenge detail page, a "Invite" button generates a tokenized link:
`/challenges/$slug?invite=<token>`

When an unauthenticated visitor opens it:
- Sees a public preview of the challenge (title, tagline, step count, who invited them)
- CTA "Sign up to accept" → auth flow → auto-joins the challenge and records the referrer

When a signed-in member opens it, auto-joins and shows a toast "Joined via @inviter".

Tracks invite acceptance so inviters get a small "X friends joined your challenges" stat on their dashboard.

---

## Technical details

### New tables

**`challenge_invites`**
- `id`, `challenge_id`, `inviter_id`, `token` (random url-safe, unique), `accepted_count`, `created_at`
- RLS: inviter can read their own; insert by authenticated; public read by token via a security-definer RPC `get_invite_by_token(token)` so we don't need a `TO anon` policy.

**`challenge_invite_acceptances`**
- `id`, `invite_id`, `invitee_id`, `accepted_at`
- Unique on `(invite_id, invitee_id)`.
- RLS: inviter and invitee can read their own rows; insert through a security-definer RPC `accept_invite(token)` that also inserts into `challenge_participants`.

No changes to existing challenge tables.

### New server functions (`src/lib/social.functions.ts`)
- `getGlobalLeaderboard({ window: 'all' | 'month', activeOnly: boolean })` — aggregates `challenge_step_completions` joined to `profiles`, returns top 100 + signed-in member's row.
- `getPublicMember({ id })` — public-safe projection of `profiles` honoring `is_public`.
- `getComparison({ otherId })` — bundles both members + shared challenges + per-challenge progress + PR diff.
- `createInvite({ challenge_id })` — generates token (crypto.randomUUID base36), inserts row, returns share URL.
- `getInvitePreview({ token })` — public, returns challenge summary + inviter display name (no PII beyond display_name + avatar).
- `acceptInvite({ token })` — auth-required, calls RPC, joins challenge, returns slug.

### New routes
- `src/routes/_authenticated/leaderboard.tsx`
- `src/routes/_authenticated/members/$id.tsx`
- `src/routes/_authenticated/compare/$otherId.tsx`
- `src/routes/invite/$token.tsx` (public — handles both signed-in and signed-out flows)

### UI additions
- Dashboard: "Invites accepted" mini-stat + nav link to `/leaderboard`.
- Members directory: "Compare" button on each card.
- Challenge detail: "Invite friends" button next to Join/Leave; opens share sheet (native share API + copy link fallback).
- Top nav (authenticated): add "Leaderboard" link.

### Out of scope (for a later pass)
- Real-time leaderboard updates
- Friend system / following
- Notifications when someone passes you on the leaderboard
- Run check-ins (separate plan when you're ready)

### Build order
1. Migration (`challenge_invites`, `challenge_invite_acceptances`, RPCs, RLS, GRANTs)
2. `social.functions.ts`
3. `/leaderboard` route
4. `/members/$id` + `/compare/$otherId`
5. Invite flow (`createInvite` button + `/invite/$token` public route + accept RPC)
6. Wire dashboard stat + nav link
