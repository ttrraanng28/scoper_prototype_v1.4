---
inclusion: always
---

# Project Structure Standards

## Directory Organization

Maintain clean, logical project structure with clear separation of concerns:

### Frontend Structure
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── styles/        # CSS/styling files
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
├── public/            # Static assets
├── package.json       # Dependencies and scripts
└── vite.config.js     # Build configuration
```

### Backend Structure
```
backend/
├── src/
│   ├── handlers/      # Request handlers
│   ├── services/      # Business logic services
│   ├── utils/         # Utility functions
│   └── index.js       # Main worker entry point
├── package.json       # Dependencies
└── wrangler.toml      # Cloudflare Worker config
```

### Root Level Files
```
project-root/
├── frontend/          # Frontend application
├── backend/           # Backend worker
├── README.md          # Project documentation
├── LICENSE            # License file
├── .gitignore         # Git ignore rules
└── package.json       # Root package.json for workspace management
```

## File Naming Conventions

- Use kebab-case for directories and files
- Use PascalCase for React components
- Use camelCase for JavaScript functions and variables
- Use UPPER_CASE for environment variables and constants

## Code Organization Principles

- Keep components small and focused on single responsibility
- Separate business logic from UI components
- Use custom hooks for reusable stateful logic
- Group related functionality in dedicated directories
- Maintain consistent import/export patterns

## Documentation Standards

- Include JSDoc comments for complex functions
- Maintain up-to-date README with setup instructions
- Document environment variables and configuration
- Include deployment instructions for both environments

## Required Project Files

Every project must include:

- **README.md**: Comprehensive setup instructions, environment variables, and deployment guides
- **LICENSE**: Clear usage rights specification
- **.gitignore**: Exclude node_modules, environment files, and build artifacts
- **package.json**: Proper dependency management and scripts

## Deployment Standards

- Frontend: Configure for Vercel deployment with automatic builds
- Backend: Deploy to Cloudflare Workers platform with custom domain support
- Security: Maintain HTTPS across all deployed components
- Performance: Optimize for fast loading and responsive user experience

## Clean Code Principles

**Keep it minimal and focused:**
- Only create files and folders that are actually needed
- Avoid over-engineering or premature optimization
- Remove unused imports, variables, and functions
- Delete empty files and directories
- Keep dependencies minimal - only add what's essential

**Debugging-friendly practices:**
- Use clear, descriptive variable and function names
- Avoid deeply nested folder structures unless necessary
- Keep components small and single-purpose
- Minimize abstraction layers that obscure functionality
- Write code that's easy to trace and understand

**File organization:**
- Group related functionality together
- Remove or consolidate duplicate code
- Keep configuration files at appropriate levels
- Avoid creating files "just in case" - create them when needed