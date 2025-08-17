# Director's Palette - Complete User Guide

## 🎬 What is Director's Palette?

Director's Palette is an **AI-powered content creation command center** for generating professional shot lists and visual content. It transforms stories and music concepts into detailed, director-specific shot sequences ready for production.

### Core Purpose
- **Stories** → Cinematic shot lists with specific director styles
- **Music Videos** → Visual breakdowns with artist integration
- **Post Production** → Image generation and reference management
- **Artist Bank** → Centralized artist profile and visual management

---

## 🎯 Main Workflows

### 📚 **Story Mode Workflow**

#### **Step 1: Story Input**
1. **Enter your story** in the main textarea (Ctrl+Enter to extract references)
2. **Select a director** (Christopher Nolan, Quentin Tarantino, etc.)
3. **Add director's notes** for specific creative guidance
4. **Configure advanced options** (title cards, camera details, color palette)

#### **Step 2: Reference Extraction**
1. **Click "Extract Story References"** (or use Ctrl+Enter)
2. **Review extracted characters, locations, props**
3. **Configure reference descriptions** for consistent representation
4. **Generate breakdown** with configured references

#### **Step 3: Shot Generation**
1. **Review generated chapters** with shot lists
2. **Expand/collapse chapters** to see detailed shots
3. **Generate additional shots** for specific chapters if needed
4. **Use copy buttons** to copy individual shots

#### **Step 4: Export & Production**
1. **Export All Shots** - Bulk export with custom formatting
2. **Send to Post Production** - Generate images from shots
3. **Save as Template** - Reuse story setups for future projects

---

### 🎵 **Music Video Mode Workflow**

#### **Step 1: Song Setup**
1. **Select artist** from Artist Bank (or create new)
2. **Enter song details** (title, artist name, genre)
3. **Paste lyrics** (Ctrl+Enter to generate breakdown)
4. **Add video concept** and director notes

#### **Step 2: Artist Integration**
1. **Artist Visual Description** - Detailed description or use Artist Bank data
2. **Toggle Display Mode**:
   - **Show @artist** - Uses artist name/tag as variable
   - **Show Descriptions** - Replaces with full visual description
3. **Choose music video director** style

#### **Step 3: Video Structure Generation**
1. **Generate breakdown** - AI creates music video structure
2. **Configure video settings** (locations, wardrobe, props)
3. **Generate section shots** for each part of the song
4. **Add additional shots** for specific sections

#### **Step 4: Export & Production**
1. **Export All Shots** - Bulk export with artist variable handling
2. **Send to Post Production** - Generate visual content
3. **Save as Template** - Reuse song/artist setups

---

### 🖼️ **Post Production Workflow**

#### **Step 1: Receive Shots**
1. **Shots transferred** from Story or Music Video modes
2. **Review shot queue** with descriptions and metadata
3. **Organize shots** by source (chapter/section)

#### **Step 2: Image Generation**
1. **Gen4 Tab** - Upload reference images and generate new images
2. **Add reference images** (drag, drop, paste, or click)
3. **Enter generation prompt** (Ctrl+Enter to generate)
4. **Configure settings** (aspect ratio, resolution, seed)

#### **Step 3: Image Management**
1. **Auto-save to library** with default tags
2. **Organize in Reference Library** by category (People, Places, Props)
3. **Use generated images** as references for future generations
4. **Export or download** final images

---

## 🎨 **Artist Bank System**

### **Artist Profile Structure**

#### **Identity Information**
- **Artist Name** - Display name (becomes @artist-tag when converted)
- **Real Name** - Legal/actual name
- **Gender** - Male, Female, Non-binary, etc.
- **Race/Ethnicity** - Visual representation
- **Age Range** - "25-30", "Early 20s", etc.
- **Location** - Hometown, city, state for cultural context

#### **Visual Appearance** 
- **Skin Tone** - Specific skin tone description
- **Hair Style** - Current hairstyle and color
- **Fashion Style** - Clothing preferences and style
- **Jewelry** - Accessories and jewelry descriptions
- **Visual Description** - Complete visual summary (auto-generated or manual)

