/**
 * Commercial Prompt Templates
 * Organized, improvable AI prompts for commercial generation
 * Following Director's Palette patterns with @brand/@product variables
 */

export const COMMERCIAL_PROMPTS = {
  // Core Generation Prompts
  GENERATION: {
    TEN_SECOND: `You are a world-class commercial director creating a high-impact 10-second commercial. Generate a structured shot list that maximizes engagement and drives action in just 10 seconds.

COMMERCIAL BRIEF:
Brand: @brand
Product/Service: @product
Target Audience: @audience
Platform: @platform
Creative Concept: @concept

DIRECTOR STYLE PROFILE:
@directorStyle

PLATFORM REQUIREMENTS:
@platformRequirements

Create a 5-shot structure optimized for maximum impact:
1. HOOK (0-2s): Immediate attention-grabber that stops the scroll
2. PROBLEM/NEED (2-4s): Establish the pain point or desire @product addresses  
3. SOLUTION (4-6s): Show @product as the perfect solution
4. BENEFIT (6-8s): Demonstrate key value proposition or transformation
5. CTA (8-10s): Clear call-to-action with @brand emphasis

Each shot should:
- Follow the director's specific visual style and pacing preferences
- Include precise timing and camera specifications
- Incorporate @brand and @product naturally
- Match platform optimization requirements
- Create seamless flow between shots

Generate shots that authentically reflect the director's visual language, energy, and storytelling approach.`,

    THIRTY_SECOND: `You are a master commercial storyteller creating a compelling 30-second narrative commercial. Generate a complete story arc with emotional engagement and clear brand messaging.

COMMERCIAL BRIEF:
Brand: @brand
Product/Service: @product
Target Audience: @audience
Platform: @platform
Creative Concept: @concept

DIRECTOR STYLE PROFILE:
@directorStyle

PLATFORM REQUIREMENTS:
@platformRequirements

Create a 6-shot narrative structure:
1. SETUP (0-5s): Introduce relatable character/situation
2. CONFLICT (5-10s): Present the problem/challenge @product solves
3. DISCOVERY (10-15s): Character encounters @product/@brand
4. TRANSFORMATION (15-22s): Show how @product improves their life
5. RESOLUTION (22-27s): Happy outcome, satisfied customer
6. BRAND CLOSE (27-30s): Strong @brand message with clear CTA

Each shot must:
- Advance the emotional narrative while showcasing product benefits
- Reflect the director's unique visual and storytelling style
- Include specific camera work, lighting, and pacing details
- Integrate @brand messaging naturally throughout
- Meet platform-specific requirements for engagement

Generate shots that tell a complete, compelling story in 30 seconds.`,

    PRODUCT_DEMO: `You are creating a product demonstration commercial that showcases @product's key features and benefits visually.

PRODUCT DETAILS:
Brand: @brand
Product: @product
Key Features: @features
Target Audience: @audience
Platform: @platform

DIRECTOR STYLE PROFILE:
@directorStyle

Focus on creating shots that:
- Clearly demonstrate product functionality
- Show before/after transformations
- Highlight unique selling points
- Include hero product shots with premium lighting
- Show product in real-world usage scenarios

Generate demonstration shots that make @product irresistible to @audience while maintaining the director's signature style.`,

    SERVICE_EXPLANATION: `You are creating a service commercial that makes the intangible benefits of @product tangible and compelling.

SERVICE DETAILS:
Brand: @brand
Service: @product
Key Benefits: @benefits
Target Audience: @audience
Platform: @platform

DIRECTOR STYLE PROFILE:
@directorStyle

Since services require conceptual visualization:
- Use metaphors and visual analogies to represent benefits
- Show customer transformation and emotional outcomes
- Focus on the "after" state - how life improves with the service
- Use testimonial-style authenticity where appropriate
- Create aspirational scenarios that audience can relate to

Generate shots that make @product's value clear and emotionally compelling.`
  },

  // Platform-Specific Optimization
  PLATFORM: {
    TIKTOK_HOOK: `TIKTOK PLATFORM REQUIREMENTS:
- CRITICAL: Hook must happen in first 2 seconds or users will scroll away
- Vertical 9:16 aspect ratio - frame for mobile viewing
- Fast-paced editing, quick cuts, high energy
- Use trending sounds/music elements when possible
- Text overlays for accessibility (many watch without sound)
- Strong visual storytelling - assume sound might be off
- End with clear action (follow, visit link, buy now)
- Optimize for repeat viewing and shares

Generate shots specifically designed for TikTok's algorithm and user behavior.`,

    INSTAGRAM_OPTIMIZATION: `INSTAGRAM PLATFORM REQUIREMENTS:
- Multiple format options: Stories (9:16), Reels (9:16), Feed (1:1 or 4:5)
- Story arc structure works well - setup, conflict, resolution
- Use captions/text overlays effectively
- Strong first frame for feed posts (acts as thumbnail)
- Include hashtag strategy opportunities in visuals
- Design for both sound-on and sound-off viewing
- Create thumb-stopping moments for feed scroll
- End with clear next step (DM, link in bio, etc.)

Generate shots optimized for Instagram's various formats and engagement patterns.`,

    YOUTUBE_ENGAGEMENT: `YOUTUBE PLATFORM REQUIREMENTS:
- Horizontal 16:9 aspect ratio for optimal viewing
- Longer attention span - can develop narrative more slowly
- Strong thumbnail potential in opening shot
- Include subscriber/engagement hooks
- Design for active, engaged viewing (sound-on expected)
- Can include more detailed product information
- End screens and cards integration opportunities
- Optimize for watch time and retention

Generate shots that leverage YouTube's longer-form engagement advantages.`
  },

  // Director Style Integration
  DIRECTOR: {
    ZACH_KING_STYLE: `DIRECTOR: Zach King - Creative Magic & Seamless Transitions
VISUAL HALLMARKS: Impossible transitions, creative camera tricks, "magic" moments, playful visual effects
NARRATIVE STYLE: Playful problem-solving, unexpected solutions, wonder and delight
PACING & ENERGY: Quick, snappy, high-energy with perfectly timed reveals
CAMERA WORK: Static shots with hidden cuts, precise framing for tricks, mobile-friendly
SPECIALTIES: Product reveals, transformation moments, creative transitions
BRAND FIT: Products that can be "transformed" or revealed in surprising ways
AUDIENCE: Gen Z, social media natives, entertainment-focused consumers

Apply Zach King's signature magic transition style to make @product reveals feel impossible and delightful.`,

    CASEY_NEISTAT_STYLE: `DIRECTOR: Casey Neistat - Authentic Vlogger Energy  
VISUAL HALLMARKS: Handheld camera work, natural lighting, authentic moments, NYC energy
NARRATIVE STYLE: Personal storytelling, real experiences, honest testimonials
PACING & ENERGY: Medium-fast pacing, conversational, genuine human moments
CAMERA WORK: Dynamic handheld, intimate close-ups, walk-and-talk style
SPECIALTIES: Authentic testimonials, lifestyle integration, real-world usage
BRAND FIT: Lifestyle products, tech, services that improve daily life
AUDIENCE: Millennials, entrepreneurs, lifestyle-conscious consumers

Apply Casey's authentic documentary style to show @product as part of real life.`,

    DAVID_DROGA_STYLE: `DIRECTOR: David Droga - Emotional Creative & Premium Brand
VISUAL HALLMARKS: Cinematic lighting, emotional storytelling, premium aesthetics, brand heroes
NARRATIVE STYLE: Emotional arcs, human truths, brand as catalyst for change
PACING & ENERGY: Deliberate pacing, builds emotional intensity, premium feel
CAMERA WORK: Cinematic composition, dramatic lighting, high production value
SPECIALTIES: Brand storytelling, emotional connection, premium positioning
BRAND FIT: Luxury brands, established companies, emotional purchase decisions
AUDIENCE: Affluent consumers, brand-conscious buyers, emotional decision makers

Apply Droga's emotional brand storytelling to position @brand as meaningful and premium.`
  },

  // Content Type Modifiers
  MODIFIERS: {
    PRODUCT_FOCUS: `PRODUCT-FOCUSED APPROACH:
- Include at least 2 hero product shots with premium lighting
- Show product in actual use scenarios
- Before/after comparisons where relevant
- Close-up details of key features
- Product package/branding clearly visible
- Demonstrate size/scale/portability if relevant`,

    SERVICE_FOCUS: `SERVICE-FOCUSED APPROACH:
- Use visual metaphors to represent intangible benefits
- Show customer transformation and outcomes
- Focus on emotional states (frustrated → satisfied)
- Include testimonial-style authenticity
- Demonstrate the "after" experience
- Use aspirational lifestyle imagery`,

    LOCATION_FLEXIBLE: `LOCATION APPROACH - FLEXIBLE:
- Use generic, accessible locations (home, office, street, park)
- Focus on scenarios that work anywhere
- Emphasize situations over specific places
- Keep location costs minimal
- Make it relatable to wide audience`,

    LOCATION_SPECIFIC: `LOCATION APPROACH - SPECIFIC:
- Utilize brand stores, flagship locations, or unique venues
- Location becomes part of brand story
- Higher production value, destination feeling
- Location reinforces brand positioning
- Consider travel/permits in production planning`
  }
}

