## Problem

`StickyBits` and `RsvpForm` use `@tanstack/react-query` (`useQuery`, `useQueryClient`), but the project has no `QueryClientProvider` and no `QueryClient` in router context. Any page rendering the sticky bar or RSVP form throws **"No QueryClient set, use QueryClientProvider to set one"**.

## Fix (one pass, three files)

Follow the canonical TanStack Start + Query integration pattern so a fresh client is created per SSR request:

1. **`src/router.tsx`** — create `QueryClient` inside `getRouter`, pass it into router `context`. Type the router context as `{ queryClient: QueryClient }`.
2. **`src/routes/__root.tsx`** — use `createRootRouteWithContext<{ queryClient: QueryClient }>()` (replaces `createRootRoute`). Inside `RootComponent`, read `queryClient` from route context and wrap `<Outlet />` in `<QueryClientProvider client={queryClient}>`. Keep existing auth `onAuthStateChange` listener and head/meta as-is.
3. No changes to `StickyBits.tsx` / `RsvpForm.tsx` — they start working once the provider is in place.

## Verification

- Reload `/` → no console error; sticky "GOING SATURDAY" badge renders with live count.
- Submit an RSVP → `rsvp-stats` invalidates and the count updates.

No schema or auth changes. Strictly fixes the missing provider so the work from the previous turns runs.
