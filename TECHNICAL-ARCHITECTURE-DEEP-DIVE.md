# Director's Palette - Technical Architecture Deep Dive

## 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

**Director's Palette** is built as a modern, scalable web application using a microservices-inspired architecture with clear separation of concerns and professional development practices.

---

## 💻 **FRONTEND ARCHITECTURE**

### **Core Technology Stack**
```typescript
Framework: Next.js 15.2.4 (App Router architecture)
Language: TypeScript 5 (strict type checking)
UI Library: React 19 (latest stable)
Styling: Tailwind CSS 4 + shadcn/ui components
State Management: Zustand (lightweight, performant)
Build Tool: Vercel with pnpm package management
```

### **Component Architecture**
```
/app/ (Next.js App Router)
├── page.tsx (Main application with mode selector)
├── post-production/ (Complete post-production workflow)
├── admin/ (Model management and cost monitoring)
├── auth/ (Authentication callbacks and flows)
└── actions/ (Server-side AI generation logic)

/components/ (Reusable UI components)
├── ui/ (shadcn/ui base components)
├── auth/ (Authentication components)
├── mobile/ (Mobile-optimized components)
├── containers/ (Mode-specific containers)
├── story/ (Story generation components)
├── music-video/ (Music video components)
├── commercial/ (Commercial generation components)
└── shared/ (Cross-mode shared components)

/lib/ (Business logic and utilities)
├── ai-providers/ (OpenRouter model configurations)
├── post-production/ (Image and video processing)
├── validation/ (Data validation and sanitization)
├── auth.ts (Authentication system)
└── supabase.ts (Database integration)

/stores/ (State management)
├── app-store.ts (Global application state)
├── story-store.ts (Story-specific state)
├── post-production-store.ts (Post-production state)
└── templates-store.ts (Template management)
```

### **State Management Strategy**
```typescript
// Zustand stores with TypeScript and persistence
interface AppState {
  mode: 'story' | 'music-video' | 'commercial' | 'children-book'
  isLoading: boolean
  currentProjectId: string | null
  showProjectManager: boolean
}

// Persistent storage for user sessions
const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set, get) => ({
        // State and actions implementation
      }),
      {
        name: 'dsvb:session:v3',
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
)
```

---

## 🔐 **AUTHENTICATION & SECURITY ARCHITECTURE**

### **Universal Authentication System**
```typescript
// Hybrid authentication supporting multiple backends
interface AuthSession {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
}

// Graceful degradation: Supabase → localStorage
export async function universalGetSession(): Promise<AuthSession> {
  if (USE_SUPABASE && supabase) {
    // Supabase authentication with Google OAuth
    return await getSupabaseSession()
  } else {
    // Fallback to localStorage for development/testing
    return getLocalStorageSession()
  }
}
```

### **Security Implementation**
```sql
-- Row Level Security (RLS) policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Secure environment variable handling
NEXT_PUBLIC_SUPABASE_URL (client-safe)
SUPABASE_SERVICE_ROLE_KEY (server-only)
OPENROUTER_API_KEY (server-only)
GOOGLE_CLIENT_ID/SECRET (OAuth configuration)
```

### **Admin Access Control**
```typescript
// Admin-only features with email-based access control
const ADMIN_EMAIL = 'taskmasterpeace@gmail.com'

// Model management restricted to admin
interface AdminModelSelection {
  [functionName: string]: string // function -> selected model ID
}

// Cost monitoring and model switching
export function getModelForFunction(
  functionName: string, 
  adminConfig?: AdminModelSelection
): ModelConfig {
  const selectedModelId = adminConfig?.[functionName] || 
                         FUNCTION_MODEL_CONFIG[functionName]?.defaultModel
  return OPENROUTER_MODELS[selectedModelId]
}
```

---

## 🤖 **AI INTEGRATION ARCHITECTURE**

