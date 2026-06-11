## Homepage conversion rework — Phase 1

Scope: the public `/` route only. No auth, no dashboard, no event model, no admin. Goal is to convert a first-time visitor into either an RSVP (existing form) or a "see next run" scroll, with one clear primary action everywhere.

### Current state
Sections on `src/routes/index.tsx` today: Hero → Runs (Saturday detail) → Who → First Saturday → FAQ → Join. Strong brand, but: hero has competing CTAs, no segmented "who it's for," no social proof block, no explicit 3-step "how it works," no community/crew preview, and the upcoming-run callout doesn't lead with RSVP state.

### Target section order
1. **Hero** — one sentence promise ("Run with people who actually show up."), location/time chip, one primary CTA → `RSVP for Saturday`, one secondary → `See the next run` (scrolls to #runs).
2. **Next run preview** — date, trailhead, pace range, "X going" counter (reuse `GoingCounter`), inline RSVP form (existing `RsvpForm`). Becomes the primary conversion surface.
3. **Who it's for** — three cards: *Coming back to it* (beginner-friendly), *Consistent runner* (any pace, weekly), *Looking for your people* (community seeker). Each card ends in a soft CTA to the RSVP.
4. **How GRYT works** — 3-step strip: **Show up** → **Run your pace** → **Stay for coffee**. No signup required messaging.
5. **Social proof** — 3 short member quotes + crew photo strip (reuse `CrewCarousel` assets; rewrite copy if needed). Replaces nothing — slots between How-it-works and First-Saturday.
6. **First Saturday primer** — keep, lightly trimmed; it already handles the "what to bring" beginner objection.
7. **FAQ** — keep as-is.
8. **Final CTA** — full-bleed band: "Saturday. 7 AM. Be there." → RSVP form anchor.

### Concrete changes
- `src/routes/index.tsx`
  - Hero: collapse to single primary + single secondary CTA; move RSVP form out of hero into the **Next run preview** section so the hero stays declarative.
  - Add new `<section id="next-run">` between hero and `#who` with countdown pill, going counter, and the existing `RsvpForm`.
  - Restructure `#who` into a 3-card grid with segment labels above each paragraph; keep existing copy as the source.
  - Add new `<section id="how">` with three numbered steps (text + small icon, no new deps).
  - Add new `<section id="voices">` with 3 quote blocks + reuse `CrewCarousel`.
  - Rewrite final `#join` band as the closing CTA — shorter, louder.
- Nav (in `__root.tsx` or wherever the public nav lives): trim to Home, Next run, Who, FAQ, RSVP. No new routes.
- `RsvpForm.tsx`: no logic changes — just used in two places (next-run preview + final CTA).

### Out of scope (deferred to later phases)
- Auth, profile, dashboard, structured Event model, check-in, member directory, challenges, admin console. The roadmap's Phase 2/3 work waits until conversion is proven.
- No new routes, no DB migrations, no new packages.

### Copy I'll need from you (or I'll draft and you edit)
- 3 short member quotes (1–2 sentences each) with first name + neighborhood.
- Confirmation that "Run with people who actually show up." is the hero line, or your preferred alt.

### Done when
- A first-time visitor lands, reads one promise, sees the next Saturday run with going-count, can RSVP without scrolling past three screens, and every CTA on the page points at the same Saturday RSVP.
