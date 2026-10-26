# MoneyFollows Product Notes

MoneyFollows is a personal money management app for logging income, expenses, transfers, notes, reminders, accounts, targets, and monthly insight.

## What Must Stay Stable

- Users decide every entry. The app must not create fake expenses.
- Firebase email and Google authentication stay wired through the existing environment variables.
- Notes, accounts, reminders, attached images, currency selection, export, search, filters, dark mode, and local persistence stay available.
- The app runs as a responsive web app across desktop, tablet, and phone browsers.

## Design Goals

- Feel like a polished finance product, not a copied expense tracker.
- Keep money actions fast: log, search, filter, review, and correct entries without clutter.
- Use product and bill images as context, not decoration.
- Keep memes as personality accents, never as the main interface.
- Support dark mode and light mode with equal contrast and legibility.
