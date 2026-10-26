# MoneyFollows

MoneyFollows is a responsive personal finance app for tracking real income, expenses, transfers, wallets, notes, reminders, and monthly spending patterns. It was built as a separate React + Vite project and is intentionally not connected to the SealCart or portfolio app.

## Features

- First-run welcome flow that asks for the user's name before entering the app
- Login/signup style options for Google, Facebook, Apple, plus local guest mode
- Dark mode and light mode
- Income, expense, and transfer entries
- Food and grocery merchant details, including restaurant/store and source app
- Product or bill image attachment by URL or upload
- Global search across entries, notes, accounts, merchant details, and descriptions
- Calendar, daily, monthly, total, stats, wallets, and notes views
- Dedicated notes section
- Payment and income reminders
- Opening balance and worldwide currency selection
- CSV export for spreadsheet use
- Money meme gallery and MoneyFollows motivational visuals
- Local-first data storage with no fake/sample spending added automatically
- Responsive layout for desktop, laptop, tablet, Android, iOS, and modern browsers

## Tech Stack

- React
- TypeScript
- Vite
- Motion
- Lucide React
- CSS custom properties for theming

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Quality Checks

```bash
npm run lint
npm run build
```

## Production Build

```bash
npm run build
```

The static output is generated in `dist/`.

## Deploy On Vercel

When deploying this subproject from the repository, set the Vercel root directory to:

```text
moneyfollows
```

Use these commands from inside the `moneyfollows` folder:

```bash
npm install
npm run build
npx vercel deploy --prod
```

## Notes

The social login buttons are prepared as professional UI entry points. Real OAuth requires provider credentials and backend/session handling before connecting them to production authentication.
