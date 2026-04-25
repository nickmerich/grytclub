## Goal

Keep the elevation chart legible on phones without compromising the editorial GRYT spacing on desktop. Today the SVG uses `preserveAspectRatio="none"`, which stretches text horizontally on narrow screens, and renders an X label every mile (6 labels packed into ~340px on a 360px viewport).

## Changes (single file: `src/components/ElevationChart.tsx`)

### 1. Stop distorting text

Switch the SVG from `preserveAspectRatio="none"` to `preserveAspectRatio="xMinYMid meet"` so glyphs scale uniformly. Drop the fixed `h-[180px] md:h-[220px]` heights in favor of an `aspect-[1000/220]` (desktop) / `aspect-[5/3]` (mobile) wrapper so the chart breathes proportionally with width.

### 2. Adaptive tick density

Add a tiny SSR-safe `useIsNarrow()` hook (matches `(max-width: 767px)`). Use it to:

- **X-axis labels**: show every mile on desktop, every other mile on mobile (`0 MI`, `2 MI`, `4 MI`). Tick *marks* still render at every mile so the rhythm reads; only the text labels thin out.
- **Y-axis labels**: 5 ticks on desktop, 3 ticks on mobile. Gridlines stay at all 5 positions for visual rhythm.

### 3. Scale font sizes for SVG text

Bump SVG label font size from `10` to `11` on desktop, `13` on mobile (when narrow), since mobile renders the SVG smaller per-pixel. Tighten letter-spacing on mobile from `0.18em` to `0.12em` so labels don't run into adjacent ticks.

### 4. Slightly larger bottom padding on mobile

Bump `PAD_B` from `28` to `34` when narrow so the larger MI labels have room and don't clip against the footer rule.

### 5. Footer legend hides earlier

Currently the swatch legend hides under `md:`. Keep that — it's already correct — but compact the "mocked profile" caption: stack vertically on `<sm` so it doesn't crowd into the right edge.

### 6. Stat header — already correct, no change

The 4-column stat grid already collapses to `col-span-4` on mobile (3 stats per row + label row). Verified — leave it alone.

## Brand spacing preserved

- Outer `px-5 md:px-8 py-5 md:py-6` paddings unchanged.
- Top/bottom border-2 ink rules unchanged.
- Sky highlight on GAIN stat unchanged.
- Underlined "profile" wordmark unchanged.
- Hard-left alignment unchanged.

## Out of scope

No layout/structure changes outside the chart component. No new dependencies.

## Approve to proceed

Approve and I'll make these edits in one pass and verify with `tsc --noEmit`.