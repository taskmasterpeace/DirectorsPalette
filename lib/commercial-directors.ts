/**
 * Enhanced Commercial Director Profiles
 * Full-featured commercial directors matching FilmDirector detail level
 * Integrated with existing director database and card system
 */

import type { FilmDirector } from '@/lib/director-types'

// Commercial Director as enhanced FilmDirector with commercial specialization
export interface EnhancedCommercialDirector extends FilmDirector {
  // Commercial-specific extensions
  platformStrength: ('tiktok' | 'instagram' | 'youtube')[]
  brandFit: string[]
  commercialStats: {
    creativity: number
    authenticity: number
    premiumFeel: number
    engagement: number
  }
  when_to_use: string
  sample_brands: string[]
}

export const commercialDirectors: EnhancedCommercialDirector[] = [
  {
    id: 'zach-king-commercial',
    domain: 'film',
    name: 'Zach King',
    description: 'Master of creative transitions and viral "magic" moments. Specializes in product reveals that feel impossible and delightful, with seamless editing that makes ordinary products feel extraordinary.',
    visualLanguage: 'Impossible transitions, precise framing for hidden cuts, creative camera tricks, playful visual effects. Uses mobile-optimized vertical composition with seamless reveals that defy logic and physics.',
    colorPalette: 'Vibrant, saturated colors that pop on mobile screens. High contrast lighting for maximum visual impact. Playful color schemes that enhance the magical feeling.',
    narrativeFocus: 'Transformation-based storytelling, problem-solution reveals, viral moment creation, product integration through magical scenarios',
    category: 'Commercial',
    tags: ['viral', 'creative', 'transformative', 'mobile-first', 'magical'],
    disciplines: ['editing-rhythm', 'visual-effects', 'mobile-composition', 'viral-strategy'],
    notableWorks: [
      'Invisible bottle magic commercials',
      'Instant clothing change product reveals',
      'Impossible food preparation videos',
      'Tech product materialization campaigns',
      'Creative transition brand integrations'
    ],
    era: 'Digital Native',
    specialty: 'commercial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isCustom: false,
    
    // Commercial extensions
    platformStrength: ['tiktok', 'instagram'],
    brandFit: [
      'Consumer products',
      'Tech gadgets', 
      'Creative tools',
      'Entertainment brands',
      'Youth-focused products',
      'Transform-based products'
    ],
    commercialStats: {
      creativity: 10,
      authenticity: 7,
      premiumFeel: 6,
      engagement: 10
    },
    when_to_use: 'Choose Zach King style when you want to create viral, shareable content that makes your product the star of an impossible transformation. Perfect for products that can be revealed, transformed, or integrated into creative scenarios.',
    sample_brands: [
      'Apple (iPhone reveals)',
      'Nike (sneaker transformations)', 
      'Coca-Cola (impossible refreshment moments)',
      'Adobe (creative tool demonstrations)',
      'Tesla (car appearance magic)',
      'Spotify (music materialization tricks)'
    ]
  },

  {
    id: 'casey-neistat-commercial',
    domain: 'film',
    name: 'Casey Neistat',
    description: 'Authentic vlogger energy with handheld realism and genuine storytelling. Creates intimate, documentary-style commercials that feel like personal recommendations from a trusted friend.',
    visualLanguage: 'Handheld camera work with natural lighting and authentic moments. Urban energy through walk-and-talk sequences, intimate close-ups in real environments. Documentary aesthetics with genuine, unpolished feel.',
    colorPalette: 'Natural color grading with realistic lighting. Warm, approachable tones that feel authentic. Avoids over-saturated or artificial-looking color correction.',
    narrativeFocus: 'Personal storytelling, authentic testimonials, real-world problem solving, lifestyle integration, genuine human experiences',
    category: 'Commercial',
    tags: ['authentic', 'documentary', 'lifestyle', 'handheld', 'genuine'],
    disciplines: ['documentary-style', 'handheld-camera', 'authentic-storytelling', 'lifestyle-integration'],
    notableWorks: [
      'Nike authentic athlete lifestyle campaigns',
      'Samsung productivity integration videos',
      'Google everyday tool usage commercials',
      'Airbnb authentic travel experience ads',
      'Creator economy product integrations'
    ],
    era: 'Digital Creator',
    specialty: 'commercial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isCustom: false,
    
    // Commercial extensions
    platformStrength: ['youtube', 'instagram'],
    brandFit: [
      'Lifestyle products',
      'Tech and productivity tools',
      'Travel and adventure gear', 
      'Creator economy brands',
      'Authentic service brands',
      'Everyday essentials'
    ],
    commercialStats: {
      creativity: 8,
      authenticity: 10,
      premiumFeel: 7,
      engagement: 9
    },
    when_to_use: 'Choose Casey Neistat style when you need authentic, trustworthy endorsement that doesn\'t feel like advertising. Best for products that improve daily life and need credible, personal recommendation.',
    sample_brands: [
      'Samsung (productivity integration)',
      'Airbnb (authentic travel experiences)',
      'Google (everyday tool usage)',
      'Nike (real athlete lifestyle)',
      'Patagonia (authentic outdoor gear)',
      'Notion (creator productivity tools)'
    ]
  },

  {
    id: 'david-droga-commercial',
    domain: 'film',
    name: 'David Droga',
    description: 'Emotional creative master and premium brand storyteller. Creates cinematic commercials that position brands as catalysts for meaningful human moments and aspirational lifestyle transformation.',
    visualLanguage: 'Cinematic lighting with emotional storytelling and premium aesthetics. Dramatic composition with high production value. Carefully crafted moments with sophisticated visual metaphors and elevated cinematography.',
    colorPalette: 'Sophisticated color grading with premium feel. Rich, deep tones and elegant contrast. Refined palette that conveys luxury and emotional depth without being ostentatious.',
    narrativeFocus: 'Emotional brand storytelling, human truth exploration, aspirational lifestyle transformation, premium positioning, meaningful human connections',
    category: 'Commercial',
    tags: ['emotional', 'premium', 'cinematic', 'aspirational', 'sophisticated'],
    disciplines: ['cinematic-lighting', 'emotional-storytelling', 'premium-aesthetics', 'brand-positioning'],
    notableWorks: [
      'Apple "Think Different" emotional campaigns',
      'Mercedes-Benz luxury lifestyle positioning',
      'American Express premium experiences',
      'Johnnie Walker aspirational storytelling',
      'Nike emotional athlete transformation stories'
    ],
    era: 'Creative Agency',
    specialty: 'commercial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isCustom: false,
    
    // Commercial extensions
    platformStrength: ['youtube', 'instagram'],
    brandFit: [
      'Luxury brands',
      'Premium services',
      'Established corporations',
      'Emotional purchase categories',
      'Aspirational lifestyle brands',
      'High-value products'
    ],
    commercialStats: {
      creativity: 9,
      authenticity: 8,
      premiumFeel: 10,
      engagement: 8
    },
    when_to_use: 'Choose David Droga style when you need to position your brand as premium, meaningful, and transformative. Perfect for brands that want to charge premium prices and create emotional connections.',
    sample_brands: [
      'Apple (Think Different campaigns)',
      'Mercedes-Benz (luxury positioning)',
      'American Express (premium lifestyle)',
      'Johnnie Walker (aspirational moments)',
      'Google (human connection tech)',
      'Nike (emotional athlete stories)'
    ]
  },

  {
    id: 'mr-beast-commercial',
    domain: 'film',
    name: 'Mr Beast (Jimmy Donaldson)', 
    description: 'Viral content mastermind creating massive-scale productions with unprecedented audience engagement. Specializes in high-stakes commercials with enormous value propositions and viral challenge elements.',
    visualLanguage: 'Massive scale production with viral challenge elements, high-energy editing, thumbnail-optimized composition. Multiple camera angles capturing epic moments and genuine reactions with YouTube-native pacing.',
    colorPalette: 'Bright, saturated colors optimized for thumbnail impact and mobile viewing. High contrast lighting that pops on small screens. Bold, attention-grabbing color schemes.',
    narrativeFocus: 'Audience engagement through massive value propositions, viral challenges, authentic reactions, and unprecedented scale that creates "must-watch" content',
    category: 'Commercial',
    tags: ['viral', 'massive-scale', 'engagement', 'challenges', 'youtube-native'],
    disciplines: ['viral-strategy', 'audience-engagement', 'massive-production', 'thumbnail-optimization'],
    notableWorks: [
      'Massive giveaway commercials with million-dollar budgets',
      'Viral challenge campaigns for major brands',
      'Epic scale product demonstrations',
      'Charity-driven brand partnerships',
      'Reality TV-style commercial content'
    ],
    era: 'YouTube Creator',
    specialty: 'commercial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isCustom: false,
    
    // Commercial extensions
    platformStrength: ['youtube', 'tiktok'],
    brandFit: [
      'Consumer brands seeking viral reach',
      'Gaming and entertainment',
      'Food and beverage',
      'Technology and gadgets',
      'Charity and social causes',
      'Mass market products'
    ],
    commercialStats: {
      creativity: 9,
      authenticity: 9,
      premiumFeel: 6,
      engagement: 10
    },
    when_to_use: 'Choose Mr Beast style when you want massive viral reach and unprecedented audience engagement. Perfect for brands with significant budgets who want to create cultural moments and massive social media impact.',
    sample_brands: [
      'Honey (massive cashback demonstrations)',
      'Feastables (chocolate brand with viral launches)',
      'YouTube (platform integration campaigns)',
      'McDonald\'s (massive giveaway partnerships)',
      'Epic Games (gaming integration campaigns)',
      'Tesla (viral product demonstrations)'
    ]
  },

  {
    id: 'lucia-aniello-commercial',
    domain: 'film',
    name: 'Lucia Aniello',
    description: 'Emmy-winning director bringing cinematic storytelling with humor and emotional depth to commercial content. Known for sophisticated narrative commercials that balance entertainment with brand messaging.',
    visualLanguage: 'Cinematic storytelling with sophisticated humor and emotional depth. Clean, professional cinematography with strong narrative structure. Balanced between entertainment and commercial messaging.',
    colorPalette: 'Professional, cinematic color grading with warmth and sophistication. Avoids over-saturation while maintaining visual appeal for both TV and digital platforms.',
    narrativeFocus: 'Sophisticated humor, emotional storytelling, character-driven narratives, premium brand positioning with entertainment value',
    category: 'Commercial',
    tags: ['sophisticated', 'humor', 'narrative', 'emmy-winner', 'entertainment'],
    disciplines: ['narrative-storytelling', 'sophisticated-humor', 'character-development', 'professional-cinematography'],
    notableWorks: [
      'Apple holiday commercials with stop-motion storytelling',
      'Dollar Shave Club viral campaign direction',
      'HBO Max premium content integration',
      'Premium brand entertainment commercials',
      'Award-winning advertising campaigns'
    ],
    era: 'Contemporary',
    specialty: 'commercial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isCustom: false,
    
    // Commercial extensions
    platformStrength: ['youtube', 'instagram'],
    brandFit: [
      'Premium consumer brands',
      'Entertainment and media',
      'Subscription services',
      'Lifestyle and wellness',
      'Technology with personality',
      'Brands seeking sophisticated humor'
    ],
    commercialStats: {
      creativity: 9,
      authenticity: 8,
      premiumFeel: 8,
      engagement: 8
    },
    when_to_use: 'Choose Lucia Aniello style when you want sophisticated commercial storytelling that entertains while selling. Perfect for premium brands that want to be taken seriously while maintaining approachable personality.',
    sample_brands: [
      'Apple (holiday storytelling campaigns)',
      'HBO Max (premium content positioning)',
      'Dollar Shave Club (viral brand personality)',
      'Netflix (entertainment brand integration)',
      'Whole Foods (premium lifestyle positioning)',
      'Mastercard (sophisticated financial storytelling)'
    ]
  },

  {
    id: 'ridley-scott-commercial',
    domain: 'film',
    name: 'Ridley Scott',
    description: 'Legendary filmmaker bringing epic cinematic scale to commercial storytelling. Master of creating iconic, memorable commercials that become cultural touchstones with dramatic visual storytelling.',
    visualLanguage: 'Epic cinematic scale with dramatic visual storytelling, sweeping camera movements, and iconic composition. Creates commercials that feel like mini-movies with lasting cultural impact.',
    colorPalette: 'Dramatic, high-contrast cinematography with rich, deep tones. Masterful use of lighting to create mood and atmosphere. Color palettes that enhance the epic, cinematic feel.',
    narrativeFocus: 'Epic brand storytelling, cultural impact creation, dramatic narratives that position brands as part of larger human stories and historical moments',
    category: 'Commercial',
    tags: ['epic', 'cinematic', 'iconic', 'cultural', 'dramatic'],
    disciplines: ['epic-cinematography', 'cultural-storytelling', 'dramatic-composition', 'iconic-creation'],
    notableWorks: [
      'Apple 1984 Super Bowl commercial (cultural icon)',
      'Hovis Bread "Boy on Bike" (British advertising classic)',
      'Barclaycard luxury lifestyle campaigns',
      'Epic scale automotive commercials',
      'Historical brand storytelling campaigns'
    ],
    era: 'Classic',
    specialty: 'commercial',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isCustom: false,
    
    // Commercial extensions
    platformStrength: ['youtube'],
    brandFit: [
      'Luxury automotive',
      'Premium technology',
      'Financial services',
      'Heritage brands',
      'Revolutionary products',
      'Brands seeking cultural impact'
    ],
    commercialStats: {
      creativity: 10,
      authenticity: 7,
      premiumFeel: 10,
      engagement: 9
    },
    when_to_use: 'Choose Ridley Scott style when you want to create iconic, culturally impactful commercials that position your brand as legendary. Perfect for revolutionary products or brands seeking to create lasting cultural moments.',
    sample_brands: [
      'Apple (revolutionary product launches)',
      'Mercedes-Benz (luxury automotive heritage)',
      'American Express (premium financial services)',
      'Johnnie Walker (heritage brand storytelling)',
      'BMW (performance and luxury positioning)',
      'Rolex (timeless luxury positioning)'
    ]
  }
]

