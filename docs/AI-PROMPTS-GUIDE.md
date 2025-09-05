# AI Prompts Guide - Complete Documentation

## 📍 Prompt Locations

### 1. **Main Prompt Templates** 
**Location**: `/app/actions.ts`
- Story structure detection
- Chapter breakdown generation
- Additional shots generation
- Title card design
- Music video structure analysis
- Music video treatments
- Director style generation

### 2. **Music Video Prompts**
**Location**: `/lib/prompts-mv.ts`
- Artist profile building
- Director style formatting
- Music video specific templates

### 3. **Enhanced Prompts**
**Location**: `/lib/enhanced-mv-prompts.ts`
- Advanced music video prompts
- Performance ratio calculations
- Visual metaphor generation

### 4. **Story Prompts Configuration**
**Location**: `/config/prompts/story-prompts.json`
- Story-specific prompt templates
- Chapter detection rules

### 5. **Director Prompts**
**Location**: `/config/prompts/director-prompts.json`
- Director profile templates
- Style application rules

## 🎯 Structured Output Implementation

All prompts use **Zod schemas** with OpenAI's structured output feature:

### How It Works:
```typescript
const { object } = await generateObject({
  model: openai("gpt-4o"),
  schema: ZodSchema,  // ← Structured output schema
  prompt: promptText,
  system: systemMessage
})
```

### Key Schemas:

#### Story Structure
```typescript
const StoryStructureSchema = z.object({
  chapters: z.array(ChapterSchema),
  detectionMethod: z.enum(['existing', 'ai-generated', 'hybrid']),
  totalChapters: z.number(),
  fullStory: z.string()
})
```

#### Music Video Structure
```typescript
const MusicVideoStructureSchema = z.object({
  songTitle: z.string(),
  artist: z.string(),
  genre: z.string(),
  sections: z.array(MusicVideoSectionSchema)
})
```

## 📝 Main Prompts Breakdown

### Story Mode Prompts

#### 1. Structure Detection (`/app/actions.ts` line 184)
```javascript
structureDetection: `Analyze the following text and split it into logical chapters...`
```
**Purpose**: Identifies chapter boundaries in story text
**Returns**: Structured chapters with metadata

#### 2. Chapter Breakdown (`/app/actions.ts` line 186)
```javascript
chapterBreakdown: `You are a world-class cinematographer creating a visual breakdown...`
```
**Purpose**: Generates shot list with director style
**Includes**: Director profile, visual language, camera techniques

#### 3. Additional Shots (`/app/actions.ts` line 194)
```javascript
additionalShots: `You are expanding a shot list for a story chapter...`
```
**Purpose**: Adds specific coverage types
**Categories**: Action, closeup, establishing, etc.

### Music Video Prompts

#### 1. Music Video Structure (`/app/actions.ts` line 208)
```javascript
musicVideoStructure: `Analyze the provided song lyrics...`
```
**Purpose**: Breaks song into verse/chorus sections
**Section Types**: intro, verse, chorus, bridge, outro, etc.

#### 2. Treatments Generation (`/app/actions.ts` line 210)
```javascript
musicVideoTreatments: `You are creating music video treatments...`
```
**Purpose**: Creates 3 unique visual concepts
**Includes**: Performance ratio, visual theme, hook strategy

#### 3. Section Breakdown (`/app/actions.ts` line 218)
```javascript
musicVideoBreakdown: `You are creating a detailed shot list...`
```
**Purpose**: Generates shots per song section
**References**: Uses configured locations, wardrobe, props

## 🔧 How to Enhance Prompts

### 1. Edit Main Templates
**File**: `/app/actions.ts`
```typescript
const defaultPrompts = {
  structureDetection: `Your enhanced prompt here`,
  // ... other prompts
}
```

### 2. Add Context Variables
Prompts use template literals with replacements:
```typescript
prompt.replace("{directorStyle}", styleString)
      .replace("{customRequest}", userRequest)
```

### 3. Enhance Schema Descriptions
In Zod schemas, use `.describe()` for better AI understanding:
```typescript
z.string().describe("A detailed shot description including camera angle, movement, and framing")
```

### 4. Add Director-Specific Instructions
**Location**: `/app/actions.ts` lines 122-180
```typescript
function buildFilmDirectorStyle(director) {
  // Builds comprehensive director profile
  // Used in prompt generation
}
```

## 🎨 Prompt Enhancement Tips

### 1. **Be Specific About Output Format**
```javascript
"IMPORTANT: Return a JSON object with this EXACT structure:
{
  "sectionId": "verse-1",
  "shots": ["Shot 1 description", "Shot 2 description"],
  "performanceNotes": ["Note 1", "Note 2"]
}"
```

### 2. **Include Reference Constraints**
```javascript
"You MUST use ONLY these approved references:
LOCATIONS: @warehouse, @rooftop
WARDROBE: @streetwear, @formal
PROPS: @motorcycle, @neon_sign"
```

### 3. **Add Visual Themes**
```javascript
"Incorporate these visual themes:
- Neon lighting
- Urban decay
- Futuristic elements"
```

### 4. **Director Style Integration**
```javascript
"DIRECTOR STYLE PROFILE:
DIRECTOR: Christopher Nolan
VISUAL LANGUAGE: IMAX, practical effects
COLOR PALETTE: Desaturated, cool tones
NARRATIVE FOCUS: Non-linear, time manipulation"
```

## 🚀 Advanced Prompt Features

### 1. **Conditional Sections**
```typescript
${includeVisualMetaphors ? "- Include visual metaphors\n" : ""}
${includePerformanceShots ? "- Include performance shots\n" : ""}
```

### 2. **Dynamic Categories**
```typescript
categories.join(", ")  // "action, closeup, establishing"
```

### 3. **Custom Requests**
```typescript
customRequest: "Focus on emotional moments between characters"
```

## 📊 Prompt Performance Optimization

### 1. **Use Smaller Models for Simple Tasks**
- Structure detection: `gpt-4o-mini`
- Complex breakdowns: `gpt-4o`

### 2. **Batch Related Generations**
```typescript
await Promise.all([
  generateStructure(),
  generateTreatments()
])
```

### 3. **Cache Director Profiles**
Reuse formatted director strings across generations

## 🔍 Testing Prompts

### 1. **Test Individual Prompts**
```bash
node test-prompts.js --prompt structureDetection --input "test story"
```

### 2. **Validate Schema Matching**
```typescript
const result = SchemaName.safeParse(aiResponse)
if (!result.success) {
  console.error('Schema mismatch:', result.error)
}
```

## 📈 Monitoring & Improvement

### Track Success Rates
- Log when schema validation fails
- Track generation times
- Monitor token usage

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Schema mismatch | Make fields optional with `.optional()` |
| Missing references | Add explicit "use @reference" instructions |
| Wrong shot count | Specify exact number: "Generate exactly 5 shots" |
| Style not applied | Include director profile at prompt start |

## 🎯 Best Practices

1. **Always Use Structured Output**
   - Ensures consistent response format
   - Enables proper TypeScript typing
   - Reduces parsing errors

2. **Include Examples in Prompts**
   - Show desired output format
   - Provide reference examples
   - Demonstrate style application

3. **Progressive Enhancement**
   - Start with basic prompt
   - Add constraints gradually
   - Test each enhancement

4. **Context Management**
   - Keep prompts under 2000 tokens
   - Prioritize essential information
   - Use system messages for role setting

## 📚 Resources

- [OpenAI Structured Output Docs](https://platform.openai.com/docs/guides/structured-outputs)
- [Zod Schema Documentation](https://zod.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)