### **OpenRouter Integration**
```typescript
// Multi-model AI provider with fallback handling
interface ModelConfig {
  id: string
  name: string
  provider: string
  pricing: { prompt: number; completion: number }
  context: number
  capabilities: ('text' | 'image' | 'reasoning' | 'fast' | 'creative')[]
  isFree: boolean
  isReasoning: boolean
}

// Function-specific model assignment
export const FUNCTION_MODEL_CONFIG: Record<string, FunctionModelConfig> = {
  'story-breakdown': {
    defaultModel: 'deepseek/deepseek-chat-v3.1',
    suggestedModels: ['moonshotai/kimi-vl-a3b-thinking', 'baidu/ernie-4.5-21b-a3b'],
    freeAlternatives: ['moonshotai/kimi-k2:free', 'moonshotai/kimi-dev-72b:free']
  }
  // ... additional function configurations
}
```

### **Server Actions Pattern**
```typescript
// Next.js server actions for AI operations
"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

export async function generateStoryBreakdown(
  story: string,
  director: string,
  references: ExtractedReferences
) {
  const result = await generateObject({
    model: openai(getModelForFunction('story-breakdown')),
    schema: StoryBreakdownSchema,
    prompt: constructStoryPrompt(story, director, references)
  })
  
  return { success: true, data: result.object }
}
```

### **Character Consistency System**
```typescript
// Proprietary character reference system
interface ReferenceSchema {
  id: string
  reference: string        // @character_name format
  name: string            // Display name
  description: string     // Visual description
  appearances: string[]   // Where character appears
}

// Automatic extraction and propagation
export async function extractStoryReferences(story: string) {
  const { object: references } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: StoryReferencesSchema,
    prompt: `Extract characters, locations, props with @reference format...`
  })
  
  return references // Propagated across all subsequent generations
}
```

---

## 🎨 **IMAGE & VIDEO PROCESSING PIPELINE**

### **Replicate Integration**
```typescript
// Image generation with Gen4
interface Gen4Generation {
  imageUrl: string
  prompt: string
  settings: Gen4Settings
  referenceImages: Gen4ReferenceImage[]
  cost: number
  credits: number
}

// Video generation with Seedance
interface VideoGeneration {
  videoUrl: string
  duration: number
  quality: '720p' | '1080p'
  model: 'seedance-light' | 'seedance-pro'
  cost: number
  credits: number
}
```

### **Reference Image System**
```typescript
// 1st/2nd/3rd reference position management
interface ReferencePosition {
  position: 1 | 2 | 3
  imageUrl?: string
  description?: string
  characterTag?: string
  isOccupied: boolean
}

// Mobile-optimized reference selector
export function MobileReferenceSelector({
  onSendToPosition: (position: 1 | 2 | 3) => void
  currentReferenceImages: ReferencePosition[]
}) {
  // Bottom sheet UI for touch-friendly assignment
}
```

---

## 📱 **MOBILE-FIRST IMPLEMENTATION**

### **Responsive Design Strategy**
```typescript
// Progressive enhancement for mobile
const ModeSelector = () => {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Mobile: 2x2 grid for touch targets */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800 rounded-xl sm:hidden">
        <ModeButton mode="story" icon="📖" label="Story" />
        <ModeButton mode="children-book" icon="📚" label="Kids Book" />
        {/* Additional modes */}
      </div>
      
      {/* Desktop: Single row layout */}
      <div className="hidden sm:grid sm:grid-cols-4 sm:gap-1">
        {/* Desktop layout */}
      </div>
    </div>
  )
}
```

### **Touch Optimization**
```css
/* iOS safe area handling */
@supports (-webkit-touch-callout: none) {
  .ios-safe-area {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Touch target minimum sizes */
.touch-target {
  min-height: 44px; /* iOS accessibility requirement */
  min-width: 44px;
}

/* Prevent zoom on input focus */
input, textarea, select {
  font-size: 16px; /* Prevents iOS zoom */
}
```

