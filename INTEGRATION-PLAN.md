# Integration Plan: ImageMax → Director's Palette Post Production

## Executive Summary

This document outlines the integration of ImageMax into Director's Palette as a "Post Production" module for generating images from shot descriptions.

### Key Decisions
- **Architecture**: ImageMax becomes a module within Director's Palette
- **Data Flow**: One-way (Director's Palette → Post Production)  
- **Location**: `/post-production` route
- **MVP Focus**: Send shots, generate images, display results

## Quick Start for Developer

### What You Need to Do:

1. **Copy your ImageMax folder** into this project at:
   - Place the entire ImageMax project in a temporary folder like `/imagemax-temp`
   - We'll migrate files from there

2. **Install Replicate dependency**:
   ```bash
   npm install replicate
   ```

3. **Add your Replicate API key** to `.env.local`:
   ```
   REPLICATE_API_TOKEN=your_token_here
   ```

That's it! The rest is handled by the code structure below.

## Implementation Phases

### Phase 1: Foundation (Current)
- ✅ Create folder structure
- ✅ Set up data types
- ✅ Create transfer system
- ✅ Add navigation

### Phase 2: Migration (Next)
- Copy ImageMax core files
- Adapt to new structure
- Connect to Director's Palette

### Phase 3: Integration
- Test shot transfer
- Verify image generation
- Polish UI

## Directory Structure

```
director-palette/
├── app/
│   ├── post-production/          # NEW MODULE
│   │   ├── page.tsx             # Main interface
│   │   ├── api/                 # Replicate endpoints
│   │   └── components/          # UI components
│   └── [existing folders]
├── lib/
│   ├── post-production/          # Utilities
│   │   ├── types.ts            # Data types
│   │   ├── transfer.ts         # Shot transfer
│   │   └── replicate-client.ts # API wrapper
│   └── [existing files]
└── stores/
    ├── post-production-store.ts  # State management
    └── [existing stores]
```

## Data Flow

```
Director's Palette          Post Production
┌──────────────┐           ┌──────────────┐
│ Story Mode   │           │              │
│ Music Video  │ ──shots──>│ Shot Queue   │
│ Song DNA     │           │      ↓       │
└──────────────┘           │ Image Gen    │
                           │      ↓       │
                           │ Gallery      │
                           └──────────────┘
```

## Core Types

```typescript
interface PostProductionShot {
  id: string
  projectId: string
  projectType: 'story' | 'music-video'
  shotNumber: number
  description: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  generatedImages?: GeneratedImage[]
}
```

## User Workflow

1. Generate shots in Story/Music Video mode
2. Click "Send to Post Production" button
3. Navigate to Post Production page
4. View shot queue
5. Generate images with Replicate
6. Download results

## Files to Migrate from ImageMax

### Priority 1 (Core Functionality)
- `app/page.tsx` → `app/post-production/page.tsx`
- `app/api/generate-videos-v2` → `app/post-production/api/generate`
- `src/store/*` → `stores/post-production-store.ts`
- `lib/indexeddb.ts` → Keep for image caching

### Priority 2 (Nice to Have)
- Download queue functionality
- Template system (future)
- Additional Replicate models

### Skip for MVP
- Seedance/Kontext modes
- Video generation (focus on images)
- Complex UI elements

## Next Steps for Developer

After copying ImageMax folder:
1. Run `npm install replicate`
2. Test at `http://localhost:3000/post-production`
3. Try sending shots from Story mode
4. Report any issues

## Testing Checklist

- [ ] Post Production page loads
- [ ] Shots transfer from Story mode
- [ ] Shots transfer from Music Video mode
- [ ] Replicate API connects
- [ ] Images generate successfully
- [ ] Images display in gallery
- [ ] Download works

## Environment Variables

```env
# Add to .env.local
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

## Support

For issues or questions about this integration:
1. Check this document first
2. Review the code comments
3. Test with sample data

---

*Last Updated: Current Date*
*Status: Ready for ImageMax migration*