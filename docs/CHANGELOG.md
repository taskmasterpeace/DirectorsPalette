# Changelog

## [Latest] - 2024-08-12

### Fixed
- **Music Video Generation**: Fixed shots not generating after reference configuration
  - Added `isConfigured: true` to merged config
  - Included visual themes in generation prompt
- **Story Mode Import**: Fixed `generateStoryBreakdownWithReferences` export error
  - Changed import path to use unified exports
- **UI Duplication**: Fixed duplicate input panels after breakdown generation
  - Added conditional rendering based on breakdown state
- **Server Actions**: Fixed "must be async functions" error
  - Made all exported functions async in server action files

### Added
- **Visual Themes Support**: Added visual themes to music video configuration
- **Workflow Coordinator**: New store for managing shared workflow states
- **Inline Reference Config**: Music video now uses inline config like story mode
- **Documentation**: Added comprehensive troubleshooting and architecture docs

### Changed
- **Import Structure**: All actions now imported from `@/app/actions`
- **State Management**: Clear function now resets workflow store
- **Error Handling**: Added retry logic and fallback parsing

## [Previous] - 2024-08-11

### Major Refactor
- Reorganized server actions into domain modules
- Created centralized AI service layer
- Implemented unified action exports
- Separated workflow logic from UI components

### Issues Introduced (Now Fixed)
- Music video generation broken
- Story mode extraction issues
- Schema mismatches
- localStorage usage in server actions
- Double @@ signs in references

## Features Roadmap

### In Progress
- [ ] Test suite implementation
- [ ] Type safety improvements
- [ ] Performance optimizations

### Planned
- [ ] Export to PDF/Final Draft
- [ ] Storyboard image generation
- [ ] Team collaboration
- [ ] Mobile app
- [ ] Multi-language support

## Migration Guide

### From Previous Version

1. **Update Imports**
   ```typescript
   // Old
   import { action } from '@/app/actions/story'
   
   // New
   import { action } from '@/app/actions'
   ```

2. **Update Config Structure**
   ```typescript
   // Ensure isConfigured is set
   musicVideoConfig.isConfigured = true
   ```

3. **Clear LocalStorage**
   - Clear browser cache
   - Reset saved sessions
   - Reload application

## Known Issues

- TypeScript strict mode disabled
- Some components use `any` types
- No comprehensive test coverage
- Build warnings for unused imports

## Contributors

- Main development by TaskmasterPeace
- Architecture improvements by Claude
- Bug fixes and testing by the community

## Support

Report issues: https://github.com/taskmasterpeace/ImgPromptGen/issues