// Helper function to get commercial director by ID
export function getCommercialDirectorById(id: string): EnhancedCommercialDirector | undefined {
  return commercialDirectors.find(director => director.id === id)
}

// Helper function to get directors by platform strength
export function getDirectorsByPlatform(platform: 'tiktok' | 'instagram' | 'youtube'): EnhancedCommercialDirector[] {
  return commercialDirectors.filter(director => 
    director.platformStrength.includes(platform)
  )
}

// Helper function to get directors by brand fit
export function getDirectorsByBrandType(brandType: string): EnhancedCommercialDirector[] {
  return commercialDirectors.filter(director =>
    director.brandFit.some(fit => 
      fit.toLowerCase().includes(brandType.toLowerCase()) ||
      brandType.toLowerCase().includes(fit.toLowerCase())
    )
  )
}

// Helper function to suggest director based on brief
export function suggestDirectorForBrief(brief: {
  platform: 'tiktok' | 'instagram' | 'youtube'
  audience: string
  brandType: string
  goal: 'viral' | 'authentic' | 'premium'
}): EnhancedCommercialDirector | null {
  
  let scoredDirectors = commercialDirectors.map(director => {
    let score = 0
    
    // Platform strength
    if (director.platformStrength.includes(brief.platform)) {
      score += 3
    }
    
    // Goal alignment
    if (brief.goal === 'viral' && director.commercialStats.creativity >= 9) score += 3
    if (brief.goal === 'authentic' && director.commercialStats.authenticity >= 9) score += 3  
    if (brief.goal === 'premium' && director.commercialStats.premiumFeel >= 9) score += 3
    
    // Brand type alignment
    const brandMatch = director.brandFit.some(fit =>
      fit.toLowerCase().includes(brief.brandType.toLowerCase()) ||
      brief.brandType.toLowerCase().includes(fit.toLowerCase())
    )
    if (brandMatch) score += 2
    
    return { director, score }
  })
  
  // Sort by score and return highest
  scoredDirectors.sort((a, b) => b.score - a.score)
  return scoredDirectors[0]?.score > 0 ? scoredDirectors[0].director : null
}

// Director stat explanations for UI
export const directorStatExplanations = {
  creativity: {
    name: 'Creativity',
    description: 'How innovative and unique are their visual approaches?',
    scale: '1 = Traditional approaches, 10 = Groundbreaking innovation'
  },
  authenticity: {
    name: 'Authenticity', 
    description: 'How genuine and believable do their commercials feel?',
    scale: '1 = Highly produced/artificial, 10 = Documentary realism'
  },
  premiumFeel: {
    name: 'Premium Feel',
    description: 'How luxurious and high-end is the production aesthetic?',
    scale: '1 = Budget/accessible feel, 10 = Luxury/aspirational'
  },
  engagement: {
    name: 'Engagement',
    description: 'How likely are their commercials to drive viewer action?',
    scale: '1 = Passive viewing, 10 = High interaction/sharing'
  }
}

export default commercialDirectors