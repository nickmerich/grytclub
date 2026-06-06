## Rewrite "Who shows up" paragraph

### Goal
Replace the current "Who shows up" body paragraph with a version that emphasizes the core group identity and adds richer context.

### Current text (lines 521-525)
> "We're not for everyone, and we're not trying to be. We're mostly 30+ former athletes who needed a group to grind with. Come find your people. We'll hold the time, the route, and the ritual."

### New text
> "We're not for everyone, and we're not trying to be. Our core group is 30+ year-old parents, former athletes, and friends who wanted to find time on the schedule to grind together — and that's how this run club was birthed. We meet Saturday at 7 AM on the Montour/Peters Trail in McMurray. Run a few miles, talk through mile two, stay for coffee. Any pace. Just you and a pair of shoes."

### Changes
- Single file edit: `src/routes/index.tsx`, lines 521-525
- Keeps the opening hook ("We're not for everyone...")
- Expands the core group description with parents + friends + the origin story
- Weaves in the Saturday ritual, location, pace, and post-run coffee context
- Maintains gritty/athletic tone consistent with the brand voice

### Technical details
- No new dependencies
- No component changes
- Pure text swap within existing `<p>` tag