# Siddhant Seal Portfolio Projects

This repository contains deployable full-stack projects for Siddhant Seal:

- Full-Stack E-Commerce Web Application
- Real-Time Collaborative Task Manager

Live site: https://siddhant-portfolio-iota.vercel.app

The live app is built with Next.js, React, TypeScript, and API routes. A Socket.io backend implementation is included under `backend/socket-server` for the collaborative task manager.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project Routes

- `/commerce` - product catalog, filtering, cart management, realtime cart sync, and checkout APIs
- `/tasks` - collaborative workspace board with local real-time sync across browser tabs
- `/contact` - customer support form with email confirmation via Resend when environment variables are configured

## Contact Email Setup

Set these Vercel environment variables to send real contact-form emails:

```bash
RESEND_API_KEY=your_resend_api_key
CONTACT_FROM_EMAIL="SealCart Support <support@yourdomain.com>"
CONTACT_TO_EMAIL="your-inbox@example.com"
```

`CONTACT_TO_EMAIL` is optional. When present, SealCart also sends the site owner a copy of the customer message.

## Google Login Setup

Set these Vercel environment variables to enable real Google OAuth login:

```bash
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=https://siddhant-portfolio-iota.vercel.app/api/auth/google/callback
```

Add the same redirect URI in the Google Cloud OAuth client settings.

## Deploy

This app is ready for Vercel:

```bash
npm run build
npx vercel --prod
```
