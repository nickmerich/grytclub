## Goal
Public `/welcome` page (no auth) that a walk-up runner scans into from a QR code, fills in 3 fields, and lands on a confirmation showing next Saturday's run details. Behind the scenes it RSVPs them and records who invited them so the bring-a-friend leaderboard can credit it later.

## User flow
1. QR code → `/welcome`
2. Form: **Name**, **Email**, **Who invited you?** (optional, searchable dropdown of public members; free-text fallback "Someone else / walked up")
3. Submit → confirmation screen: "You're in. Saturday, [date], [time], [location]. We'll see you there." + optional "Create an account to track your streak" CTA that opens `/auth` prefilled.

## Pieces to build

### 1. Public route `src/routes/welcome.tsx`
- SSR on (shareable, indexable as `noindex` to avoid leaking into search but still server-rendered for fast first paint).
- Loader calls a new public server fn `getWelcomeContext()` returning: next upcoming published Saturday event (date/time/location) + a slim public member list for the inviter dropdown (id, display_name, first_name — only `is_public = true` profiles).
- `head()`: title "Welcome to GRYT — Saturday Run Club", description, `robots: noindex`.

### 2. Form component
- Client-side zod validation (name 1–100, email valid, inviter_id uuid or null).
- Submits to a new public server route `POST /api/public/welcome` (so it works without a logged-in session and bypasses auth middleware).
- On success: swap to confirmation card with next-Saturday details from loader data + "Create account" link.

### 3. Server route `src/routes/api/public/welcome.ts`
- Validates body with zod.
- Uses `supabaseAdmin` (loaded inside handler) to:
  - Insert into `rsvps` (existing table — name, email) so the RSVP counter and Saturday reminder picks them up.
  - Insert into a new `welcome_signups` table to capture inviter attribution + neighborhood + signup source (the `rsvps` table can't grow new columns without breaking the existing strict insert policy).
- Returns `{ ok: true }`.

### 4. New table `welcome_signups` (migration)
Columns: `id`, `name`, `email` (citext, lowercased), `inviter_user_id` (nullable FK profiles), `inviter_freeform` (nullable text), `source` (default `'qr-welcome'`), `event_id` (the Saturday they were signed up for, nullable FK events), `created_at`.

RLS: insert via service role only (route uses admin). `SELECT` restricted to `service_role` + the inviter themselves (`auth.uid() = inviter_user_id`) so a member can later see "people you invited" without exposing the full list. Standard GRANTs (no anon).

### 5. Inviter dropdown data
- New public server fn `listPublicMembersForInvite()` returning `{ id, display_name, first_name }[]` from `profiles where is_public = true`, ordered by `display_name`. Uses the server publishable client (anon-safe), backed by the existing public-profiles SELECT policy.

### 6. Confirmation copy + brand
- Match the existing RsvpForm success card styling (sky-brand accent, label-meta, underline-sky on the location).
- Empty state when there's no upcoming Saturday: "RSVPs open Monday — drop your email and we'll ping you" (still writes name+email to rsvps, sets event_id null).

## Out of scope (deliberately)
- Creating an `auth.users` row / magic link at signup. Account creation stays a separate, optional step on the confirmation screen — keeps the QR flow under 10 seconds and avoids email-verification friction at the trailhead.
- Crediting inviter to a leaderboard. We capture the attribution now; the leaderboard credit lands when we wire welcome_signups → existing invite/leaderboard system (separate task).
- Captain Slack ping. That's an n8n workflow on `welcome_signups` insert — out of app scope.

## Files
- **New**: `src/routes/welcome.tsx`, `src/routes/api/public/welcome.ts`, `src/lib/welcome.functions.ts`, `supabase/migrations/<ts>_welcome_signups.sql`
- **Edited**: none required (the existing `rsvps` flow already powers the Saturday reminder, no changes needed there)

## Open questions before I build
1. **Inviter dropdown**: include every public profile, or only members with `attendance >= 1` (i.e. real regulars, not other newcomers)?
2. **Neighborhood field**: include it now (matches your spec) or skip for v1 to keep the form to 3 fields?
3. **Account creation CTA**: show on the confirmation screen, or leave it off entirely for v1 (pure RSVP, no account pressure)?

Tell me on those three and I'll build it.