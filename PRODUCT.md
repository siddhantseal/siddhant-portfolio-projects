# SealCart Product Notes

SealCart is an e-commerce storefront for browsing departments, searching products, managing a cart, checking out, tracking orders, editing an account, and contacting support.

## What Must Stay Stable

- Product, cart, checkout, order, account, auth, and contact flows keep their existing APIs and state behavior.
- Route names and navigation stay compatible with the current app.
- Visual changes should come through shared tokens and reusable classes before page-specific overrides.

## Design Goals

- Make the app feel like a real shopping product, not a generated landing page.
- Keep the catalog dense enough for browsing and comparison.
- Use restrained surfaces, precise typography, and clear action hierarchy.
- Use images where the user needs product context.
- Keep dark mode first class across forms, search, product cards, checkout, and account pages.