#### **Musical Identity**
- **Genres** - Primary musical styles
- **Sub-genres** - Specific musical niches
- **Vocal Description** - Tone, texture, delivery style
- **Signature Elements** - Unique musical hallmarks

#### **Brand & Personality**
- **Brand Identity** - Authentic storyteller, party starter, etc.
- **MBTI Type** - Personality classification
- **Themes** - Common lyrical themes
- **Target Audience** - Primary demographic

### **Artist Description Building**

#### **Template-Based Generation**
Instead of AI generation, uses smart templates:

```
Template: "A [race] [gender] [age_descriptor] with [physical_traits] wearing [fashion_style] [jewelry_desc]"

From Artist Bank Fields:
- race_ethnicity: "Black" 
- gender: "Male"
- age_range: "25-30" → "in his late twenties"
- skin_tone: "Dark"
- hair_style: "Short fade"
- fashion_style: "Streetwear"
- jewelry: "Gold chains"

Generated: "A Black male in his late twenties with dark skin and short fade wearing streetwear with gold chains"
```

#### **Artist Tag Generation**
Artist names are converted to consistent tags:
- **"Jay-Z"** → **@jay-z**
- **"Lil Wayne"** → **@lil_wayne** 
- **"21 Savage"** → **@21_savage**
- **"A$AP Rocky"** → **@asap_rocky**

---

## 🔄 **Variable System**

### **Core Variables**
| Variable | Source | Example Output |
|----------|--------|----------------|
| `@artist` | Artist Bank name | "Jay-Z" |
| `@artist-desc` | Generated description | "A Black male in his late twenties..." |
| `@artist-tag` | Processed name | "jay-z" |
| `@director` | Selected director | "Christopher Nolan" |
| `@chapter` | Story chapter | "Chapter 1: The Beginning" |
| `@section` | Music video section | "Verse 1" |

### **Variable Processing Rules**
1. **Case Sensitivity**: Variables are case-insensitive (@ARTIST = @artist)
2. **Replacement Priority**: Description mode replaces @artist with full description
3. **Fallback Values**: @artist defaults to "artist" if no name provided
4. **Tag Generation**: All special characters removed, spaces → underscores, lowercase

---

## 📤 **Bulk Export System**

### **Export Configuration**
- **Prefix**: Text added to beginning of every shot
- **Suffix**: Text added to end of every shot
- **Variable Mode**: Choose @artist replacement (name vs description)
- **Format**: Text, numbered list, JSON, or CSV
- **Metadata**: Include director, timestamp, source information

### **Export Formats**

#### **Plain Text**
```
Wide shot of Jay-Z walking through urban streets
Close-up of hands counting money
Aerial view of city skyline at sunset
```

#### **Numbered List**
```
1. Wide shot of Jay-Z walking through urban streets
2. Close-up of hands counting money  
3. Aerial view of city skyline at sunset
```

#### **With Prefix/Suffix**
```
Prefix: "Camera: Wide shot, "
Suffix: ", golden hour lighting"

Output:
Camera: Wide shot, Wide shot of Jay-Z walking through urban streets, golden hour lighting
Camera: Wide shot, Close-up of hands counting money, golden hour lighting
```

### **Export Workflow**
1. Generate shots in Story or Music Video mode
2. Click **"Export All Shots"** button
3. Configure prefix, suffix, and variables
4. Preview formatted output
5. Copy to clipboard or download file

---

## 🏗️ **Template System**

### **Story Templates**
Pre-built story scenarios for testing and development:
- **Action Car Chase** - High-energy pursuit sequence
- **Psychological Thriller** - Suspense and tension building
- **Character Drama** - Emotional dialogue scenes

### **Music Video Templates**  
Pre-built song scenarios:
- **Hip-Hop Urban** - City lifestyle and success themes
- **Pop Ballad** - Emotional storytelling and nostalgia
- **Rock Performance** - High-energy concert footage

### **Template Workflow**
1. **Load Template** - Instantly populate forms with test data
2. **Modify as Needed** - Adjust template content
3. **Generate Shots** - Use template for shot generation
4. **Save Custom Templates** - Create your own reusable templates

