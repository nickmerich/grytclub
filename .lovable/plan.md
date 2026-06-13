# Runs → Check-ins

Replace RSVP-only with actual attendance. The event host marks who showed up on run day; that history powers a real streak and feeds the leaderboard later.

## What the user sees

**For hosts** (the person tied to the event):
- On the event detail page, a new "Check-in" panel appears once event_date is today or in the past.
- Shows the RSVP list with a tap-to-toggle "Here" pill next to each name, plus a free-text "Add walk-up" field for runners who didn't RSVP.
- A header counter: "12 / 18 RSVPs checked in · 3 walk-ups".
- Check-ins can be edited for 48h after the event, then locked.

**For members** (everyone else):
- Dashboard gets an "Attendance" stat block: total runs attended, current streak (consecutive Saturdays), last run date.
- Public member profile gets the same totals.
- Past events show "You were here ✓" when applicable.

**For everyone**:
- The existing `GoingCounter` on the homepage and event card swaps its "joined this week" wording for "runners checked in last Saturday" once at least one event has check-ins.

## Technical details

### Schema (one migration)

1. `events`: add `host_user_id uuid references auth.users(id)` (nullable for legacy rows). Backfill is left empty — only newly created/edited events get a host bound.
2. New table `event_checkins`:
   - `id`, `event_id` (fk events), `user_id` (fk auth.users, nullable for walk-ups), `walkup_name` text nullable, `checked_in_by` uuid (the host), `checked_in_at` timestamptz default now()
   - Unique on `(event_id, user_id)` where user_id is not null; unique on `(event_id, lower(walkup_name))` where walkup_name is not null.
3. GRANTs: `SELECT` to `authenticated`; `ALL` to `service_role`. No `anon`. RLS on.
4. Policies:
   - Read: any authenticated user can read check-ins for published events.
   - Insert/Delete: only `auth.uid() = events.host_user_id` for the parent event, enforced via a `has_event_host(auth.uid(), event_id)` security-definer function.
5. View `v_member_attendance` (security invoker) exposing per-user totals and last_checkin_date for the dashboard stat.

### Server functions (`src/lib/checkins.functions.ts`)

- `getEventCheckinPanel({ event_id })` — host-only; returns RSVPs + walk-ups + current check-in set. Throws if caller isn't the host.
- `setCheckin({ event_id, user_id?, walkup_name?, present })` — host-only toggle. Insert when `present`, delete when not.
- `getMyAttendance()` — totals, streak (consecutive Saturdays back from most recent run), recent runs.
- `getMemberAttendance({ user_id })` — public-safe totals for `/members/$id`.

Streak rule: count consecutive Saturdays ending at the most recent checked-in Saturday; one missed Saturday breaks it. Saturdays without any published event are skipped, not counted as breaks.

### UI

- New `src/components/CheckinPanel.tsx` rendered inside `src/routes/runs.$slug.tsx` when the viewer is the host and event_date ≤ today.
- New "Attendance" card in `src/routes/_authenticated/dashboard.tsx`.
- Extend `src/routes/_authenticated/members/$id.tsx` with attendance totals.
- `GoingCounter` (`src/components/StickyBits.tsx`) gets a new `lastSaturdayCheckins` source via a tiny addition to `getRsvpStats` (or a new fn — TBD during build).

### Out of scope
- Self check-in by members (rejected per earlier decision).
- Multi-host / admin role.
- Notifications.
- Leaderboard integration of attendance (will fold in once this lands).

### Build order
1. Migration: `host_user_id`, `event_checkins`, `has_event_host`, RLS, GRANTs.
2. `checkins.functions.ts`.
3. `CheckinPanel` on the run detail page.
4. Dashboard attendance card + member profile additions.
5. `GoingCounter` copy switch.
