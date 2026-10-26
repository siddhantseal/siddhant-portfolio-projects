# MoneyFollows

MoneyFollows is a responsive personal finance app for tracking real income, expenses, transfers, wallets, notes, reminders, and monthly spending patterns.

## Features

- Real Firebase Authentication with email/password and Google sign-in
- First-run name capture for personalized greetings
- Income, expense, and transfer logging
- Food and grocery merchant details
- Product or bill image attachment
- Search, filters, reminders, notes, wallets, stats, and CSV export
- Worldwide currency selection
- Dark mode and light mode
- Responsive layout for desktop, laptop, tablet, Android, iOS, and modern browsers
- Installable PWA support for Android, iOS, Windows, macOS, and desktop browsers

## Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with your Firebase Web App config.

## Firebase Setup

In Firebase Console:

1. Create a Web App.
2. Enable Authentication.
3. Enable Email/Password and Google providers.
4. Add your local and production domains to Authentication > Settings > Authorized domains.
5. Add the values from your Firebase Web App config to Vercel environment variables.

Required Vite variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Checks

```bash
npm run lint
npm run build
```

## Install On Devices

MoneyFollows is configured as a Progressive Web App.

- Android Chrome: open the Vercel URL, then tap **Install app** or **Add to Home screen**.
- iPhone/iPad Safari: open the Vercel URL, tap **Share**, then **Add to Home Screen**.
- Windows/macOS Chrome or Edge: open the Vercel URL and use the install icon in the address bar.

For Play Store or App Store distribution, wrap this web app with a native shell such as Capacitor and publish through Google Play Console or Apple Developer. The PWA is the cross-platform version that works immediately from the same URL.