---

## ⚙️ **Technical Architecture**

### **State Management (Zustand Stores)**
- **`app-store.ts`** - Global application state (mode, loading, projects)
- **`music-video-store.ts`** - Music video specific state
- **`templates-store.ts`** - Template management
- **`post-production-store.ts`** - Shot queue and image generation

### **Database Layer (IndexedDB)**
- **Film Directors** - Curated and custom director profiles
- **Music Video Directors** - Music video specific directors
- **Artist Profiles** - Complete artist information
- **Reference Library** - Generated and uploaded images
- **Templates** - Saved story and music video templates

### **Server Actions (Next.js)**
- **`app/actions/story/`** - Story generation and reference extraction
- **`app/actions/music-video/`** - Music video breakdown generation
- **`app/actions/artists/`** - Artist profile management
- **`app/post-production/api/`** - Image generation and processing

---

## 🚀 **Advanced Features**

### **Keyboard Shortcuts**
- **Ctrl+Enter** in story textarea → Extract references
- **Ctrl+Enter** in lyrics textarea → Generate breakdown
- **Ctrl+Enter** in Gen4 prompt → Generate image

### **Paste Functionality**
- **Gen4 Reference Upload** - Paste images directly from clipboard
- **Post Production Workspace** - Paste images or shots
- **Cross-browser support** with fallback methods

### **Copy Features**
- **Individual shots** - Hover and click copy button
- **Bulk export** - Copy all shots with formatting
- **Multi-select mode** - Select and copy specific shots
- **Variable-aware** - Copies respect @artist toggle state

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **@artist showing as literal text**
- **Problem**: Shots show "@artist" instead of artist name
- **Solution**: Ensure artist name is entered in Artist Bank, verify variable processing

#### **Reference extraction not working**
- **Problem**: "Extract References" button doesn't extract characters/locations
- **Solution**: Verify OpenAI API key is configured, check network connection

#### **Export not including prefix/suffix**
- **Problem**: Exported shots don't include formatting
- **Solution**: Verify prefix/suffix fields are filled, check export preview

#### **Clipboard copy failing**
- **Problem**: Copy to clipboard shows error
- **Solution**: Browser permissions issue, use download option instead

### **Performance Tips**
- **Use templates** for faster testing and development
- **Batch operations** instead of individual shot processing
- **Clear unused data** to maintain performance
- **Use keyboard shortcuts** for efficient workflow

---

## 🎯 **Best Practices**

### **For Story Creation**
1. **Start with clear structure** - Well-defined chapters or acts
2. **Use specific character names** - Helps with reference extraction
3. **Include location details** - Enables better shot generation
4. **Be specific in director notes** - Directly influences shot style

### **For Music Video Creation**
1. **Complete Artist Bank profile** before starting
2. **Use descriptive lyrics** - More visual lyrics = better shots
3. **Define clear video concept** - Helps guide shot generation
4. **Test with templates** - Use sample songs for quick testing

### **For Efficient Workflow**
1. **Use keyboard shortcuts** - Faster than clicking buttons
2. **Save as templates** - Reuse successful configurations
3. **Bulk export** - Export all shots at once with formatting
4. **Organize in Post Production** - Use categories and tags

---

## 📈 **Future Roadmap**

### **Planned Features**
- **Album Concepts** - Multi-song visual planning
- **Artist Conversations** - AI chat with artist personalities  
- **Shooting Schedules** - Production planning and organization
- **Advanced Image Generation** - Consistent artist appearance across shots
- **Collaboration Tools** - Team-based project sharing
- **Production Integration** - Export to Final Cut, Premiere, etc.

### **Application Evolution**
Director's Palette is evolving from a shot generation tool into a comprehensive **AI Content Creation Command Center** supporting:
- Story and screenplay development
- Music video and album planning
- Character and artist development
- Visual reference management
- Production pipeline integration

---

*This guide covers the current state of Director's Palette. For technical documentation, see DEVELOPER-REFERENCE.md*