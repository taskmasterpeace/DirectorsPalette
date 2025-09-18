# Image Reference Library

The Image Reference Library is a comprehensive system for managing and organizing reference images in Director's Palette. It follows the same patterns as the Prompt Library but is specifically designed for image assets.

## Features

### Core Functionality
- **Upload & Storage**: Upload images with drag & drop or file browser
- **Categorization**: Organize images into predefined or custom categories
- **Search & Filter**: Search by name, tags, reference codes, or category
- **Quick Access**: Star favorite images for easy access
- **Reference Tags**: Assign @reference tags for easy linking

### Categories (Default)
- **Characters** (👤) - Character references, actors, personas
- **Locations** (🏞️) - Settings, backgrounds, environments
- **Props** (🎭) - Objects, items, accessories
- **Costumes** (👕) - Clothing, wardrobe, styling
- **Lighting** (💡) - Lighting setups, mood references
- **Mood/Atmosphere** (🌙) - Color palettes, atmospheric references
- **Custom** (📁) - User-defined categories

### Integration Points
- **Shot Creator**: Send images directly to Shot Creator for reference
- **Unified Gallery**: Images are added to the gallery when sent
- **Supabase Storage**: Persistent cloud storage for uploaded images
- **Cross-Platform**: Works across all Director's Palette modes

## Usage

### Adding Images
1. **Upload**: Click "Upload" button or drag & drop images
2. **Details**: Enter name, category, tags, and reference code
3. **Save**: Image is uploaded to Supabase Storage and indexed

### Managing References
1. **Search**: Use the search bar to find images by any criteria
2. **Filter**: Select categories to narrow results
3. **Quick Access**: Star frequently used images
4. **Edit**: Update metadata, tags, and categories

### Sending to Shot Creator
1. **Select Image**: Click on any image thumbnail
2. **Send**: Use the "Send" button to add to Shot Creator
3. **Gallery**: Image is automatically added to unified gallery

## Technical Implementation

### Store Structure
```typescript
interface SavedImageReference {
  id: string
  userId: string
  name: string
  url: string // Supabase Storage URL
  categoryId: string
  tags: string[]
  isQuickAccess: boolean
  reference?: string // @reference tag
  usage: { count: number; lastUsed: string }
  metadata: {
    fileSize?: number
    dimensions?: { width: number; height: number }
    format?: string
    source?: string
    createdAt: string
    updatedAt: string
  }
}
```

### Database Schema
- `user_image_references` - Main image reference data
- `user_image_reference_categories` - Custom user categories
- `image-references` storage bucket - File storage

### Integration with Unified Gallery
Images sent to Shot Creator are automatically added to the unified gallery with:
- Reference tags preserved
- Source marked as 'shot-creator'
- Permanent storage flag set to true
- Zero credits used (reference images)

## Styling & Theme

The Image Reference Library uses the consistent purple/indigo theme:
- **Primary**: Purple-600/700 for buttons and highlights
- **Borders**: Purple-500/30 for subtle outlines
- **Backgrounds**: Slate-900/50 for cards and modals
- **Text**: White primary, gray-400 secondary

## Future Enhancements

- **Batch Upload**: Multiple file selection and upload
- **Image Editing**: Basic crop, resize, color adjustments
- **Collections**: Group related images into collections
- **Sharing**: Share reference collections between users
- **AI Tagging**: Automatic tag generation from image content
- **Import from URL**: Add images from external URLs