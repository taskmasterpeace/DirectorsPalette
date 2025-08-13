# Artist Description Replacement System

## Overview
Allow users to define a detailed visual description for `@artist` that can be toggled on/off in the shot display.

## User Flow

1. **Input Artist Details**
   ```
   Artist Name: Ron-Ron
   Visual Description: Ron-Ron, a confident Black man with gold chains, designer streetwear, face tattoos, and diamond grills
   ```

2. **Toggle Display Mode**
   - Variable Mode: Shows `@artist`
   - Description Mode: Shows full description

3. **Example Output**

   **Variable Mode (Default):**
   ```
   "Wide shot of @artist walking through urban streets..."
   ```

   **Description Mode:**
   ```
   "Wide shot of Ron-Ron, a confident Black man with gold chains, designer streetwear, face tattoos, and diamond grills walking through urban streets..."
   ```

## Implementation Steps

### Step 1: Add Visual Description Field
```typescript
// In MusicVideoMode component
const [artistVisualDescription, setArtistVisualDescription] = useState('')
const [showDescriptions, setShowDescriptions] = useState(false)
```

### Step 2: Add UI Components
```tsx
{/* Artist Visual Description */}
<div>
  <label className="text-sm font-medium text-white mb-1 block">
    Artist Visual Description (optional)
  </label>
  <Textarea
    placeholder="Detailed visual description: appearance, style, distinctive features..."
    value={artistVisualDescription}
    onChange={(e) => setArtistVisualDescription(e.target.value)}
    rows={2}
    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
  />
  <p className="text-xs text-slate-400 mt-1">
    This description will replace @artist when "Show Descriptions" is enabled
  </p>
</div>

{/* Toggle Button */}
<Button
  variant="outline"
  size="sm"
  onClick={() => setShowDescriptions(!showDescriptions)}
  className="border-slate-600"
>
  {showDescriptions ? "Show Variables" : "Show Descriptions"}
</Button>
```

### Step 3: Display Logic
```typescript
// Helper function to process shots
const processShot = (shot: string) => {
  if (showDescriptions && artistVisualDescription) {
    return shot.replace(/@artist/gi, artistVisualDescription)
  }
  return shot
}

// In shot display
<div className="text-sm text-slate-300">
  {processShot(shot)}
</div>
```

### Step 4: Export Functionality
When copying shots, users can choose to copy with variables or descriptions:

```typescript
const handleCopyWithDescriptions = (shots: string[]) => {
  const processed = shots.map(shot => 
    artistVisualDescription 
      ? shot.replace(/@artist/gi, artistVisualDescription)
      : shot
  )
  navigator.clipboard.writeText(processed.join('\n\n'))
}
```

## Advanced Features (Future)

### Multiple Variables
```typescript
const variables = {
  '@artist': 'Ron-Ron',
  '@artist_full': 'Ron-Ron, a confident Black man with gold chains...',
  '@artist_style': 'gold chains, designer streetwear, face tattoos',
  '@artist_mood': 'confident, street-smart, commanding presence'
}
```

### Context-Aware Descriptions
```typescript
// Different descriptions for different shot types
const contextDescriptions = {
  'close-up': 'Ron-Ron\'s intense gaze, face tattoos visible',
  'wide': 'Ron-Ron in full designer outfit',
  'performance': 'Ron-Ron commanding the scene'
}
```

### AI-Generated Descriptions
```typescript
// Generate description from artist profile
const generateArtistDescription = async (profile: ArtistProfile) => {
  // Use AI to create detailed visual description
  // Based on genres, themes, visual style
}
```

## Benefits

1. **Flexibility**: Users can toggle between abstract and specific
2. **Clarity**: Detailed descriptions help visualize shots
3. **Reusability**: Templates stay generic with variables
4. **Export Options**: Can export with or without replacements
5. **Production Ready**: Descriptions help crew understand the vision

## Example Use Cases

### Hip-Hop Artist
```
@artist = "Lil Wayne, a Black man with dreads, face tattoos, gold grills, wearing designer clothes and jewelry"
```

### Pop Artist
```
@artist = "Taylor Swift, a blonde woman in a sparkly dress with red lipstick and vintage-inspired styling"
```

### Rock Band
```
@artist = "the lead singer, a long-haired man in leather jacket and ripped jeans with tattoo sleeves"
```

### Electronic Artist
```
@artist = "the DJ in futuristic LED helmet and metallic outfit"
```

## Storage
Save descriptions in the artist profile for reuse:

```typescript
interface ArtistProfile {
  artist_name: string
  visual_description?: string  // New field
  // ... other fields
}
```