### **Mobile Post-Production Redesign**
```typescript
// Fixed horrible 6-tab mobile layout
<Tabs value={activeTab} onValueChange={setActiveTab}>
  {/* Mobile: Dropdown selector */}
  <div className="block sm:hidden">
    <Select value={activeTab} onValueChange={setActiveTab}>
      <SelectTrigger className="w-full h-12 text-base">
        <SelectValue />
      </SelectTrigger>
      {/* Touch-friendly dropdown options */}
    </Select>
  </div>

  {/* Desktop: Original tab layout */}
  <TabsList className="hidden sm:grid grid-cols-6 w-full">
    {/* Desktop tabs */}
  </TabsList>
</Tabs>
```

---

## 🗄️ **DATABASE & STORAGE ARCHITECTURE**

### **Supabase Integration**
```sql
-- Complete database schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  credits_remaining INTEGER DEFAULT 2500,
  tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('story', 'music-video', 'commercial', 'children-book')),
  content JSONB NOT NULL,
  character_references JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  function_type TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  credits_used INTEGER NOT NULL,
  cost_usd DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Storage Strategy**
```typescript
// Image and video storage with Supabase
export const uploadImage = async (file: File, bucket: string = 'images') => {
  const filePath = `${bucket}/${Date.now()}.${file.name.split('.').pop()}`
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)
    
  return { data: { ...data, publicUrl }, error }
}

// Reference image management
export const saveReferenceImage = async (
  imageUrl: string, 
  position: 1 | 2 | 3,
  userId: string
) => {
  // Store reference with position for character consistency
}
```

---

## 🎯 **PERFORMANCE & OPTIMIZATION**

### **Load Optimization**
```typescript
// Dynamic imports for code splitting
const ProjectManager = dynamic(
  () => import("@/components/project-manager"),
  { ssr: false }
)

// Lazy loading for heavy components
const PostProductionPage = lazy(() => import("./post-production/page"))

// Progressive enhancement for mobile
const isMobile = window.innerWidth < 768
const complexAnimations = !isMobile && !isLowPowerDevice
```

### **Cost Optimization**
```typescript
// Smart model routing for cost efficiency
export function getOptimalModel(
  functionType: string,
  qualityRequired: 'fast' | 'balanced' | 'premium'
): ModelConfig {
  if (qualityRequired === 'fast') {
    return getFreeModel(functionType) || getCheapestModel(functionType)
  }
  
  return getBalancedModel(functionType)
}

// Real-time cost preview
export function calculateGenerationCost(
  model: ModelConfig,
  estimatedTokens: { input: number; output: number }
): { cost: number; credits: number } {
  const cost = (estimatedTokens.input * model.pricing.prompt + 
                estimatedTokens.output * model.pricing.completion) / 1000000
  const credits = Math.ceil(cost * 100) // Convert to point system
  return { cost, credits }
}
```

---

## 🎨 **CREATIVE WORKFLOW IMPLEMENTATION**

### **Story Generation Pipeline**
```typescript
// Complete story processing pipeline
export async function processStoryWorkflow(
  story: string,
  directorStyle: string,
  userPreferences: StoryPreferences
): Promise<StoryBreakdown> {
  
  // Step 1: Extract references
  const references = await extractStoryReferences(story)
  
  // Step 2: Generate breakdown with character consistency
  const breakdown = await generateStoryBreakdown(
    story, 
    directorStyle, 
    references
  )
  
  // Step 3: Apply character consistency across all shots
  const consistentShots = applyCharacterConsistency(
    breakdown.shots,
    references
  )
  
  return { ...breakdown, shots: consistentShots }
}
```

### **Character Consistency Engine**
```typescript
// Proprietary character consistency system
interface CharacterReference {
  tagName: string      // @john_doe
  displayName: string  // John Doe
  description: string  // Visual characteristics
  consistency: {
    clothing: string[]
    physicalTraits: string[]
    accessories: string[]
  }
}

