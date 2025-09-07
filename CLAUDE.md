# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Director's Palette (ImgPromptGen) is a Next.js 15 application for generating AI image prompts for story and music video production. It allows users to break down stories or music videos into shot lists with director-specific styles.

## Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **UI**: React 19 + Tailwind CSS 4 + shadcn/ui components
- **State Management**: React hooks + localStorage for session persistence
- **Database**: IndexedDB (via custom wrapper in `lib/indexeddb.ts`)
- **Styling**: Tailwind CSS with custom animations
- **AI Integration**: AI SDK with OpenAI provider

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture Overview

### Directory Structure

- **`/app`**: Next.js App Router pages and server actions
  - `page.tsx`: Main application page with story/music video modes
  - `actions-*.ts`: Server-side AI generation logic
  - `artist-bank/`, `director-library/`, `projects/`: Feature pages
  
- **`/components`**: React components
  - `ui/`: shadcn/ui base components
  - Feature components: `artist-*.tsx`, `director-*.tsx`, `music-video-config.tsx`, etc.
  
- **`/lib`**: Core business logic and utilities
  - `*-db.ts`: IndexedDB database operations
  - `*-types.ts`: TypeScript type definitions
  - `curated-directors.ts`, `directors-defaults.ts`: Default director data
  - `prompts-mv.ts`: AI prompt templates

### Key Features

1. **Triple Mode Operation**: Story mode, Music Video mode, and Commercial mode with separate workflows
2. **Director Styles**: Curated and custom director profiles for stylized generation
3. **Artist Bank**: Artist profile management with persistence
4. **Shot Generation**: AI-powered shot list generation with director-specific styling
5. **Image Editing**: Qwen-Edit AI integration for professional image editing and modification
6. **Template Systems**: Comprehensive template management for stories, music videos, and commercials
7. **Session Persistence**: Auto-saves state to localStorage

### Server Actions Pattern

The app uses Next.js server actions (in `app/actions-*.ts`) for AI operations:
- `generateBreakdown`: Story breakdown generation
- `generateFullMusicVideoBreakdown`: Music video structure generation
- `generateDirectorStyleDetails`: Custom director style generation
- `generateAdditionalChapterShots`/`generateAdditionalMusicVideoShots`: Additional shot generation

### Database Schema

IndexedDB stores:
- **Film Directors**: `{ id, name, description, visualLanguage, cameraStyle, colorPalette, ... }`
- **Music Video Directors**: `{ id, name, description, visualHallmarks, narrativeStyle, genres, ... }`
- **Artist Profiles**: `{ id, artist_name, genres, visual_style, themes, ... }`

### State Management

- Component state via React hooks
- Session persistence via localStorage (`dsvb:session:v3`)
- Cross-component communication via custom events (`dsvb:mode-change`)

## Critical Development Rules

### 🚨 **NEVER DEPLOY WITHOUT TESTING**

**MANDATORY TESTING PROTOCOL - NO EXCEPTIONS:**

1. **Always open Playwright after any changes**
2. **Test every feature you just implemented**
3. **Navigate through complete user workflows** 
4. **Verify functionality works as expected**
5. **Document any issues found during testing**
6. **Fix issues BEFORE committing/deploying**

**NO COMMITS OR DEPLOYMENTS WITHOUT BROWSER TESTING FIRST!**

### ⚠️ Most Critical Problems

1. **Monolithic Main Component**: `app/page.tsx` is 1200+ lines with 20+ useState hooks - needs immediate refactoring
2. **No State Management**: All state lives in components with no centralized store (Redux/Zustand needed)
3. **Scattered Server Actions**: Actions spread across 5 files (`actions*.ts`) - consolidate into organized modules
4. **No Configuration System**: Hardcoded prompts, magic strings, no environment configs
5. **No Error Boundaries**: Missing proper error handling and recovery mechanisms

### Code Quality Issues

- **Performance**: No code splitting, everything loads at once
- **Maintainability**: Complex functions doing too much, no clear separation of concerns
- **Documentation**: No inline comments for complex logic, no API documentation
- **Testing**: No test suite or testing framework
- **Security**: No rate limiting on AI calls, client-side data could be lost

### Refactoring Priorities

When modifying this codebase, prioritize:

1. **Break up `page.tsx`**: Extract into smaller components and custom hooks
2. **Implement State Management**: Add Zustand or Redux for centralized state
3. **Create Config System**: Extract all prompts and magic values to configuration files
4. **Consolidate Actions**: Organize server actions by domain with clear interfaces
5. **Add Error Handling**: Implement error boundaries and consistent error management

### Current Limitations

- **Build Configuration**: ESLint and TypeScript errors are ignored during builds (`next.config.mjs`)
- **No Test Suite**: Currently no test files or testing framework configured
- **AI Integration**: Requires OpenAI API key configuration for server actions
- **Image Editing**: Requires Replicate API token for Qwen-Edit image editing functionality
- **Browser Storage**: Heavy reliance on IndexedDB and localStorage for data persistence
- **No Caching Strategy**: Could lead to performance issues with larger datasets