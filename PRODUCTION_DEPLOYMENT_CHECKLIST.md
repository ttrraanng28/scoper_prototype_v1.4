# Production Deployment Checklist

This checklist ensures proper deployment and testing of the Claude Chat UI in production.

## Pre-Deployment Checklist

- [ ] Anthropic API key obtained and tested
- [ ] Cloudflare account set up with Workers enabled
- [ ] Vercel account ready (or GitHub connected to Vercel)
- [ ] Domain names decided (if using custom domains)

## Step 1: Deploy Backend Worker

### Deploy Commands
```bash
cd backend
npm install  # This will install wrangler 4.x
wrangler login
wrangler secret put ANTHROPIC_API_KEY --env production
wrangler deploy --env production
```

### Verification Steps
- [ ] Worker deployed successfully
- [ ] Worker URL noted: `https://claude-chat-backend.YOUR_SUBDOMAIN.workers.dev`
- [ ] Health check endpoint responds: `GET /` returns status "ok"
- [ ] Test basic CORS: OPTIONS request returns proper headers

### Test Backend Deployment
```bash
# Test health endpoint
curl https://claude-chat-backend.YOUR_SUBDOMAIN.workers.dev/

# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://claude-chat-backend.YOUR_SUBDOMAIN.workers.dev/chat
```

Expected responses:
- Health check: `{"status":"ok","message":"Claude Chat Backend is running","environment":"production"}`
- CORS preflight: Headers include `Access-Control-Allow-Origin`

## Step 2: Deploy Frontend

### Via Vercel CLI
```bash
cd frontend
npm install
vercel
# Follow prompts, note the deployment URL
vercel env add VITE_API_URL
# Enter: https://claude-chat-backend.YOUR_SUBDOMAIN.workers.dev
vercel --prod
```

### Via GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
4. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: `https://claude-chat-backend.YOUR_SUBDOMAIN.workers.dev`

### Verification Steps
- [ ] Frontend deployed successfully
- [ ] Frontend URL noted: `https://YOUR_APP.vercel.app`
- [ ] Build completed without errors
- [ ] Environment variables set correctly

## Step 3: Update CORS Configuration

```bash
cd backend
wrangler secret put FRONTEND_URL --env production
# Enter: https://YOUR_APP.vercel.app
wrangler deploy --env production
```

### Verification Steps
- [ ] CORS updated with production frontend URL
- [ ] Worker redeployed successfully

## Step 4: End-to-End Testing

### Manual Testing Checklist

#### Basic Functionality
- [ ] Frontend loads without console errors
- [ ] Chat interface displays correctly
- [ ] Message input field is functional
- [ ] Send button works

#### Chat Functionality
- [ ] Can send a simple message (e.g., "Hello")
- [ ] Receives AI response within reasonable time (< 30 seconds)
- [ ] Response displays with proper formatting
- [ ] Can send follow-up messages
- [ ] Conversation context is maintained

#### Error Handling
- [ ] Network error handling (disconnect internet, try to send)
- [ ] Invalid input handling (empty messages)
- [ ] API error handling (if API key is invalid)
- [ ] Loading states display correctly

#### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Touch interactions work on mobile
- [ ] Text is readable on all screen sizes

#### Session Persistence
- [ ] Send a few messages
- [ ] Refresh the page
- [ ] Verify conversation history is restored
- [ ] Verify can continue conversation after refresh

### Automated Testing Commands

```bash
# Test API endpoint directly
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: https://YOUR_APP.vercel.app" \
  -d '{"message":"Hello, can you help me with my business?","conversationHistory":[]}' \
  https://claude-chat-backend.YOUR_SUBDOMAIN.workers.dev/chat

# Expected: JSON response with "response" field containing AI reply
```

### Performance Testing
- [ ] Initial page load < 3 seconds
- [ ] Message send/receive < 30 seconds
- [ ] No memory leaks during extended use
- [ ] Smooth scrolling with long conversations

## Step 5: Production Monitoring

### Health Checks
Set up monitoring for:
- [ ] Frontend uptime (Vercel provides this)
- [ ] Backend worker health endpoint
- [ ] API response times
- [ ] Error rates

### Logging
- [ ] Check Cloudflare Worker logs: `wrangler tail`
- [ ] Monitor Vercel function logs
- [ ] Set up error alerting if needed

## Rollback Plan

If issues are discovered:

### Frontend Rollback
```bash
# Via Vercel CLI
vercel rollback
```
Or use Vercel dashboard to rollback to previous deployment

### Backend Rollback
```bash
# Redeploy previous version
git checkout PREVIOUS_COMMIT
cd backend
wrangler deploy
```

## Security Checklist

- [ ] API keys stored as secrets (not in code)
- [ ] CORS properly configured (not allowing all origins)
- [ ] HTTPS enforced on all endpoints
- [ ] No sensitive data in client-side code
- [ ] Rate limiting configured (Cloudflare provides basic protection)

## Post-Deployment Tasks

- [ ] Update README.md with production URLs
- [ ] Document any custom domain setup
- [ ] Share access with team members
- [ ] Set up monitoring/alerting if needed
- [ ] Plan for regular dependency updates

## Troubleshooting Common Issues

### CORS Errors
```
Access to fetch at 'worker-url' from origin 'frontend-url' has been blocked by CORS policy
```
**Solution**: Verify `FRONTEND_URL` secret is set correctly in worker

### API Key Errors
```
{"response":null,"error":"Authentication failed"}
```
**Solution**: Verify `ANTHROPIC_API_KEY` secret is set correctly

### Build Errors
```
Module not found or build failures
```
**Solution**: Clear node_modules, reinstall dependencies, check Node.js version

### Environment Variable Issues
```
API calls failing or pointing to wrong endpoints
```
**Solution**: Verify `VITE_API_URL` is set correctly in Vercel

## Success Criteria

Deployment is successful when:
- [ ] All manual tests pass
- [ ] No console errors in browser
- [ ] API responses are received within 30 seconds
- [ ] Conversation persistence works across page refreshes
- [ ] Mobile experience is functional
- [ ] CORS is properly configured
- [ ] Error handling works as expected

## URLs to Document

After successful deployment, document these URLs:

- **Frontend**: `https://YOUR_APP.vercel.app`
- **Backend**: `https://claude-chat-backend.YOUR_SUBDOMAIN.workers.dev`
- **Health Check**: `https://claude-chat-backend.YOUR_SUBDOMAIN.workers.dev/`
- **Chat API**: `https://claude-chat-backend.YOUR_SUBDOMAIN.workers.dev/chat`