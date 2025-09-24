# 🚀 Director's Palette - Developer Onboarding Guide

**Welcome Kenil!** This document contains everything you need to get started with the Director's Palette codebase.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Environment Setup](#environment-setup)
4. [Database Architecture](#database-architecture)
5. [File Structure](#file-structure)
6. [Key Components & Features](#key-components--features)
7. [API Integration](#api-integration)
8. [Development Workflow](#development-workflow)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

**Director's Palette** is a professional AI-powered creative platform for generating production-ready shot lists for stories, music videos, and commercials. It integrates multiple AI models and provides director-specific styling capabilities.

### Core Features:
- 📚 **Story Mode**: Transform narratives into visual shot lists
- 🎵 **Music Video Mode**: Create video concepts from lyrics
- 📺 **Commercial Mode**: Generate professional commercial shots
- 📸 **Shot Creator**: AI image generation with 5+ models
- 🎨 **Layout & Annotation**: Canvas-based editing tools
- 📱 **PWA Support**: Progressive Web App for mobile devices

---

## 💻 Technology Stack

### Frontend Framework
- **Next.js 15.2.4** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5.7.3** - Type-safe JavaScript

### UI & Styling
- **Tailwind CSS 4.0.0** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI
- **Framer Motion 11.15.0** - Animation library
- **Lucide React** - Icon library

### State Management
- **Zustand 5.0.3** - Lightweight state management
- **React Hook Form 7.54.2** - Form handling
- **Zod 3.24.1** - Schema validation

### Database & Storage
- **Supabase** - Authentication & cloud database
- **IndexedDB** - Browser-based storage via Dexie 4.0.10
- **LocalStorage** - Simple key-value storage

### AI Integration
- **AI SDK 4.1.4** - Vercel AI SDK for streaming
- **OpenAI** - Text generation (GPT-4)
- **Replicate** - Image generation models
- **Together AI** - Alternative AI provider

### Canvas & Media
- **Fabric.js 6.5.2** - Canvas manipulation
- **Konva 9.3.19** - 2D canvas library
- **React Colorful 5.6.1** - Color picker
- **React Dropzone 14.3.5** - File upload

### Development Tools
- **Vitest 2.1.8** - Unit testing framework
- **Playwright** - E2E testing
- **ESLint 9** - Code linting
- **Next PWA 5.7.0** - PWA support

---

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/taskmasterpeace/DirectorsPalette.git
cd DirectorsPalette
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Variables (.env.local)

Create `.env.local` in the root directory with these variables:

```env
# ============================================
# AI GENERATION SERVICES
# ============================================

# OpenAI - Primary text generation
OPENAI_API_KEY=sk-proj-[YOUR_KEY_HERE]

# Replicate - Image generation
REPLICATE_API_TOKEN=r8_[YOUR_TOKEN_HERE]
REPLICATE_WEBHOOK_SECRET=[YOUR_WEBHOOK_SECRET]

# Together AI - Alternative provider
TOGETHER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# DATABASE & AUTHENTICATION
# ============================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[YOUR_KEY]
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[YOUR_SERVICE_KEY]

# ============================================
# APPLICATION SETTINGS
# ============================================

# Base URL (update for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_AUTH=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# ============================================
# OPTIONAL SERVICES
# ============================================

# Sentry Error Tracking
SENTRY_DSN=[YOUR_SENTRY_DSN]
SENTRY_AUTH_TOKEN=[YOUR_SENTRY_TOKEN]

# Google Analytics
NEXT_PUBLIC_GA_ID=G-[YOUR_GA_ID]
```

### 4. Additional Configuration Files

#### Task Master Configuration (.taskmaster/config.json)
```json
{
  "models": {
    "main": "claude-3-5-sonnet-20241022",
    "research": "perplexity-llama-3.1-sonar-large-128k-online",
    "fallback": "gpt-4o-mini"
  }
}
```

#### MCP Server Configuration (.mcp.json)
```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "--package=task-master-ai", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "your_key_here",
        "OPENAI_API_KEY": "your_key_here",
        "PERPLEXITY_API_KEY": "your_key_here"
      }
    }
  }
}
```

---

## 🗄️ Database Architecture

### IndexedDB Schema (via Dexie)

```typescript
// Database Tables
const db = new Dexie('DirectorsPaletteDB');

db.version(1).stores({
  // Story Mode
  stories: '++id, title, content, createdAt, updatedAt',
  chapters: '++id, storyId, title, content, order',
  shots: '++id, chapterId, description, shotType, angle',

  // Music Video Mode
  musicVideos: '++id, artistName, songTitle, lyrics, createdAt',
  videoSections: '++id, videoId, sectionName, timing, mood',

  // Commercial Mode
  commercials: '++id, brand, product, brief, template',

  // Generated Images
  images: '++id, url, prompt, model, metadata, createdAt',

  // Prompt Library
  prompts: '++id, title, content, category, tags, quickAccess',

  // User Projects
  projects: '++id, name, type, data, thumbnail, createdAt, updatedAt'
});
```

### Supabase Tables (Cloud Database)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'story', 'music_video', 'commercial'
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated Images
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  url TEXT NOT NULL,
  prompt TEXT,
  model TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Zustand Stores Structure

```typescript
// Main stores located in /stores directory
- app-store.ts           // Global app state
- story-store.ts         // Story mode state
- music-video-store.ts   // Music video workflow
- commercial-store.ts    // Commercial templates
- post-production-store.ts // Image generation
- unified-gallery-store.ts // Gallery management
- prompt-library-store.ts  // Prompt management
- image-reference-store.ts // Reference images
```

---

## 📁 File Structure

```
DirectorsPalette/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Landing page
│   ├── globals.css            # Global styles
│   ├── actions.ts             # Server actions for AI
│   ├── api/                   # API routes
│   │   ├── generate/          # AI generation endpoints
│   │   └── webhook/           # Replicate webhooks
│   ├── story-mode/            # Story workflow pages
│   ├── music-video-mode/      # Music video pages
│   ├── commercial-mode/       # Commercial pages
│   ├── post-production/       # Image generation
│   ├── director-library/      # Director styles
│   └── help/                  # Help documentation
│
├── components/                 # React components
│   ├── ui/                    # shadcn/ui components
│   ├── containers/            # Page containers
│   ├── post-production/       # Shot creation components
│   │   ├── shot-creator/
│   │   ├── shot-list/
│   │   ├── shot-animator/
│   │   ├── image-gallery/
│   │   └── layout-planner/
│   ├── prompt-library/        # Prompt management
│   ├── auth/                  # Authentication
│   └── shared/                # Shared components
│
├── stores/                     # Zustand state stores
├── lib/                        # Utility functions
│   ├── ai/                    # AI integrations
│   ├── db/                    # Database utilities
│   ├── prompts/               # AI prompt templates
│   └── utils/                 # Helper functions
│
├── config/                     # Configuration files
│   ├── models/                # AI model configs
│   ├── prompts/               # Prompt presets
│   └── templates/             # Project templates
│
├── public/                     # Static assets
│   ├── images/                # Images
│   ├── icons/                 # Icons
│   └── favicon.ico           # Site favicon
│
├── __tests__/                  # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # Playwright tests
│
└── .taskmaster/               # Task Master project management
    ├── tasks/                 # Task tracking
    ├── docs/                  # Documentation
    └── config.json           # Task Master config
```

---

## 🎨 Key Components & Features

### 1. Shot Creator (`components/post-production/shot-creator/`)
- **Multi-model support**: 5 AI image models
- **Reference image system**: Up to 10 reference slots
- **Wild card system**: Dynamic prompt expansion
- **Batch generation**: 1-4 images per request

### 2. Story Mode Workflow
```typescript
// Workflow steps:
1. Text Input → 2. Character Extraction → 3. Director Styling → 4. Shot Generation
```

### 3. Music Video Mode
```typescript
// Process flow:
Lyrics + Artist → Video Concept → Section Breakdown → Visual Generation
```

### 4. Layout & Annotation Canvas
- **Fabric.js integration**: Drawing tools
- **Multi-layer support**: Images, text, shapes
- **Export options**: PNG, JPEG, PDF

### 5. Prompt Library System
- **600+ genres**: Hierarchical taxonomy
- **Smart deduplication**: Prevents duplicates
- **CSV import/export**: Bulk management
- **Quick access**: Favorite prompts

---

## 🔌 API Integration

### OpenAI Integration
```typescript
// app/actions.ts
export async function generateBreakdown(prompt: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    stream: true
  });

  return response;
}
```

### Replicate Image Generation
```typescript
// lib/ai/replicate.ts
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateImage(prompt: string, model: string) {
  const output = await replicate.run(
    `black-forest-labs/${model}`,
    { input: { prompt } }
  );
  return output;
}
```

---

## 🛠️ Development Workflow

### Start Development Server
```bash
npm run dev
# Runs on http://localhost:3000
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
npm run test:e2e     # Run Playwright tests
npm run type-check   # TypeScript checking
```

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/your-feature
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature

# Create PR to main branch
gh pr create --title "Your feature" --body "Description"
```

### Task Master Commands
```bash
# View current tasks
task-master list

# Get next task to work on
task-master next

# Mark task complete
task-master set-status --id=1.2 --status=done

# Add new task
task-master add-task --prompt="Add new feature"
```

---

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test                    # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
```

### E2E Tests (Playwright)
```bash
npx playwright test            # Run all E2E tests
npx playwright test --ui       # Run with UI
npx playwright test --debug    # Debug mode
```

### Test Structure
```
__tests__/
├── unit/
│   ├── components/         # Component tests
│   ├── stores/            # Store tests
│   └── utils/             # Utility tests
├── integration/
│   ├── api/               # API integration tests
│   └── workflows/         # Workflow tests
└── e2e/
    ├── auth.spec.ts       # Auth flow tests
    ├── story.spec.ts      # Story mode tests
    └── generation.spec.ts # Image generation tests
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables in Vercel
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy to apply changes

### Build Configuration
```javascript
// next.config.mjs
export default {
  images: {
    domains: ['replicate.delivery', 'pbxt.replicate.delivery'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
}
```

---

## 📞 Important Contacts & Resources

### Repository
- **GitHub**: https://github.com/taskmasterpeace/DirectorsPalette
- **Main Branch**: `main`
- **Development Branch**: `dev`

### Documentation
- **Project Docs**: See `DIRECTORS-PALETTE-PRODUCTION-AUDIT-REPORT.md`
- **API Docs**: See `docs/api-reference.md`
- **Component Docs**: See Storybook (when available)

### External Services
- **Supabase Dashboard**: https://app.supabase.com
- **Replicate Console**: https://replicate.com/account
- **OpenAI Platform**: https://platform.openai.com
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🐛 Common Issues & Solutions

### Issue: API Key Errors
```bash
# Check if keys are loaded
npm run env:check

# Verify .env.local exists
ls -la .env.local
```

### Issue: Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Database Connection
```bash
# Check Supabase status
curl https://[YOUR_PROJECT].supabase.co/rest/v1/

# Reset local database
npm run db:reset
```

### Issue: TypeScript Errors
```bash
# Run type check
npm run type-check

# Fix common issues
npm run lint:fix
```

---

## 🎯 Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies with `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add all API keys to `.env.local`
- [ ] Run `npm run dev` to start development
- [ ] Access http://localhost:3000
- [ ] Run `npm run test` to verify setup
- [ ] Create feature branch for development
- [ ] Read `CLAUDE.md` for AI assistant guidelines
- [ ] Join team Slack/Discord for communication

---

## 📚 Additional Resources

### Internal Documentation
- `CLAUDE.md` - AI assistant guidelines
- `DIRECTORS-PALETTE-PRODUCTION-AUDIT-REPORT.md` - Technical audit
- `.taskmaster/docs/` - Project requirements

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Fabric.js Documentation](http://fabricjs.com/docs)

---

## 🤝 Welcome to the Team!

Kenil, we're excited to have you on board! This document should give you everything you need to get started. If you have any questions or need clarification on anything, don't hesitate to reach out.

**Pro Tips:**
1. Use Task Master to track your work
2. Test your changes thoroughly before committing
3. Follow the existing code patterns and conventions
4. Document any new features or significant changes
5. Keep the `CLAUDE.md` file updated for AI assistance

Happy coding! 🚀

---

*Last Updated: January 2025*
*Version: 1.0.0*