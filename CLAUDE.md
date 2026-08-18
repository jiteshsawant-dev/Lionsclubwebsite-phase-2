# Lions Club of Byculla — Project Guide

## Project Overview

Static website for the Lions Club of Byculla. Built with vanilla HTML, CSS, and JavaScript. No build system or framework.

## Key Files

- `css/styles.css` — design tokens (`:root`) + base components
- `css/light-redesign.css` — **the current design language; final authority.** ~50 `!important` rules that override `styles.css`
- `styleguide.html` — visual style guide; loads the same cascade production does
- `js/` — vanilla JS scripts
- `images/` — image assets

## CSS Cascade — read before styling anything

Every production page loads, in this order:

```
styles.css  →  light-redesign.css  →  [nav-submenu | about-pages | campaigns | hero-light-reveal]
```

**`light-redesign.css` wins on everything it touches.** `styles.css` describes the pre-redesign
look for these components, so reading it alone will give you a retired style:

```
.btn-gold  .btn-outline  .card  .news-card  .voice-card  .method
.story-feature  .stepper::before  .step .node  .stat .num  .join-stat  nav.main
```

Concrete example: `styles.css` styles `.btn-outline` as an uppercase pill with a border and an
arrow SVG. `light-redesign.css` overrides it into a **plain sentence-case serif text link with an
animated underline, no border, no arrow**. The pill is dead. Same for `.btn-gold`.

## Instructions

**Follow `styleguide.html` when creating or modifying webpages and UI components** — start with its
*CSS Cascade* section. The guide loads `styles.css` + `light-redesign.css`, so its demos render
exactly what ships.

- Use the design tokens in `css/styles.css` (`var(--navy)`, `var(--gold)`, `var(--rule)`). No raw hex outside `:root`.
- **Never hand-write `font-size`/`font-weight` for serif text.** Use a type token:
  `font: var(--type-panel-title)` — also `--type-display`, `--type-section-title`,
  `--type-lead`, `--type-quote`, `--type-label`. Colours were always tokenised and so were
  always correct; type was not, which is why 132 distinct serif combinations exist against a
  documented scale of 6. If no token fits, ask rather than inventing a value.
  (`--type-label` still needs its own `letter-spacing`/`text-transform`.)
- **Reuse the shared class; never re-implement it.** Need a button? Write `class="btn-outline"`.
  Do not hand-write padding/border/radius for a lookalike in a page-level stylesheet — those
  survive redesigns and become visual bugs.
- Page-scoped CSS may **position and space** a component (grid, margin, alignment) but must not
  restyle its colour, border, radius, or typography.
- Never copy CSS out of `styleguide.html`'s `<style>` block — those `.sg-*` rules are the guide's
  own chrome. Copy the class *names* from the demos.
- Maintain visual consistency with existing pages.

## Background & Text Color Rules

For the correct text colors per section background, always refer to `styleguide.html` — it is the single source of truth for all background/text color pairings.
