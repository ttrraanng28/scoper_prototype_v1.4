# Claude Chat UI

A chat interface prototype that connects users to Claude AI with the embedded Scoper system prompt for business consultation. This system enables SME owners to input business challenges and receive structured guidance through conversational AI.

## Project Structure

```
claude-chat-ui/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main application component
│   │   └── main.jsx           # Application entry point
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Build configuration
│   └── .gitignore             # Frontend-specific ignore rules
├── backend/                    # Cloudflare Worker backend
│   ├── src/
│   │   └── index.js           # Main worker entry point
│   ├── package.json           # Backend dependencies
│   ├── wrangler.toml          # Cloudflare Worker config
│   └── .gitignore             # Backend-specific ignore rules
├── .kiro/                     # Kiro IDE specifications
│   └── specs/claude-chat-ui/  # Feature specifications
├── README.md                  # This file
├── LICENSE                    # MIT License
├── .gitignore                 # Root-level ignore rules
└── package.json               # Workspace configuration
```

## Prerequisites

- **Node.js 18+** and npm
- **Cloudflare account** (for backend deployment)
- **Vercel account** (for frontend deployment)  
- **Anthropic API key** (get from [Anthropic Console](https://console.anthropic.com/))

## Development Setup

### 1. Install Dependencies

```bash
# Install root workspace dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Environment Variables

#### Backend (Cloudflare Worker)
The backend requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude integration | Yes |
| `FRONTEND_URL` | Allowed frontend URL for CORS (production only) | Production |

Set up your Anthropic API key as a secret:
```bash
cd backend
wrangler secret put ANTHROPIC_API_KEY
# Enter your API key when prompted
```

#### Frontend
The frontend requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API endpoint URL | Yes |

Create `.env.local` in the frontend directory:
```bash
cd frontend
echo "VITE_API_URL=http://localhost:8787" > .env.local
```

**Note:** Never commit `.env` files to version control. They are included in `.gitignore` files.

For complete environment variable documentation, see [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).

### 3. Start Development Servers

#### Backend (Cloudflare Worker)
```bash
cd backend
npm run dev
# Worker will be available at http://localhost:8787
```

#### Frontend (React + Vite)
```bash
cd frontend
npm run dev
# Frontend will be available at http://localhost:5173
```

## Deployment

For detailed deployment instructions, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Step-by-step deployment guide
- [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md) - Complete testing checklist

### Quick Deployment Summary

#### Backend (Cloudflare Workers)
```bash
cd backend
wrangler login
wrangler secret put ANTHROPIC_API_KEY --env production
wrangler deploy --env production
```

#### Frontend (Vercel)
```bash
cd frontend
vercel
vercel env add VITE_API_URL  # Enter your worker URL
vercel --prod
```

#### Update CORS
```bash
cd backend
wrangler secret put FRONTEND_URL --env production  # Enter your Vercel URL
wrangler deploy --env production
```

## Features

- ✅ React frontend with Tailwind CSS styling
- ✅ Cloudflare Worker backend with Claude AI integration
- ✅ Embedded Scoper methodology system prompt
- ✅ Conversation persistence via localStorage
- ✅ Responsive chat interface for mobile and desktop
- ✅ Comprehensive error handling and retry mechanisms
- ✅ Production deployment configuration

## Technology Stack

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)

**Backend:**
- Cloudflare Workers (serverless)
- Anthropic SDK (Claude AI integration)

**Deployment:**
- Vercel (frontend hosting)
- Cloudflare Workers (backend hosting)

## Architecture

The system consists of two main components:

1. **React Frontend**: Single-page application with conversation management
2. **Cloudflare Worker Backend**: Serverless API proxy for Claude AI integration

```
User Browser → React Frontend (Vercel) → Cloudflare Worker → Claude API
                     ↓
              Local Storage (Session Persistence)
```

## API Documentation

### POST /chat
Sends a message to Claude AI with conversation context.

**Request:**
```json
{
  "message": "string",
  "conversationHistory": [
    {"role": "user|assistant", "content": "string"}
  ]
}
```

**Response:**
```json
{
  "response": "string",
  "error": null
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure `FRONTEND_URL` is set correctly in Cloudflare Worker
- Check that the frontend URL matches exactly (including protocol)

**API Key Issues:**
- Verify your Anthropic API key is valid
- Ensure the key is set as a Cloudflare Worker secret, not an environment variable

**Build Failures:**
- Clear node_modules and reinstall dependencies
- Ensure Node.js version is 18 or higher

## License

MIT License - see [LICENSE](LICENSE) file for details.# scoper_prototype_v1.4
# scoper_prototype_v1.4
