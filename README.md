# Siddhant Seal Portfolio Projects

This repository contains deployable proof projects for Siddhant Seal's resume:

- Full-Stack E-Commerce Web Application
- Real-Time Collaborative Task Manager

The live app is built with Next.js, React, TypeScript, and API routes. A Socket.io backend implementation is included under `backend/socket-server` for the collaborative task manager.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project Routes

- `/commerce` - product catalog, filtering, cart management, checkout API simulation
- `/tasks` - collaborative workspace board with local real-time sync across browser tabs

## Deploy

This app is ready for Vercel:

```bash
npm run build
npx vercel --prod
```
