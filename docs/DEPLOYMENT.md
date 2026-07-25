# Frontend Deployment (Vercel)

This guide covers deploying the Games Night UI to Vercel.

## Quick Start

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import this repository
4. Vercel auto-detects Vite - just click Deploy!

### 2. Environment Variables

Add these in Vercel project settings:

| Variable       | Value           | Example                                  |
| -------------- | --------------- | ---------------------------------------- |
| `VITE_API_URL` | Backend API URL | `https://games-night-api.up.railway.app` |
| `VITE_WS_URL`  | WebSocket URL   | `wss://games-night-api.up.railway.app`   |

### 3. GitHub Secrets (for CI/CD)

Add these to repository secrets:

| Secret              | How to get it                     |
| ------------------- | --------------------------------- |
| `VERCEL_TOKEN`      | Vercel Settings → Tokens          |
| `VERCEL_ORG_ID`     | Vercel Project Settings → General |
| `VERCEL_PROJECT_ID` | Vercel Project Settings → General |

## Deployment Triggers

- **Production**: Push to `main` branch
- **Preview**: Every pull request gets a unique URL

## Commands

```bash
# Build locally (same as Vercel)
npm run build

# Preview production build
npm run serve
```

## Vercel Configuration

The `vercel.json` file configures:

- SPA routing (all routes → index.html)
- Asset caching (1 year for /assets/\*)
- Security headers

## Troubleshooting

**Build failing?**

```bash
# Test build locally first
npm run build
```

**API not connecting?**

- Check `VITE_API_URL` is set correctly
- Ensure backend allows CORS from your Vercel domain

**Preview not deploying?**

- Check GitHub Actions permissions
- Verify `VERCEL_TOKEN` secret is set
