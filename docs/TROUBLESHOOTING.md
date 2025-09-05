# Troubleshooting Guide

## Common Issues and Solutions

### 1. Import Errors

#### Problem: "generateStoryBreakdownWithReferences is not exported"
**Solution**: Import from `@/app/actions` not `@/app/actions/story`
```typescript
// ❌ Wrong
import { generateStoryBreakdownWithReferences } from '@/app/actions/story'

// ✅ Correct
import { generateStoryBreakdownWithReferences } from '@/app/actions'
```

### 2. Music Video Not Generating Shots

#### Problem: Breakdown generates but no shots appear
**Root Cause**: `isConfigured` flag not set in MusicVideoConfig

**Solution**: Ensure config has `isConfigured: true`
```typescript
const mergedConfig: MusicVideoConfig = {
  isConfigured: true,  // CRITICAL!
  locations: [...],
  wardrobe: [...],
  props: [...]
}
```

### 3. UI Duplication

#### Problem: Input panel shows twice after generating breakdown
**Solution**: Conditionally render based on breakdown existence
```typescript
{!musicVideoStore.musicVideoBreakdown && <MusicVideoInput />}
{musicVideoStore.musicVideoBreakdown && <MusicVideoMode />}
```

### 4. Server Actions Error

#### Problem: "Server Actions must be async functions"
**Solution**: All exported functions in files with "use server" must be async
```typescript
// ❌ Wrong
export function getDefaultPrompts() {
  return defaultPrompts
}

// ✅ Correct
export async function getDefaultPrompts() {
  return defaultPrompts
}
```

### 5. References Disappearing

#### Problem: References vanish after configuration
**Solution**: Check workflow state management
- Ensure `workflowStore.resetWorkflow()` is called on clear
- Verify `setShowReferenceConfig(false)` after generation

### 6. localStorage Errors in Server Actions

#### Problem: "localStorage is not defined"
**Solution**: Add window check
```typescript
if (typeof window !== 'undefined') {
  localStorage.setItem(key, value)
}
```

### 7. Schema Validation Failures

#### Problem: "Response did not match schema"
**Solution**: Make schema fields optional and add fallbacks
```typescript
const schema = z.object({
  field: z.string().optional(),  // Make optional
  // Add default in handling
})
```

### 8. Double @@ Signs in References

#### Problem: References show as "@@location"
**Solution**: Check if @ already exists before adding
```typescript
const reference = existingRef.startsWith('@') 
  ? existingRef 
  : `@${existingRef}`
```

## Build & Deployment Issues

### Vercel Deployment Fails
1. Check all environment variables are set
2. Ensure OPENAI_API_KEY is configured
3. Verify no TypeScript errors with `npm run build`

### Local Development Issues
1. Clear `.next` folder: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check Node version: Must be 18.0+

## Performance Issues

### Slow Generation
- Check OpenAI API status
- Reduce prompt complexity
- Use gpt-4o-mini for faster responses

### Memory Leaks
- Clear unused stores on component unmount
- Reset workflow states after completion
- Limit localStorage size

## API Issues

### Rate Limiting
- Implement exponential backoff
- Cache director profiles
- Batch operations where possible

### Timeout Errors
- Increase timeout in API calls
- Break large operations into chunks
- Show progress indicators

## Debugging Tips

### Enable Debug Mode
Set environment variable:
```bash
DEBUG=true npm run dev
```

### Check Console Logs
Server logs: Terminal running `npm run dev`
Client logs: Browser DevTools Console

### Inspect Network Requests
Check DevTools Network tab for:
- Failed API calls
- Slow requests
- Response payloads

### State Inspection
Use Zustand DevTools:
```javascript
window.__ZUSTAND_DEVTOOLS__
```

## Getting Help

1. Check this guide first
2. Search existing [GitHub Issues](https://github.com/taskmasterpeace/ImgPromptGen/issues)
3. Create detailed bug report with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Console errors
   - Environment details