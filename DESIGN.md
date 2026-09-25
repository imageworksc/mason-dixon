# Mason Dixon Animal Emergency Hospital — Design System

Source of truth for every color, type size, spacing value, and motion curve used on the
site. The live homepage (`index.html` + `assets/css/style.css`) established these tokens;
the two alternative homepages (`option-a/`, `option-b/`) reuse them and add only what is
listed under their own heading.

## 1. Brand tokens (shared by every version)

| Token | Value | Use |
|---|---|---|
| `--color-navy` | `#242667` | Primary brand, headings, dark sections |
| `--color-navy-dark` | `#1a1b4e` | Alert bar, footer, deepest surfaces |
| `--color-red` | `#c01d2e` | Emergency accent, primary CTA |
| `--color-red-dark` | `#9c1622` | CTA hover |
| `--color-slate` | `#56566a` | Body copy on light |
| `--color-gray` | `#6b6b78` | Secondary copy on light (AA at small sizes) |
| `--color-border` | `#e0e0e8` | Hairlines on light |
| `--color-bg-light` | `#f5f5f7` | Tinted light surface |
| `--color-bg-faq` | `#eef0fa` | FAQ surface |
| `--text-on-dark-secondary` | `rgba(255,255,255,.85)` | Body on navy |
| `--text-on-dark-muted` | `rgba(255,255,255,.65)` | Captions on navy |

**Type.** Display: `Be Vietnam Pro` 600–800. Body: `Inter` 400–600. Both loaded from Google
Fonts with `display=swap`. Headings use `letter-spacing: -0.02em` and `line-height: 1.05–1.1`.

**Spacing scale.** 4px base: `--space-1` (0.25rem) → `--space-10` (8rem).
Section rhythm: `--section-space: clamp(5rem, 9vw, 11rem)`.

**Radius.** `sm 4px · md 8px · lg 14px · xl 20px · 2xl 2rem · full 999px`.

**Motion.** Two curves only:
- `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` — reveals, lifts, slides (0.5–0.9s).
- `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — icon pops (0.3s).
GPU-only properties (`transform`, `opacity`, `filter`). Everything is gated behind
`prefers-reduced-motion`; with reduced motion the page is fully visible and static.

## 2. Hero video

All three pages use the hospital's official hero clip (`assets/video/hero.mp4`, MP4,
4.4 MB, from masondixonveter.com) as the hero background: `autoplay muted loop playsinline`,
`hero.jpg` as poster. `initHeroVideo` in each `main.js` never starts it for
`prefers-reduced-motion` users and pauses it while the hero is off-screen.

## 3. Large-screen scaling (4K / 5K)

All layout values are in `rem`, and the root font-size steps up with the viewport so the
page keeps its proportions on 2560, 3840 and 5120px wide displays instead of becoming a
thin strip in the center:

| Viewport | `html` font-size |
|---|---|
| < 1920px | 16px |
| ≥ 1920px | 17px |
| ≥ 2560px | 20px |
| ≥ 3440px | 24px |
| ≥ 3840px | 28px |
| ≥ 5120px | 36px |

Container width is `80rem` (1280px at 16px) so it grows with the root size.

## 4. File organisation (homepage and both options)

```
<page>/                (homepage uses assets/css and assets/js)
  index.html          markup only — no inline styles or scripts
  css/base.css        tokens, large-display scaling, reset, typography, layout utilities
  css/components.css  buttons, header + navigation, (ticker), mobile call bar
  css/sections.css    page sections in document order
  css/motion.css      scroll reveals and reduced-motion overrides
  js/head.js          one line, loaded synchronously: adds the `js` class before first paint
  js/main.js          ES module (deferred), const/let, arrow functions; one init per feature
```

Per-item values that used to be inline custom properties (`--i`, `--n`) are set with
`:nth-child()` rules in CSS.

CSS/JS references carry a `?v=yyyymmddhhmm` query so GitHub Pages' 10-minute cache never
serves stale files after a deploy. Run `node scripts/stamp-assets.js` before committing.

## 5. Option A — "Calm Clinical" (`option-a/`)

Direction: light, airy, editorial. The hero is the official video in full view with a
white gradient rising from the bottom; label, two-line headline, two-line copy and two
buttons sit bottom-left in navy. Atmosphere elsewhere comes from the bone watermark on
tinted sections and the floating paw scatter behind the final CTA. The **double-bezel**
frame (outer tinted shell + inner core with concentric radii) survives only on the
services photo — the why-us, team and CTA sections now use Option B's treatments.

Added tokens:

| Token | Value | Use |
|---|---|---|
| `--color-lavender` | `#e7e7f4` | Icon chips, bezel shell, hero label |
| `--color-navy-900` | `#12133a` | Darkest surface — why-us photo band, CTA backdrop |
| `--shadow-float` | `0 30px 60px -24px rgba(16,24,64,.28)` | Floating cards |
| `--shadow-soft` | `0 12px 32px -12px rgba(16,24,64,.16)` | Card hover |

Type scale is deliberately close to the live homepage (h1 ≤ 3.5rem, h2 ≤ 2.6rem) so
headings never dominate a viewport.

No eyebrow labels above headings — the hero status label is the only one left. Buttons
use `--radius-sm` (4px) with plain inline icons; only the alert badge, icon circles and
the carousel arrows stay fully round.

Primitives: full-width white header (hairline below, shadow once scrolled, links
right-aligned with a red underline on hover, "Open 24/7" live indicator beside the call
button), symptom chip, process step card (white card on flat `--color-bg-light`; hover =
lift + shadow), hairline service row (icon circle + title + line, no card box) with a
quiet lavender CTA panel, why-us feature card grid over a photo band with a scroll
parallax, spotlight team card with an overlay caption (five-across grid on desktop, a
scroll-snap carousel with round arrow buttons below it), glass CTA card over
`--color-navy-900` with two blurred colour glows and the floating paw scatter,
narrow centred reviews teaser (quote glyph, heading, one line, arrow link to the
testimonials page), accordion item (grid-rows animation), sticky mobile call bar,
floating financing badge
(bottom-left double-bezel: tinted shell, navy gradient core, paw watermark that drifts on
hover, red percent chip; on screen from load, rides up above the sticky call bar when that slides in, chip-only under 640px). The why-us, team and CTA
primitives are shared with Option B.

Scroll reveals are keyframe animations with `fill-mode: backwards` (not transitions) so
they never override a primitive's own hover transitions.

## 6. Option B — "Emergency Bold" (`option-b/`)

Direction: dark, cinematic, urgent. Full-bleed photographic hero with a one-time slow
zoom (the page's signature moment), red ticker alert, sticky-stacking process cards,
overlay team cards, oversized red final CTA.

Added tokens:

| Token | Value | Use |
|---|---|---|
| `--color-navy-900` | `#12133a` | Hero base, darkest surface |
| `--color-red-bright` | `#e8303f` | Accent word in headings on dark (brand hue lifted to clear 3:1) |
| `--color-navy-700` | `#2d2f7a` | Raised surfaces on navy |
| `--color-surface-dark` | `rgba(255,255,255,.06)` | Cards on navy |
| `--color-line-dark` | `rgba(255,255,255,.14)` | Hairlines on navy |
| `--shadow-deep` | `0 40px 80px -30px rgba(0,0,0,.55)` | Stacking cards |

Primitives: transparent→solid header, full-screen overlay menu with staggered links,
ticker, numbered symptom row, stacking process card, service row, feature card,
spotlight team card (overlay caption), glass CTA card, accordion item, sticky mobile call bar.
