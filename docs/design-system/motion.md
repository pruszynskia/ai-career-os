# Motion

Motion here is restraint: applying a small, consistent set of tokens to
transitions that already exist, never adding new movement to a screen that
doesn't have any.

## Tokens (`src/app/globals.css`)

| Token | Value | Use for |
|---|---|---|
| `--dur-fast` | 100ms | Overlay open/close (dialog, popover, select), active/press states |
| `--dur` | 160ms | Default — hover, focus, colour transitions |
| `--dur-slow` | 240ms | Reserved for a transition that genuinely needs to read as slower; nothing currently uses it |
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` | The single easing curve for every transition |

`--default-transition-duration` and `--default-transition-timing-function`
(Tailwind's own theme variables) are overridden in the `@theme inline` block
to `var(--dur)` / `var(--ease)`. That means every `transition-*` utility
(`transition-colors`, `transition-all`, `transition-opacity`, ...) already
uses the token by default — a component only needs an explicit
`duration-[var(--dur-fast)]` when it deliberately wants the faster tier.

The `data-open:animate-in`/`data-closed:animate-out` overlay animations
(`tw-animate-css`) are a separate mechanism from `transition-*` — they read
`--tw-duration`/`--tw-ease`, which the theme override above does not touch.
Each of the three overlays (`src/shared/ui/dialog.tsx`'s overlay and
content, `Popover.tsx`, `Select.tsx`) therefore carries both
`duration-[var(--dur-fast)]` and `ease-[var(--ease)]` explicitly — Tailwind's
`ease-*` utility is the one that actually sets `--tw-ease` (not just
`transition-timing-function`), so it's the correct way to opt an
`animate-in`/`animate-out` element into the token; a plain `ease-*` utility
with a literal keyword (`ease-in`, `ease-out`, ...) is still banned. No
component should ever write a literal millisecond value.

## Transform budget

Per interaction (hover, focus, press):

- Opacity and translate only, translate capped at 4px (`translate-y-1` or
  smaller).
- No `scale` on hover.
- No rotation.
- No spring or bounce easing.

Radix overlay enter/exit animations (`data-open:zoom-in-95` on
`DialogContent`/`PopoverContent`/`SelectContent`) are the one exception:
they're a one-shot open/close transform on a component that has no other
motion, not a hover interaction, and are neutralized under reduced motion
(below).

## Reduced motion

`globals.css` has a `@media (prefers-reduced-motion: reduce)` block that
resets the `tw-animate-css` enter/exit transform and blur variables
(`--tw-enter-scale`, `--tw-enter-translate-*`, `--tw-enter-rotate`,
`--tw-enter-blur` and their `exit` counterparts), `--tw-ease`, to neutral,
and restricts every `transition-property` to opacity/colour properties at
`--dur-fast`. This is scoped to the transform/blur *variables* and the
transition *property list* — not a blanket `transform: none`, which would
also erase layout-positioning transforms like `DialogContent`'s centering
`-translate-x-1/2 -translate-y-1/2`. Net effect: overlays still fade in/out,
nothing slides, scales, rotates or blurs.

`Skeleton`'s `animate-pulse` and `Spinner`'s `animate-spin` are left running
under reduced motion — both are functional loading indicators (state is
still "in progress"), not decoration, the same distinction
`ui-principles.md` draws for accent colour.

## Banned patterns

- Fade-up (or any entrance transform) on every element as it mounts.
- Parallax.
- Looping or idle animation that isn't communicating an in-progress state
  (a spinner or skeleton pulse is fine; an idle bounce or float is not).
- Decorative shimmer (`shadcn/tailwind.css` ships a `.shimmer` utility;
  nothing in this app uses it — keep it that way).
- An animation or scroll library. Tailwind + `tw-animate-css` are sufficient
  for what this app needs.