// Helper function to build complete commercial prompt with variable replacement
export function buildCommercialPrompt(
  basePrompt: string,
  variables: {
    brand: string
    product: string
    audience?: string
    platform?: string
    concept?: string
    directorStyle?: string
    platformRequirements?: string
    features?: string
    benefits?: string
  }
): string {
  let prompt = basePrompt

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      const placeholder = `@${key}`
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value)
    }
  })

  return prompt
}

// Platform requirement builders
export function buildPlatformRequirements(platform: string): string {
  const platformPrompts: { [key: string]: string } = {
    'tiktok': COMMERCIAL_PROMPTS.PLATFORM.TIKTOK_HOOK,
    'instagram': COMMERCIAL_PROMPTS.PLATFORM.INSTAGRAM_OPTIMIZATION,
    'youtube': COMMERCIAL_PROMPTS.PLATFORM.YOUTUBE_ENGAGEMENT
  }

  return platformPrompts[platform] || ''
}

// Director style builders
export function buildCommercialDirectorStyle(directorId: string): string {
  const directorPrompts: { [key: string]: string } = {
    'zach-king': COMMERCIAL_PROMPTS.DIRECTOR.ZACH_KING_STYLE,
    'casey-neistat': COMMERCIAL_PROMPTS.DIRECTOR.CASEY_NEISTAT_STYLE,
    'david-droga': COMMERCIAL_PROMPTS.DIRECTOR.DAVID_DROGA_STYLE
  }

  return directorPrompts[directorId] || 'Standard commercial direction with balanced pacing and clear messaging.'
}

export default COMMERCIAL_PROMPTS