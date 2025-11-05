# Design Document

## Overview

The Claude Chat UI is a prototype chat interface that enables business consultation through Claude AI with an embedded Scoper methodology. The system consists of a React frontend deployed on Vercel and a Cloudflare Worker backend that handles Claude API integration.

## Architecture

### High-Level Architecture

```
User Browser → React Frontend (Vercel) → Cloudflare Worker → Claude API
                     ↓
              Local Storage (Session Persistence)
```

### Component Architecture

**Frontend (React + Vite)**
- Single-page application with minimal dependencies
- Client-side conversation state management
- Responsive design with Tailwind CSS
- Session persistence via localStorage

**Backend (Cloudflare Worker)**
- Serverless edge function for API proxy
- Embedded Scoper system prompt
- CORS handling for cross-origin requests
- Error handling and rate limit management

## Components and Interfaces

### Frontend Components

#### App.jsx (Main Container)
```javascript
// Main application component managing global state
- conversationHistory: Array of message objects
- isLoading: Boolean for request state
- error: String for error messages
- handleSendMessage: Function to process user input
```

#### MessageList Component
```javascript
// Renders conversation history
Props:
- messages: Array of {role: 'user'|'assistant', content: string}
- isLoading: Boolean
```

#### MessageInput Component
```javascript
// Input field with send functionality
Props:
- onSendMessage: Function callback
- disabled: Boolean (during loading)
```

#### LoadingIndicator Component
```javascript
// Visual feedback during processing
Props:
- visible: Boolean
```

### Backend Interface

#### API Endpoint: POST /chat
```javascript
Request:
{
  "message": "string",
  "conversationHistory": [
    {"role": "user|assistant", "content": "string"}
  ]
}

Response:
{
  "response": "string",
  "error": null
}

Error Response:
{
  "response": null,
  "error": "Error message"
}
```

## Data Models

### Message Object
```javascript
{
  id: string,           // Unique identifier
  role: 'user' | 'assistant',
  content: string,      // Message text
  timestamp: Date       // When message was created
}
```

### Conversation State
```javascript
{
  messages: Message[],  // Array of message objects
  sessionId: string,    // Unique session identifier
  lastUpdated: Date     // Last activity timestamp
}
```

### API Request/Response
```javascript
// Request to Cloudflare Worker
{
  message: string,
  conversationHistory: Message[]
}

// Response from Cloudflare Worker
{
  response: string | null,
  error: string | null
}
```

## Error Handling

### Frontend Error Handling
- **Network Errors**: Display retry button with user-friendly message
- **API Errors**: Show specific error message from backend
- **Validation Errors**: Prevent empty message submission
- **Session Errors**: Graceful degradation if localStorage fails

### Backend Error Handling
- **Claude API Errors**: Return structured error response to frontend
- **Rate Limiting**: Implement exponential backoff and user notification
- **Invalid Requests**: Validate input and return appropriate error codes
- **CORS Issues**: Proper headers for cross-origin requests

### Error Recovery Patterns
```javascript
// Frontend retry mechanism
const retryRequest = async (message, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendMessage(message);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
};
```

## Testing Strategy

### Frontend Testing
- **Component Testing**: Test message display, input handling, and loading states
- **Integration Testing**: Test API communication and error handling
- **Responsive Testing**: Verify mobile and desktop layouts
- **Session Testing**: Verify conversation persistence across page refreshes

### Backend Testing
- **API Testing**: Test Claude API integration and response handling
- **Error Testing**: Test various failure scenarios and error responses
- **CORS Testing**: Verify cross-origin request handling
- **Rate Limit Testing**: Test API rate limiting behavior

### Manual Testing Scenarios
1. **Happy Path**: Send message, receive response, verify conversation history
2. **Error Scenarios**: Test network failures, API errors, invalid inputs
3. **Mobile Experience**: Test touch interactions and responsive layout
4. **Session Persistence**: Refresh page and verify conversation remains
5. **Long Conversations**: Test with multiple message exchanges

## Implementation Approach

### Phase 1: Core Infrastructure
1. Set up React project with Vite and Tailwind CSS
2. Create Cloudflare Worker with Claude API integration
3. Implement basic message sending and receiving
4. Add CORS handling and basic error responses

### Phase 2: User Interface
1. Build responsive chat interface components
2. Implement message display with proper styling
3. Add loading indicators and user feedback
4. Test mobile and desktop responsiveness

### Phase 3: Enhanced Features
1. Add conversation persistence with localStorage
2. Implement comprehensive error handling
3. Add retry mechanisms for failed requests
4. Optimize performance and user experience

### Phase 4: Deployment
1. Configure Vercel deployment for frontend
2. Deploy Cloudflare Worker with environment variables
3. Test production deployment and cross-origin requests
4. Verify end-to-end functionality

## Security Considerations

### API Key Protection
- Store Anthropic API key as Cloudflare Worker environment variable
- Never expose API key in frontend code
- Use Worker secrets for secure key management

### CORS Configuration
```javascript
// Cloudflare Worker CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-vercel-domain.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

### Input Validation
- Validate message content length and format
- Sanitize user input before sending to Claude API
- Implement rate limiting to prevent abuse

## Performance Optimization

### Frontend Optimization
- Lazy load components when needed
- Optimize bundle size with Vite tree shaking
- Use React.memo for message components to prevent unnecessary re-renders
- Implement virtual scrolling for long conversation histories

### Backend Optimization
- Use Cloudflare Worker edge locations for low latency
- Implement request caching where appropriate
- Optimize Claude API requests with proper context management
- Use streaming responses for long AI responses (future enhancement)

## Deployment Configuration

### Vercel Configuration (vercel.json)
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Cloudflare Worker Configuration (wrangler.toml)
```toml
name = "claude-chat-backend"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production.vars]
FRONTEND_URL = "https://your-vercel-domain.vercel.app"
```

This design provides a solid foundation for implementing the Claude Chat UI prototype while maintaining simplicity and focusing on core functionality.