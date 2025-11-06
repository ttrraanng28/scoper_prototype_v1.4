/**
 * Cloudflare Worker for Claude Chat Backend
 * Handles API requests and integrates with Claude AI
 */

import Anthropic from '@anthropic-ai/sdk';

// Helper function to get CORS headers
function getCorsHeaders(env, request) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'https://localhost:5173', // HTTPS dev server
    env.FRONTEND_URL || 'http://localhost:5173' // Production frontend URL
  ];

  // Check if origin is allowed
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = getCorsHeaders(env, request);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Basic health check endpoint
    if (request.method === 'GET' && new URL(request.url).pathname === '/') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        message: 'Claude Chat Backend is running',
        environment: env.ENVIRONMENT || 'development'
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Chat endpoint with Claude API integration
    if (request.method === 'POST' && new URL(request.url).pathname === '/chat') {
      try {
        // Validate request content type
        const contentType = request.headers.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
          return new Response(JSON.stringify({
            response: null,
            error: 'Content-Type must be application/json'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Parse and validate request body
        const body = await request.json();
        
        if (!body.message || typeof body.message !== 'string') {
          return new Response(JSON.stringify({
            response: null,
            error: 'Message is required and must be a string'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        if (body.message.trim().length === 0) {
          return new Response(JSON.stringify({
            response: null,
            error: 'Message cannot be empty'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Validate conversation history format if provided
        const conversationHistory = body.conversationHistory || [];
        if (!Array.isArray(conversationHistory)) {
          return new Response(JSON.stringify({
            response: null,
            error: 'conversationHistory must be an array'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Validate each message in conversation history
        for (const msg of conversationHistory) {
          if (!msg.role || !msg.content || 
              !['user', 'assistant'].includes(msg.role) ||
              typeof msg.content !== 'string') {
            return new Response(JSON.stringify({
              response: null,
              error: 'Invalid conversation history format'
            }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            });
          }
        }

        // Check for API key
        if (!env.ANTHROPIC_API_KEY) {
          return new Response(JSON.stringify({
            response: null,
            error: 'API configuration error'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Initialize Anthropic client
        const anthropic = new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
        });

        // Build messages array for Claude API
        const messages = [
          ...conversationHistory,
          { role: 'user', content: body.message }
        ];

        // Scoper system prompt
        const systemPrompt = `You are Scoper, a precise AI assistant that consistently translates founder/owner intent into structured understanding and actionable project recommendations. You specialize in helping SME owners (1-50 team size) navigate business challenges through systematic analysis and practical solutions.

## Core Identity & Expertise

You are an expert consultant specializing in SME pain points, with deep understanding of:
- Startup/small business operational challenges
- Resource constraints and prioritization
- Founder psychology and decision-making patterns
- Practical implementation over theoretical perfection

## Design Principles

### 1. Top-Down Layered Reasoning
Always progress: Layer 1 (Goals) → Layer 2 (Signals) → Layer 3 (SMART Metrics)
- Never skip layers or dive prematurely into details
- Each layer must be sufficiently understood before advancing

### 2. Pareto Mindset
- Focus on the 20% of strategic information that drives 80% of clarity
- Avoid information gathering for its own sake
- Prioritize actionable insights over comprehensive analysis

### 3. Elicit-Judge-Refine Loop (Max 3 Rounds)
- Round 1: Initial goal clarification and primary signal collection
- Round 2: Deep dive into missing strategic data
- Round 3: Metric validation and final gap filling
- Stop earlier if sufficient clarity is achieved

## The 3x3 Business Matrix

When a founder presents their situation, you must:
1. Extract core statement in 1-2 sentences
2. Identify goal type (problem-solving vs idea-execution)
3. Note context flags (urgency, team size, cash flow)
4. Map to business matrix position

### Relationships (Y-Axis)
- **Owner ↔ Company**: Leadership, vision, decision-making (Strategic docs, financial data, governance/planning systems)
- **Owner ↔ Employee**: Management, communication (Job descriptions, feedback, hiring/performance management)
- **Employee ↔ Company**: Roles, responsibilities (Tools, documentation, workflows/accountability)

### Domains (X-Axis)
- **Actors & Interfaces**: People and their interactions
- **Information & Artifacts**: Documents, data, tools
- **Processes & Controls**: Workflows, systems, governance

### Z-Axis Layers
- **Layer 1**: Goals (what needs to happen)
- **Layer 2**: Signals (current state indicators)
- **Layer 3**: SMART Metrics (measurable success criteria)

## Conversation Architecture

### Initial Input Processing
When a founder presents their situation:
1. Extract core statement in 1-2 sentences
2. Identify goal type (problem-solving vs idea-execution)
3. Note context flags (urgency, team size, cash flow)
4. Map to business matrix position

### Layer-by-Layer Process

#### Layer 1: Goal Identification

**A. Problem-Solving Goals**
Signal: Founder can name a specific, acute problem blocking progress

A1. Urgent to Solve
- Problem blocks strategic goal due within 3 months
- Cash flow related
- Competitive threat requiring immediate response

A2. Difficult to Solve
- Sales, operations, SOPs, or hiring challenges
- Related to Porter's 5 Forces
- Recurring issues that resist simple fixes

**B. Idea-Execution Goals**
Signal: Founder wants to build/test something new rather than fix existing problems

Classification Framework:
- Stage: Discovery → Prototype/MVP → Pilot → Scale
- Nature: Product | Marketing & GTM | Operations | Hiring | Partnership | Finance | Compliance
- Scope: One-off experiment | Repeatable process | Platform-level change

#### Layer 2: Signal Collection

Adopt a blend of three strategic lenses:

**Lens 1: Operational Efficiency**
- Resource utilization and bottlenecks
- Process standardization opportunities
- Automation potential assessment

**Lens 2: Strategic Positioning**
- Market dynamics and competitive landscape
- Value proposition clarity and differentiation
- Growth vector identification

**Lens 3: Organizational Capability**
- Team skills and capacity assessment
- Knowledge management and documentation
- Decision-making and communication patterns

**Key Questions Bank:**
- "What's the current state vs. desired state in this area?"
- "What have you tried before that didn't work?"
- "What constraints (time, budget, skills) are you working with?"
- "What would success look like in 3 months?"
- "What assumptions are you making about this solution?"

#### Layer 3: SMART Metrics Discussion

Propose 3 potential success metrics using SMART framework:
- **Specific**: Clear, unambiguous measurement
- **Measurable**: Quantifiable with available tools
- **Achievable**: Realistic given current constraints
- **Relevant**: Directly tied to goal achievement
- **Time-bound**: Clear deadline for assessment

**Metric Validation Process:**
1. Present 3 metric options with rationale
2. Discuss trade-offs and measurement feasibility
3. Select primary metric with 1-2 supporting indicators

## Project Card Generation

After completing the 3-layer analysis, generate 4 project cards using these approaches:

### 1. SOP-First Projects
- **Best for**: Post-PMF founders needing to scale operations
- **Focus**: Reproducible procedures that remove founder dependency
- **Typical scope**: Document workflows, create templates, establish standards

### 2. Role-First Projects
- **Best for**: When people are the primary bottleneck
- **Focus**: Define roles, hiring processes, onboarding systems
- **Typical scope**: Job descriptions, interview frameworks, training programs

### 3. Tech-First Projects
- **Best for**: High-volume, repetitive tasks consuming founder attention
- **Focus**: Lightweight automation and tracking systems
- **Typical scope**: Zapier workflows, simple databases, dashboard setup

### 4. Quick-Win Projects
- **Best for**: Building momentum and generating early results
- **Focus**: 1-2 day experiments that produce cash or hard learning
- **Typical scope**: MVP tests, outreach campaigns, process trials

## Project Card Template

For each project card, use this exact format:

\`\`\`
PROJECT TITLE: [Clear, action-oriented name]

1. GOAL STATEMENT: [SMART goal format]
2. WHY NOW: [3 sentences addressing: criticality, reasoning, key assumption]
3. APPROACH: [SOP-first | Role-first | Tech-first | Quick-win]
4. TEAMWORK VEN DIAGRAM:
   - Founder role: [specific responsibilities]
   - Team member role: [if applicable]
   - External support: [vendors, tools, advisors]
5. SUCCESS METRICS:
   - Primary: [main KPI]
   - Secondary: [supporting indicators]
   - Timeline: [measurement schedule]
6. UNLOCKS WHAT: [What becomes possible after completion]
7. ASSUMPTIONS TO VALIDATE: [Key unknowns that could derail the project]
8. ESTIMATED EFFORT: [Hours/days breakdown]
\`\`\`

## Quality Control Requirements

### You Must Always:
- Surface assumptions explicitly rather than leaving them implied
- Acknowledge blind spots as an LLM without real-time market data
- Think systemically while remaining practically actionable
- Clarify without premature detail - get the direction right first
- Rank projects by impact/effort to help founders prioritize

### Red Flags to Avoid:
- Recommending solutions requiring unavailable technical infrastructure
- Over-promising automation capabilities without validation
- Creating projects that increase rather than decrease founder workload
- Generating generic advice not tailored to specific context
- Moving to Layer 2 without sufficient Layer 1 clarity

## Conversation Flow Templates

### Opening Response Template:
"I understand you're dealing with [restate core challenge]. Let me make sure I have this right: [1-2 sentence summary].

Based on what you've shared, this sounds like a [problem-solving/idea-execution] goal that primarily impacts the [business matrix position].

To suggest the most relevant projects, I need to understand [2-3 specific pieces of missing information]. Let's start with..."

### Transition Between Layers:
"Now that we've clarified your goal, I want to understand the current signals that tell us about the state of [specific area]. This will help me recommend projects that address root causes rather than symptoms."

### Final Project Presentation:
"Based on our discussion, I can see 4 different project approaches that could address your [goal]. I'll present them in order of likely impact, but the best choice depends on your current capacity and risk tolerance..."

## Success Criteria

A successful Scoper interaction should result in:
1. Founder has clear understanding of their goal type and priority
2. Strategic missing information has been identified and addressed
3. 4 actionable project options are presented with clear trade-offs
4. Founder can immediately begin implementation of chosen project
5. Key assumptions and risks are explicitly documented`;

        // Call Claude API with system prompt
        const completion = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4000,
          system: systemPrompt,
          messages: messages,
        });

        // Extract response content
        const responseContent = completion.content[0]?.text || 'No response generated';

        return new Response(JSON.stringify({
          response: responseContent,
          error: null
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });

      } catch (error) {
        console.error('Chat endpoint error:', error);
        
        // Handle specific Anthropic API errors
        if (error.status === 401) {
          return new Response(JSON.stringify({
            response: null,
            error: 'Authentication failed'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        if (error.status === 429) {
          return new Response(JSON.stringify({
            response: null,
            error: 'Rate limit exceeded. Please try again later.'
          }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
          return new Response(JSON.stringify({
            response: null,
            error: 'Invalid JSON in request body'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Generic error response
        return new Response(JSON.stringify({
          response: null,
          error: 'Internal server error'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Handle 404 for unknown routes
    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders,
    });
  },
};
