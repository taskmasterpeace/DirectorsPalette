# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Director's Palette is a professional-grade AI creative platform for generating production-ready shot lists for stories, music videos, and commercials. It integrates multiple AI models and provides director-specific styling capabilities.

**📖 Platform Documentation**: See `DIRECTORS-PALETTE-PRODUCTION-AUDIT-REPORT.md` for comprehensive technical audit and component grades.

## Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5 with strict typing
- **UI**: React 19 + Tailwind CSS 4 + shadcn/ui components
- **State Management**: Zustand stores with persistence (`stores/` directory)
- **Database**: IndexedDB for browser storage + Supabase for authentication
- **AI Integration**: OpenAI via AI SDK, Replicate for image generation
- **Testing**: Vitest for unit/integration tests, Playwright for E2E

## Development Commands

```bash
# Install and run
npm install
npm run dev         # Development server on port 3000

# Testing - MANDATORY before commits
npm run test        # Run Vitest unit tests
npm run test:unit   # Unit tests only
npm run test:integration  # Integration tests
npx playwright test # E2E browser tests (port 3009)

# Build and quality checks
npm run build       # Production build
npm run lint        # ESLint checks
```

## Critical Architecture Patterns

### State Management Architecture

The application uses **Zustand stores** for centralized state management:

- `stores/app-store.ts` - Main application state and mode switching
- `stores/story-store.ts` - Story mode state and shot management
- `stores/music-video-store.ts` - Music video workflow state
- `stores/post-production-store.ts` - Image generation and gallery
- `stores/unified-gallery-store.ts` - Cross-mode gallery management

### Server Actions

All AI operations use Next.js server actions in `app/actions.ts`:
- `generateBreakdown` - Story/commercial breakdown
- `generateFullMusicVideoBreakdown` - Music video structure
- `generateDirectorStyleDetails` - Custom director styles
- `generateAdditionalChapterShots` - Additional shots generation

### Component Architecture Standards

**MANDATORY: Maximum 200 lines per component file**

When refactoring large components:
1. Extract types to `*Types.ts` files
2. Extract hooks to `*Hooks.ts` files
3. Break UI into focused sub-components
4. Create thin orchestrator components

Example pattern:
```
ComplexComponent.tsx (800 lines) becomes:
├── ComplexComponentTypes.ts (50 lines)
├── ComplexComponentHooks.ts (100 lines)
├── ComplexComponentHeader.tsx (150 lines)
├── ComplexComponentContent.tsx (150 lines)
└── ComplexComponent.tsx (100 lines - orchestrator)
```

### Testing Requirements

**NEVER deploy without testing:**

1. **Unit Tests**: Run `npm run test` after changes
2. **Browser Testing**: Always test with Playwright (`npx playwright test`)
3. **Manual Testing**: Verify functionality in development server
4. **Build Verification**: Ensure `npm run build` succeeds

## Key Features & Components

### Shot Creator System
- **Location**: `components/post-production/`
- **Models**: Supports 5 AI models with dynamic parameter controls
- **Gallery**: 8 images per page with search functionality
- **Wild Cards**: Dynamic prompt expansion system (`_location_` → "mystical forest")

### Genre System (600+ genres)
- **Component**: `components/GenreCommandMulti.tsx`
- **Data**: `lib/music_genres.json` - Complete taxonomy
- **Architecture**: 3-tier hierarchy (Primary → Subgenres → Microgenres)

### Mode-Specific Workflows

1. **Story Mode**: Text → Character extraction → Director styling → Shot list
2. **Music Video Mode**: Lyrics + Artist → Video concept → Section breakdown
3. **Commercial Mode**: Brief → Template selection → Shot generation
4. **Children's Book Mode**: Story → Page-by-page illustrations

## Critical Development Rules

### 🚨 MANDATORY Testing Protocol

1. Always run tests before committing: `npm run test`
2. Test in Playwright for UI changes: `npx playwright test`
3. Verify functionality manually in browser
4. Run `npm run build` to ensure production readiness
5. Fix all issues before committing

### ⚠️ Known Issues & Limitations

- **Build Config**: TypeScript errors currently ignored (`next.config.mjs`)
- **No Rate Limiting**: AI calls need rate limiting implementation
- **Browser Storage**: Heavy reliance on IndexedDB/localStorage
- **Component Size**: Some components exceed 200 lines (need refactoring)

### 🔒 Security Considerations

- Never commit API keys or secrets
- Use environment variables for all sensitive data
- Validate all user inputs before AI processing
- Sanitize outputs from AI before display

## Environment Setup

Required environment variables in `.env.local`:
```env
# AI Generation
OPENAI_API_KEY=sk-...

# Image Generation (optional)
REPLICATE_API_TOKEN=r8_...

# Authentication
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Quick Reference

### Common File Locations
- **Server Actions**: `app/actions.ts`
- **Zustand Stores**: `stores/*.ts`
- **UI Components**: `components/ui/`
- **Feature Components**: `components/`
- **Database Operations**: `lib/*-db.ts`
- **Type Definitions**: `lib/*-types.ts`
- **AI Prompts**: `lib/prompts-*.ts`

### Testing Specific Features
```bash
# Test story workflow
npm run test __tests__/functionality/story-workflow.test.ts

# Test music video generation
npm run test __tests__/integration/music-video-generation.test.ts

# Test export system
npm run test __tests__/functionality/export-system.test.ts

# Run E2E tests with UI
npx playwright test --ui
```

### Performance Optimization

- Use `useMemo` and `useCallback` for expensive operations
- Implement virtual scrolling for large lists
- Lazy load heavy components with dynamic imports
- Monitor bundle size with `npm run build`