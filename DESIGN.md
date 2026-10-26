# SealCart Design System

SealCart uses Impeccable's Neo Kinpaku direction as the project standard.

## Tokens

- Base: warm paper in light mode, lacquer black in dark mode.
- Accent: kinpaku gold for primary actions, brand marks, and selected states.
- Support accent: verdigris patina for confirmation, secondary emphasis, and data accents.
- Avoid pure black, pure white, flat gray, generic blue, and generic green as dominant colors.

## Typography

- Body: Albert Sans through `next/font`.
- Display and brand: Alumni Sans through `next/font`.
- Keep body text compact and readable. Hero scale is reserved for the homepage and route heroes.
- Avoid negative letter spacing.

## Components

- Primary actions use gold fill with dark lacquer text.
- Secondary actions use a transparent or panel fill with gold borders.
- Inputs, selects, cards, and tool panels use small radii from 4px to 8px.
- Cards are for products, forms, repeated records, and framed tools only. Do not place cards inside cards.
- Motion should support attention and state changes. Use short ease transitions, not bounce or elastic motion.

## Layout

- Desktop views should use the full available width with a centered max width of 1180px.
- Mobile views keep controls reachable and avoid hidden overflow.
- Every page should keep the same header, control, card, and footer language unless a page has a functional reason to differ.

## Accessibility

- Keep focus states visible.
- Preserve labels, `aria-label` values, and semantic elements.
- Maintain contrast in both light and dark modes before shipping a visual change.
