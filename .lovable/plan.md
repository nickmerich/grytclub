

## Where we are

Lovable Cloud is enabled. Leaflet still needs installing, Strava secrets still need adding, and no server functions exist yet. Here's what to ship next, in order.

## Next steps

### 1. Add Strava credentials (you do this)

I'll request three secrets via the secrets tool. You'll paste:

- `STRAVA_CLIENT_ID` — from https://www.strava.com/settings/api
- `STRAVA_CLIENT_SECRET` — same page
- `STRAVA_REFRESH_TOKEN` — generated via OAuth (one-time: visit `https://www.strava.com/oauth/authorize?client_id=YOUR_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read,profile:read_all`, grab the `code`, then `curl -X POST https://www.strava.com/oauth/token -d client_id=... -d client_secret=... -d code=... -d grant_type=authorization_code` and save the `refresh_token`)

I'll write a short README snippet with these exact steps.

### 2. Database: cache table

One table to avoid hammering Strava's rate limit (200 req/15min):

```text
strava_cache
  key         text primary key   -- 'next_event' | 'latest_activity' | 'leaderboard' | 'club_stats'
  payload     jsonb
  fetched_at  timestamptz
```

RLS: deny all (server-only via service role).

### 3. Server functions (`src/utils/strava.functions.ts`)

All use `createServerFn`, share a `getStravaAccessToken()` helper that refreshes via `STRAVA_REFRESH_TOKEN`, and wrap each call in a 10-min cache read/write against `strava_cache`:

- `getNextEvent()` → club 1708552 group events, returns next upcoming
- `getLatestActivity()` → most recent club activity with polyline, distance, pace, elevation
- `getLeaderboard()` → top 5 by distance this week
- `getClubStats()` → member count, YTD miles aggregate

Each returns `{ data, error, stale }` shape so the UI can degrade gracefully.

### 4. Frontend installs

- `leaflet` + `@types/leaflet` for maps
- `polyline-encoded` to decode Strava's polyline strings

### 5. UI build (single pass through `src/routes/index.tsx` + new components)

```text
src/components/
  StickyRibbon.tsx          NEXT RUN · SAT 7AM + JOIN/CALENDAR buttons
  HeroCTAs.tsx              3-button stack (Strava / Route / SMS)
  FromTheClub.tsx           3 tiles: NextEvent, LastSaturday, Leaderboard
  RouteOfTheWeek.tsx        Leaflet map + GPX download
  RulesCarousel.tsx         scroll-snap mobile carousel
  WallOfMiles.tsx           count-up stats + testimonials
  SmsOptInModal.tsx         stub posting to /api/sms-optin
  Footer.tsx                strava/IG/email/location

src/lib/
  ics.ts                    .ics generator for Saturday 7am
  utm.ts                    URL builder (already partial in index.tsx)
  analytics.ts              dataLayer.push wrapper (stub-safe)
  polyline.ts               decoder helper

src/routes/api/public/
  sms-optin.ts              POST stub → logs + returns ok
  newsletter.ts             POST stub → logs + returns ok
  gpx.$route.ts             returns GPX file for route

src/routes/thanks.tsx       post-SMS confirmation page
```

### 6. SEO + a11y pass

- `head()` per route with JSON-LD (Event, SportsClub, VideoObject)
- `prefers-reduced-motion` guard around count-up + carousel autoplay
- Strava orange (`#FC4C02`) ONLY on Strava-deep-link buttons
- Focus rings, aria-labels on icon buttons

### 7. After build, I'll output

- Env var checklist
- Where to paste each Strava credential
- CMS-ish edit points (route GPX, testimonials — stored as TS constants for now, no CMS)
- QA checklist (Lighthouse, keyboard nav, Strava fallback, calendar download, copy-to-clipboard)

## Order of execution

1. Request Strava secrets (blocks #3)
2. While you paste: install Leaflet, build database migration, write all UI components against mock data
3. Once secrets land: wire server functions, swap mocks for live data
4. SEO + a11y + analytics pass
5. Output the checklist

## Approve to proceed

Hit approve and I'll start with the secrets request + Leaflet install in parallel.