export function applyCharacterConsistency(
  shots: string[],
  characters: CharacterReference[]
): string[] {
  return shots.map(shot => {
    let consistentShot = shot
    
    characters.forEach(character => {
      if (shot.includes(character.tagName)) {
        consistentShot = enhanceWithCharacterDetails(
          consistentShot,
          character
        )
      }
    })
    
    return consistentShot
  })
}
```

---

## 🎭 **DIRECTOR STYLE SYSTEM**

### **Current Implementation (Pre-Launch)**
```typescript
// Director style database (needs legal review)
export const curatedFilmDirectors = [
  {
    id: 'christopher-nolan',
    name: 'Christopher Nolan',
    description: 'IMAX-scale mind-bending epics',
    visualLanguage: 'Large-format cinematography with practical effects...',
    // RISK: Using real director names
  }
]
```

### **Legal-Safe Alternative (Post-Launch)**
```typescript
// Generic style categories (legally safe)
export const cinematicStyles = [
  {
    id: 'cerebral-sci-fi',
    name: 'Cerebral Sci-Fi Style',
    description: 'Mind-bending epics with intricate narratives',
    visualLanguage: 'Large-format cinematography with practical effects...',
    // SAFE: Generic descriptive categories
  },
  {
    id: 'kinetic-character-driven',
    name: 'Kinetic Character-Driven Style', 
    description: 'Fast-paced character-focused storytelling',
    visualLanguage: 'Dynamic camera movements, quick cuts...',
  },
  {
    id: 'atmospheric-contemplative',
    name: 'Atmospheric Contemplative Style',
    description: 'Moody, thoughtful visual storytelling',
    visualLanguage: 'Wide shots, natural lighting...',
  }
]
```

### **Transition Strategy**
```typescript
// Phased migration from director names to style categories
export function migrateDirectorStyles() {
  const styleMapping = {
    'christopher-nolan': 'cerebral-sci-fi',
    'martin-scorsese': 'kinetic-character-driven',
    'denis-villeneuve': 'atmospheric-contemplative',
    'wes-anderson': 'symmetrical-whimsical',
    'david-fincher': 'clinical-precision'
  }
  
  // Migrate existing projects to new style system
  // Maintain user experience while avoiding legal issues
}
```

---

## 💳 **CREDIT SYSTEM IMPLEMENTATION**

### **Point Calculation Engine**
```typescript
interface CreditCalculation {
  textGeneration: number
  imageGeneration: number  
  videoGeneration: number
  total: number
  estimatedCost: number
}

export function calculateCreditsRequired(
  operations: GenerationOperation[]
): CreditCalculation {
  let credits = 0
  let cost = 0
  
  operations.forEach(op => {
    const model = getModelForOperation(op.type)
    if (model.isFree) {
      // FREE models use 0 credits
      credits += 0
      cost += 0
    } else {
      const opCredits = getCreditsForOperation(op.type, model)
      credits += opCredits
      cost += opCredits * 0.01 // 1 credit = $0.01
    }
  })
  
  return { total: credits, estimatedCost: cost }
}
```

### **Rate Limiting Implementation**
```typescript
// Prevent cost overruns with smart rate limiting
export async function enforceRateLimits(
  userId: string,
  operationType: 'text' | 'image' | 'video',
  creditsRequired: number
): Promise<{ allowed: boolean; reason?: string }> {
  
  const user = await getUserTier(userId)
  const usage = await getMonthlyUsage(userId)
  
  // Video generation limits (most expensive)
  if (operationType === 'video') {
    const videoLimits = {
      free: 0,
      pro: 25,      // 25 videos/month at $20 tier
      studio: 100,  // 100 videos/month at $50 tier
      enterprise: 1000
    }
    
    if (usage.videosThisMonth >= videoLimits[user.tier]) {
      return { 
        allowed: false, 
        reason: `Video limit reached. Upgrade to ${getNextTier(user.tier)}` 
      }
    }
  }
  
  // Credit balance check
  if (user.creditsRemaining < creditsRequired) {
    return {
      allowed: false,
      reason: 'Insufficient credits. Upgrade tier or wait for monthly reset.'
    }
  }
  
  return { allowed: true }
}
```

---

## 🌐 **API & INTEGRATION ARCHITECTURE**

### **External API Management**
```typescript
// OpenRouter API integration with fallback handling
export class OpenRouterClient {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'
  
