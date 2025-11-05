

  
# Product Overview

  

## Conversational AI Scoper System

  

A sophisticated business consultation tool that transforms vague business challenges into structured, actionable project recommendations. The system serves SME owners (1-50 team size) by guiding them through a systematic 3-layer analysis methodology to clarify goals, understand current signals, and define measurable success criteria.

  

## Core Value Proposition

  

- **Input**: Natural language business challenges or ideas from founders

- **Process**: Structured 3-layer analysis (Goals → Signals → SMART Metrics) using a 3x3 business matrix framework

- **Output**: 4 actionable project cards with different approaches (SOP-first, Role-first, Tech-first, Quick-win)

  

## Target Users

  

Small to Medium Enterprise owners and founders who need strategic clarity and practical next steps for their business challenges. The system specializes in operational efficiency, strategic positioning, and organizational capability assessment.

  

## Key Differentiators

  

- Systematic progression through analysis layers without skipping steps

- Business matrix framework mapping relationships to domains

- Pareto mindset focusing on 20% of strategic information that drives 80% of clarity

- Practical project recommendations tailored to resource constraints
## Directory Layout

  

```

claude-chat/

├── frontend/ # React + Vite frontend application

│ ├── src/

│ │ ├── App.jsx # Main chat interface component

│ │ └── index.css # Tailwind CSS imports

│ ├── package.json # Frontend dependencies

│ └── vite.config.js # Vite config with base: '/claude-chat/'

└── backend/ # Cloudflare Worker backend

├── src/

│ └── index.js # Worker handler with embedded system prompt

└── wrangler.toml # Cloudflare Worker configuration

```

  

## Key Files

  

### Frontend Components

- **App.jsx**: Primary chat container managing conversation state, message submission, and API communication

- **MessageList**: Renders conversation history with user messages right-aligned (purple) and AI messages left-aligned (white/transparent)

- **MessageInput**: Input field with send button and loading state handling

- **LoadingIndicator**: Animated feedback during AI processing

  

### Backend Components

- **index.js**: Main Worker handler with CORS, request routing, and Anthropic API integration

- **SystemPromptManager**: Embedded Scoper methodology from `pseudo_scoper-system_prompt.md`

- **ConversationProcessor**: Manages conversation context and Claude API communication

  

## Configuration Files

  

### Frontend (vite.config.js)

```javascript

export default {

base: '/claude-chat/', // GitHub Pages deployment path

// Additional Vite configuration

}

```

  

### Backend (wrangler.toml)

```toml

name = "scoper-backend"

main = "src/index.js"

compatibility_date = "2024-01-01"

# ANTHROPIC_API_KEY stored as Worker secret

```

  

## Deployment Structure

- **GitHub Repo**: https://github.com/ttrraanng28/scoper_prototype_v1.4.git

- **Cloudflare Worker**: Global edge deployment with custom domain support

- **Vercel Deployment** https://vercel.com/trangs-projects-4fec4775/scoper-prototype-v1-4

  

## Development Workflow

1. Frontend development in `frontend/` directory with Vite dev server

2. Backend development in `backend/` directory with Wrangler local testing

3. System prompt updates embedded directly in `backend/src/index.js`

4. Separate deployment processes for frontend (Vercel Deployment) and backend (Cloudflare Workers)

# Technology Stack


## Frontend

- **React 18** - UI framework for component-based architecture

- **Vite** - Build tool providing fast dev server and optimized production builds

- **Tailwind CSS** - Utility-first styling with glassmorphism design patterns

- **No state management library** - Simple React useState for conversation state

  

## Backend

- **Cloudflare Workers** - Serverless edge functions with V8 isolates runtime

- **Anthropic SDK** (`@anthropic-ai/sdk`) - Official Claude API client

- **Model**: `claude-sonnet-4-5-20250929` with embedded system prompt
  

## Deployment

- **Frontend**: Vercel deployment connected via Git Repository 

- **Backend**: Cloudflare Workers with global edge distribution

- **Domain**: Custom domain support with HTTPS via Cloudflare

  

## Development Tools

- **Wrangler** - Cloudflare CLI for Worker deployment

  
## Architecture Patterns

- **Embedded System Prompt**: Complete Scoper methodology embedded in Worker code for performance

- **Stateless Backend**: No persistent storage, conversation state managed client-side

- **CORS Configuration**: Worker configured for GitHub Pages domain access

- **Environment Variables**: API keys stored as Cloudflare Worker secrets