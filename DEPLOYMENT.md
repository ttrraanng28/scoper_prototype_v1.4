# Deployment Guide

This guide covers deploying the Claude Chat UI to production environments.

## Prerequisites

- Node.js 18+ installed
- Cloudflare account with Workers enabled
- Vercel account (or GitHub account for Vercel integration)
- Anthropic API key

## Backend Deployment (Cloudflare Workers)

### 1. Install Wrangler CLI

```bash
npm install -g wrangler@4
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Set Environment Variables

Set the Anthropic API key as a secret:
```bash
cd backend
wrangler secret put ANTHROPIC_API_KEY
# Enter your Anthropic API key when prompted
```

### 4. Deploy the Worker

```bash
cd backend
npm install
# Deploy to production environment
wrangler deploy --env production
```

### 5. Note the Worker URL

After deployment, note the worker URL (e.g., `https://claude-chat-backend.your-subdomain.workers.dev`)

## Frontend Deployment (Vercel)

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel@latest
```

2. Deploy from frontend directory:
```bash
cd frontend
vercel
```

3. Set environment variable:
```bash
vercel env add VITE_API_URL
# Enter your worker URL from step 5 above
```

4. Redeploy to apply environment variables:
```bash
vercel --prod
```

### Option B: Deploy via GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
4. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: Your worker URL from backend deployment

## Post-Deployment Configuration

### Update CORS Configuration

After deploying the frontend, update the worker's CORS configuration:

1. Set the frontend URL as a secret:
```bash
cd backend
wrangler secret put FRONTEND_URL
# Enter your Vercel URL (e.g., https://your-app.vercel.app)
```

2. Redeploy the worker:
```bash
wrangler deploy --env production
```

## Testing Production Deployment

1. Visit your Vercel URL
2. Send a test message
3. Verify the conversation works end-to-end
4. Test on mobile devices for responsiveness

## Environment Variables Summary

### Backend (Cloudflare Worker)
- `ANTHROPIC_API_KEY`: Your Anthropic API key (set via `wrangler secret`)
- `FRONTEND_URL`: Your Vercel deployment URL (set via `wrangler secret`)

### Frontend (Vercel)
- `VITE_API_URL`: Your Cloudflare Worker URL

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in worker secrets
- Check that the frontend is using the correct API URL
- Verify both deployments are using HTTPS

### API Errors
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check Cloudflare Worker logs: `wrangler tail`
- Ensure API key has sufficient credits

### Build Errors
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility
- Verify all environment variables are set

## Development vs Production

### Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787` (via `wrangler dev`)
- CORS allows localhost origins

### Production
- Frontend: `https://your-app.vercel.app`
- Backend: `https://claude-chat-backend.your-subdomain.workers.dev`
- CORS restricted to production domains