  async generateText(
    model: string,
    prompt: string,
    options: GenerationOptions
  ): Promise<GenerationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          ...options
        })
      })
      
      return await response.json()
    } catch (error) {
      // Fallback to alternative model or error handling
    }
  }
}

// Replicate API for image/video generation
export class ReplicateClient {
  async generateImage(prompt: string, references?: string[]): Promise<ImageResult> {
    // Gen4 image generation with reference support
  }
  
  async generateVideo(prompt: string, options: VideoOptions): Promise<VideoResult> {
    // Seedance Light/Pro video generation
  }
}
```

### **Cost Tracking & Analytics**
```typescript
// Real-time usage tracking
export async function trackUsage(
  userId: string,
  operation: UsageOperation
): Promise<void> {
  const cost = calculateRealCost(operation)
  const credits = convertToCredits(cost)
  
  await supabase.from('ai_usage').insert({
    user_id: userId,
    model_id: operation.model,
    function_type: operation.type,
    tokens_used: operation.tokens,
    credits_used: credits,
    cost_usd: cost,
    created_at: new Date().toISOString()
  })
  
  // Update user credit balance
  await updateUserCredits(userId, -credits)
}
```

---

## 🎯 **DEPLOYMENT & SCALING ARCHITECTURE**

### **Vercel Deployment Strategy**
```json
// vercel.json configuration
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "env": {
    "OPENROUTER_API_KEY": "@openrouter_api_key",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "functions": {
    "app/api/*/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### **Scalability Considerations**
```typescript
// Horizontal scaling preparation
interface ScalingStrategy {
  database: 'Supabase Pro' // Handles 100GB+ with connection pooling
  frontend: 'Vercel Pro'   // Global CDN and edge functions
  ai_apis: 'OpenRouter'    // Handles model scaling automatically
  storage: 'Supabase Storage' // 100GB+ with CDN integration
}

// Performance monitoring
export function trackPerformance() {
  // Real-time monitoring of:
  // - API response times
  // - Model performance metrics  
  // - User experience analytics
  // - Cost per operation tracking
}
```

---

## 🚀 **INNOVATION & DIFFERENTIATION**

### **Proprietary Technologies**
```
1. Character Consistency System
   - @reference_name technology for visual consistency
   - Automatic propagation across all generations
   - Professional workflow integration

2. Multi-Format Platform
   - Only platform offering Story + Music Video + Commercial + Children's Books
   - Unified workflow across all creative formats
   - Consistent user experience regardless of output type

3. FREE Model Integration
   - 6 high-quality models at $0 cost
   - Unlimited text generation capability
   - Massive competitive advantage

4. Mobile-First Creative Tools
   - Professional mobile interface for creative work
   - One-handed operation optimization
   - Touch-friendly creative workflow
```

### **Market Differentiation**
```
Unique Positioning:
- Complete creative workflow (concept to production)
- Character consistency across unlimited projects
- Multi-format output from single input
- Professional mobile interface
- Cost efficiency through FREE model access
- Real-time model selection and optimization

Competitive Moats:
- FREE model access (competitors can't match)
- Character consistency technology (proprietary)
- Multi-format platform (unique in market)
- Mobile-first design (superior to competitors)
- Cost optimization intelligence (strategic advantage)
```

---

## 📊 **SUCCESS METRICS & KPIs**

### **User Engagement Metrics**
```
- Daily/Monthly Active Users (DAU/MAU)
- Generation completion rates
- Character consistency usage
- Multi-format adoption rates
- Mobile vs desktop usage patterns
```

### **Business Metrics**
```
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Monthly Recurring Revenue (MRR)
- Churn rate by tier
- Credit utilization rates
- Model usage distribution
```

### **Cost Efficiency Metrics**
```
- Cost per generation by model
- FREE model usage percentage
- Premium model adoption rates
- Video generation utilization
- Rate limiting effectiveness
```

**Director's Palette represents a significant innovation in creative AI tools, combining proprietary character consistency technology with unprecedented cost efficiency and professional workflow integration across multiple creative formats.**