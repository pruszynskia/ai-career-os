# Colors

Brand direction: **Midnight Mint** — a near-black/near-white neutral ramp
(no warm or cool tint) with a single **teal** accent (`#2DD4BF` dark /
`#0F766E` light) carrying every primary-action, link, focus-ring, selection
and progress meaning. This supersedes the previous neutral-ramp-plus-amber
system (see ADR-023, which itself supersedes the design decision it
replaces — ADR-023's Alternatives Considered has the history).

All tokens live in [`docs/design-system/tokens.json`](./tokens.json), the
source of truth `src/app/globals.css`'s `:root` (light) and `.dark` blocks
are rewritten from (TASK-091). Each token's `css` field is the CSS custom
property name; there is no separate theming mechanism beyond the existing
`.dark` class toggle.

## Palette

| Role | Dark | Light | CSS var | Use |
|---|---|---|---|---|
| Canvas | `#0A0E14` | `#FFFFFF` | `--background` | Page background |
| Sidebar | `#000000` | `#F6F7F9` | `--sidebar` | App sidebar, mobile tab bar, status footer |
| Sunken | `#07090D` | `#F2F4F6` | `--surface-sunken` | Inputs (dark), table group headers, closed lanes |
| Raised | `#161B24` | `#FFFFFF` | `--popover` | Dialogs, popovers, menus, toasts (always with overlay shadow) |
| Hover / selected | `#1C1F26` | `#F4F5F7` | `--muted` | Row/nav hover, selected row, active nav item, skeleton blocks |
| Border subtle | `#1C1F26` | `#E6E8EC` | `--border` | Row dividers, section rules |
| Border default | `#2D3642` | `#D2D6DC` | `--border-default` | Cards/sections, buttons (secondary), chips, table containers |
| Border control | `#5B6778` | `#7A8494` | `--input` | Text inputs, selects, textareas, checkboxes (≥3:1, WCAG 1.4.11) |
| Border strong | `#AEB6C2` | `#2D3642` | `--border-strong` | Featured card (Pro plan), selected chip |
| Text primary | `#E8ECF1` | `#0A0E14` | `--foreground` | Default body / high-emphasis text |
| Text secondary | `#AEB6C2` | `#2D3642` | `--foreground-secondary` | Secondary text |
| Text muted | `#818B99` | `#5B6472` | `--muted-foreground` | Meta, captions, placeholders, table headers |
| **Accent (teal)** | `#2DD4BF` | `#0F766E` | `--primary` | Primary buttons, links on dark, focus ring, progress, selection edge, score bars |
| Accent hover | `#5EEAD4` | `#115E59` | `--primary-hover` | Hover state |
| Accent pressed | `#14B8A6` | `#134E4A` | `--primary-pressed` | Pressed state |
| Accent subtle | `#0B2A28` | `#E6F7F5` | `--primary-subtle` | Success banner, drop-target fill |
| Text on accent | `#042F2E` | `#FFFFFF` | `--primary-foreground` | Text on filled `--primary` |
| Warning (urgency) | `#F5B452` | `#B45309` | `--warning` | Follow-up due, expiring, pending connection, notification dot — urgency only |
| Warning subtle | `#2A2211` | `#FEF4E6` | `--warning-subtle` | Warning banner fill |
| Danger | `#F87171` | `#C2261D` | `--destructive` | Errors, destructive actions |
| Danger hover | `#FCA5A5` | `#A31F17` | `--destructive-hover` | Hover state |
| Danger subtle | `#2A1215` | `#FDECEC` | `--destructive-subtle` | Danger banner fill |
| Text on danger | `#140404` | `#FFFFFF` | `--destructive-foreground` | Text on filled `--destructive` |
| Success | alias of accent.default | alias of accent.default | `--success` | Positive status |
| Tier 1 (Apply immediately) | `#2DD4BF` | `#0D9488` | `--tier-1` | |
| Tier 2 (Strong opportunity) | `#0D9488` | `#134E4A` | `--tier-2` | |
| Tier 3 (Consider) | `#5B6778` | `#8A94A3` | `--tier-3` | |
| Tier 4 (Ignore) | `#2D3642` | `#D2D6DC` | `--tier-4` | |
| Tier 5 (Not scored) | 1px dashed `--muted-foreground`, no fill | same | `--tier-5` | |
| Chart fill | alias of accent.default | alias of accent.default | `--chart-fill` | Score/usage bar fill |
| Chart track | `#2D3642` | `#E6E8EC` | `--chart-track` | Score/usage bar track |
| Focus ring | alias of accent.default | alias of accent.default | `--ring` | 2px solid, 2px offset, every interactive element via `:focus-visible` |
| Scrim | `rgba(0,0,0,.62)` | `rgba(10,14,20,.32)` | `--scrim` | Dialog/overlay backdrop |

**Retired:** `--accent` as amber (its interactive-hover role is now
`--muted`, a neutral surface, not a colour), `--info` / `--info-foreground`
(no blue in the system), `--signal-gold`, the `--chart-step-1..5` ramp, and
the secondary display face — `--font-heading` / `--font-display` — see
[`typography.md`](./typography.md).

## Colour budget

Mostly neutral (canvas/sidebar/sunken/raised surfaces and border hairlines),
with teal reserved for the single dominant action per region — the focus
ring, the one primary button, links, progress and selection state — and
warning/danger reserved for urgency and destructive actions only. A screen
with several teal elements competing at once, or a status colour used for
emphasis rather than status, is a spec violation, not a style choice.

## WCAG AA contrast (verified)

Ratios computed from the token hex values above via the WCAG 2
relative-luminance formula, not assumed — this table mirrors
`scripts/check-tokens.py`'s pair list, the runnable gate for these numbers.
Minimum required: 4.5:1 for body text, 3:1 for non-text UI components such
as a focus ring or a control border (WCAG 2.1 SC 1.4.11).

| Pair | Dark | Light | Result |
|---|---|---|---|
| text.primary / background.canvas | 16.30 | 19.34 | Pass (body text) |
| text.secondary / background.canvas | 9.46 | 12.22 | Pass (body text) |
| text.muted / background.canvas | 5.61 | 5.98 | Pass (body text) |
| status.warning / background.canvas | 10.62 | 5.02 | Pass (body text) |
| status.danger / background.canvas | 6.99 | 5.85 | Pass (body text) |
| focus.ring / background.canvas | 10.39 | 5.47 | Pass (3:1 focus indicator) |
| accent.default / background.canvas | 10.39 | 5.47 | Pass (body text — teal as link/text) |
| text.onAccent / accent.default | 7.77 | 5.47 | Pass (primary button label) |
| status.onDanger / status.danger | 7.24 | 5.85 | Pass (danger button label) |
| text.primary / status.warningSubtle | 13.25 | 17.77 | Pass (banner text) |
| status.warning / status.warningSubtle | 8.64 | 4.61 | Pass (3:1 banner icon) |
| text.primary / status.dangerSubtle | 14.80 | 16.93 | Pass (banner text) |
| status.danger / status.dangerSubtle | 6.35 | 5.12 | Pass (3:1 banner icon) |
| border.control / background.canvas | 3.37 | 3.78 | Pass (3:1 input boundary) |
| border.control / background.sunken | 3.47 | 3.43 | Pass (3:1 input boundary) |
| data.barFill / data.barTrack | 6.57 | 4.46 | Pass (3:1 score bar) |
| tier.applyImmediately / background.sunken | 10.70 | 3.40 | Pass (3:1 tier marker) |
| tier.strongOpportunity / background.sunken | 5.32 | 8.59 | Pass (3:1 tier marker) |

`scripts/check-tokens.py` checks the full 48-pair matrix (every text role
against every background, plus the accent/status/tier/data pairs above) for
both themes — all 48 pairs pass in both themes as of this token set. Run
`npm run check-tokens -- -v` for the complete list.

## Dark mode

Dark is the default theme (`next-themes` applies the `.dark` class before
first paint; Light is opt-in via the toggle in Settings). Its palette is a
designed inversion, not an auto-inverted copy of the light values — every
dark value above was independently tuned for legibility and elevation.

## Radius

`radius.lg` (12px, `--radius-lg` / `rounded-xl`) is reserved for dialogs and
product frames only — see [`ui-principles.md`](./ui-principles.md)'s
guardrail checklist. `radius.md` (8px) covers cards, table containers,
menus, popovers, toasts and banners; `radius.sm` (6px) covers controls
(buttons, inputs, selects, chips); `radius.xs` (4px) covers tier markers and
tiny chips; `radius.full` covers avatars, dots and stage rings.

## Motion

`motion.duration` (fast 100ms, base 160ms, slow 240ms) and
`motion.easing` (`cubic-bezier(0.2, 0, 0, 1)`) in `tokens.json` are the
values `--dur-fast`/`--dur`/`--dur-slow`/`--ease` in `globals.css` are
rewritten from. Reduced motion stays opacity-only fades at `duration.fast`
(existing `globals.css` rule).

## Usage

- Reach for the semantic token (`bg-primary`, `text-foreground`,
  `bg-success`), never a raw hex value in component code.
- `--primary` (teal) is the single accent: primary buttons, links, focus
  ring, progress, selection edge and score bars. It is not split across an
  "accent" and a separate "ring" concept the way the retired amber system
  was.
- `--warning`/`--destructive` are status-only, restricted to their stated
  `use` in the palette table above — never used for emphasis or decoration.
- Do not introduce a color token outside `tokens.json` without updating this
  document first.
