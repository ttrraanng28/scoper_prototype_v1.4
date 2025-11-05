# Environment Variables Documentation

This document provides a comprehensive reference for all environment variables used in the Claude Chat UI project.

## Overview

The project uses environment variables to configure both the frontend and backend components. Variables are handled differently depending on the deployment environment and component.

## Backend Environment Variables (Cloudflare Worker)

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `ANTHROPIC_API_KEY` | Secret | Your Anthropic API key for Claude integration | `sk-ant-api03-...` |

### Optional Variables

| Variable | Type | Description | Default | Example |
|----------|------|-------------|---------|---------|
| `FRONTEND_URL` | Secret | Allowed frontend URL for CORS validation | `*` (development) | `https://your-app.vercel.app` |

### Setting Backend Variables

#### Development
```bash
cd backend
wrangler secret put ANTHROPIC_API_KEY
# Enter your API key when prompted
```

#### Production
```bash
cd backend
wrangler secret put ANTHROPIC_API_KEY --env production
wrangler secret put FRONTEND_URL --env production
# Enter your production frontend URL
```

#### Viewing Secrets
```bash
# List all secrets (values are hidden)
wrangler secret list

# Delete a secret if needed
wrangler secret delete ANTHROPIC_API_KEY
```

## Frontend Environment Variables (React/Vite)

### Required Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `VITE_API_URL` | Backend API endpoint URL | `http://localhost:8787` | `https://your-worker.workers.dev` |

### Setting Frontend Variables

#### Development
Create `.env.local` in the frontend directory:
```bash
cd frontend
echo "VITE_API_URL=http://localhost:8787" > .env.local
```

#### Production (Vercel)
```bash
# Via Vercel CLI
vercel env add VITE_API_URL
# Enter your production worker URL

# Via Vercel Dashboard
# Go to Project Settings > Environment Variables
# Add: VITE_API_URL = https://your-worker.workers.dev
```

## Environment-Specific Configuration

### Development Environment
```bash
# Backend (runs on localhost:8787)
cd backend
wrangler secret put ANTHROPIC_API_KEY
wrangler dev

# Frontend (runs on localhost:5173)
cd frontend
echo "VITE_API_URL=http://localhost:8787" > .env.local
npm run dev
```

### Production Environment
```bash
# Backend
cd backend
wrangler secret put ANTHROPIC_API_KEY --env production
wrangler secret put FRONTEND_URL --env production
wrangler deploy --env production

# Frontend
cd frontend
vercel env add VITE_API_URL
vercel --prod
```

## Security Best Practices

### DO ✅
- Store sensitive values (API keys) as Cloudflare Worker secrets
- Use environment-specific configurations
- Include `.env*` files in `.gitignore`
- Use HTTPS URLs in production
- Restrict CORS to specific domains in production

### DON'T ❌
- Commit `.env` files to version control
- Hardcode API keys in source code
- Use HTTP URLs in production
- Allow all origins (`*`) in production CORS
- Share API keys in plain text

## Validation and Testing

### Backend Variable Validation
```bash
# Test that secrets are set correctly
wrangler secret list

# Test API endpoint
curl https://your-worker.workers.dev/
```

### Frontend Variable Validation
```bash
# Check if variables are loaded (development)
cd frontend
npm run dev
# Open browser console and check: import.meta.env.VITE_API_URL

# Check production build
npm run build
# Variables should be embedded in the built files
```

## Troubleshooting

### Common Issues

#### "API key not found" Error
```
Error: Authentication failed - API key not found
```
**Solution**: Ensure `ANTHROPIC_API_KEY` is set as a Cloudflare Worker secret

#### CORS Errors
```
Access blocked by CORS policy
```
**Solution**: Verify `FRONTEND_URL` matches your actual frontend domain exactly

#### "Cannot connect to API" Error
```
Failed to fetch from API endpoint
```
**Solution**: Check that `VITE_API_URL` points to the correct worker URL

#### Environment Variables Not Loading
```
import.meta.env.VITE_API_URL is undefined
```
**Solutions**:
- Ensure variable name starts with `VITE_`
- Restart development server after adding variables
- Check `.env.local` file exists and has correct format

### Debugging Commands

```bash
# Check Cloudflare Worker logs
wrangler tail

# Check Vercel deployment logs
vercel logs

# Test API endpoint directly
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"test","conversationHistory":[]}' \
  https://your-worker.workers.dev/chat
```

## Migration and Updates

### Updating API Keys
```bash
# Update Anthropic API key
cd backend
wrangler secret put ANTHROPIC_API_KEY --env production
wrangler deploy --env production
```

### Changing Domains
```bash
# Update frontend URL for CORS
cd backend
wrangler secret put FRONTEND_URL --env production
wrangler deploy --env production

# Update backend URL in frontend
vercel env add VITE_API_URL  # This will update existing value
vercel --prod
```

## Environment Files Reference

### `.env.local` (Frontend Development)
```bash
# Frontend development environment variables
VITE_API_URL=http://localhost:8787
```

### `.env.example` (Template)
```bash
# Copy this file to .env.local and fill in your values
VITE_API_URL=http://localhost:8787
```

### `wrangler.toml` (Backend Configuration)
```toml
name = "claude-chat-backend"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production]
name = "claude-chat-backend-prod"
```

## Quick Reference

### Development Setup
```bash
# Backend
cd backend && wrangler secret put ANTHROPIC_API_KEY && wrangler dev

# Frontend  
cd frontend && echo "VITE_API_URL=http://localhost:8787" > .env.local && npm run dev
```

### Production Deployment
```bash
# Backend
cd backend && wrangler secret put ANTHROPIC_API_KEY --env production && wrangler deploy --env production

# Frontend
cd frontend && vercel env add VITE_API_URL && vercel --prod

# Update CORS
cd backend && wrangler secret put FRONTEND_URL --env production && wrangler deploy --env production
```