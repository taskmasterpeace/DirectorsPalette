/**
 * Pre-made Commercial Templates
 * Ready-to-use commercial scenarios for quick generation
 */

export interface CommercialTemplate {
  id: string
  name: string
  description: string
  category: 'product-launch' | 'service-demo' | 'brand-story' | 'comparison' | 'testimonial' | 'how-to'
  suggestedDirector: string
  defaultConfig: {
    duration: '10s' | '30s'
    platform: 'tiktok' | 'instagram' | 'youtube'
    audience: string
    concept: string
  }
  brandPlaceholder: string
  productPlaceholder: string
  tags: string[]
  industryFit: string[]
}

export const commercialTemplates: CommercialTemplate[] = [
  // Product Launch Templates
  {
    id: 'tech-product-reveal',
    name: 'Tech Product Reveal',
    description: 'Magical reveal of new tech product with impossible transitions',
    category: 'product-launch',
    suggestedDirector: 'zach-king-commercial',
    defaultConfig: {
      duration: '10s',
      platform: 'tiktok',
      audience: 'Tech enthusiasts and early adopters',
      concept: 'Magical transformation revealing the new product in impossible ways'
    },
    brandPlaceholder: 'Apple',
    productPlaceholder: 'iPhone 15 Pro',
    tags: ['viral', 'tech', 'magical', 'reveal'],
    industryFit: ['Technology', 'Consumer Electronics', 'Gadgets']
  },

  {
    id: 'fashion-drop',
    name: 'Fashion Collection Drop',
    description: 'Stylish product showcase with instant outfit changes',
    category: 'product-launch',
    suggestedDirector: 'zach-king-commercial',
    defaultConfig: {
      duration: '10s',
      platform: 'instagram',
      audience: 'Fashion-forward Gen Z and millennials',
      concept: 'Instant outfit transformations showcasing the new collection'
    },
    brandPlaceholder: 'Nike',
    productPlaceholder: 'Air Max Collection',
    tags: ['fashion', 'transformation', 'style'],
    industryFit: ['Fashion', 'Apparel', 'Accessories']
  },

  // Service Demo Templates
  {
    id: 'productivity-tool',
    name: 'Productivity Tool Demo',
    description: 'Authentic demonstration of how the tool improves daily workflow',
    category: 'service-demo',
    suggestedDirector: 'casey-neistat-commercial',
    defaultConfig: {
      duration: '30s',
      platform: 'youtube',
      audience: 'Entrepreneurs and creative professionals',
      concept: 'Real-world demonstration of productivity improvement'
    },
    brandPlaceholder: 'Notion',
    productPlaceholder: 'All-in-one workspace',
    tags: ['productivity', 'authentic', 'workflow'],
    industryFit: ['Software', 'Productivity Tools', 'SaaS']
  },

  {
    id: 'food-delivery-service',
    name: 'Food Delivery Service',
    description: 'Documentary-style showcase of convenient food delivery experience',
    category: 'service-demo',
    suggestedDirector: 'casey-neistat-commercial',
    defaultConfig: {
      duration: '30s',
      platform: 'instagram',
      audience: 'Busy professionals and urban dwellers',
      concept: 'Day-in-the-life showing how food delivery fits seamlessly into busy schedule'
    },
    brandPlaceholder: 'DoorDash',
    productPlaceholder: 'Food delivery service',
    tags: ['convenience', 'lifestyle', 'authentic'],
    industryFit: ['Food Delivery', 'Services', 'Convenience']
  },

  // Brand Story Templates
  {
    id: 'luxury-heritage',
    name: 'Luxury Brand Heritage',
    description: 'Cinematic storytelling emphasizing brand legacy and craftsmanship',
    category: 'brand-story',
    suggestedDirector: 'david-droga-commercial',
    defaultConfig: {
      duration: '30s',
      platform: 'youtube',
      audience: 'Affluent consumers who value quality and heritage',
      concept: 'Emotional journey through brand heritage and craftsmanship excellence'
    },
    brandPlaceholder: 'Mercedes-Benz',
    productPlaceholder: 'S-Class',
    tags: ['luxury', 'heritage', 'emotional', 'premium'],
    industryFit: ['Luxury Goods', 'Automotive', 'High-end Services']
  },

  {
    id: 'sustainability-story',
    name: 'Sustainability Initiative',
    description: 'Inspiring brand story about environmental commitment and impact',
    category: 'brand-story',
    suggestedDirector: 'david-droga-commercial',
    defaultConfig: {
      duration: '30s',
      platform: 'instagram',
      audience: 'Environmentally conscious consumers',
      concept: 'Emotional storytelling about brand commitment to sustainability'
    },
    brandPlaceholder: 'Patagonia',
    productPlaceholder: 'Sustainable outdoor gear',
    tags: ['sustainability', 'environmental', 'values'],
    industryFit: ['Outdoor Gear', 'Sustainable Brands', 'Environmental']
  },

  // Comparison Templates
  {
    id: 'before-after-transformation',
    name: 'Before/After Transformation',
    description: 'Dramatic before and after showing product impact',
    category: 'comparison',
    suggestedDirector: 'zach-king-commercial',
    defaultConfig: {
      duration: '10s',
      platform: 'tiktok',
      audience: 'People looking for solutions to common problems',
      concept: 'Magical transformation showing dramatic before and after results'
    },
    brandPlaceholder: 'Olay',
    productPlaceholder: 'Anti-aging skincare',
    tags: ['transformation', 'results', 'before-after'],
    industryFit: ['Beauty', 'Health', 'Home Improvement']
  },

  // Testimonial Templates
  {
    id: 'customer-success-story',
    name: 'Customer Success Story',
    description: 'Authentic customer testimonial showing real results',
    category: 'testimonial',
    suggestedDirector: 'casey-neistat-commercial',
    defaultConfig: {
      duration: '30s',
      platform: 'youtube',
      audience: 'Potential customers seeking social proof',
      concept: 'Genuine customer sharing their success story and experience'
    },
    brandPlaceholder: 'Shopify',
    productPlaceholder: 'E-commerce platform',
    tags: ['testimonial', 'authentic', 'success'],
    industryFit: ['SaaS', 'Services', 'B2B Solutions']
  },

  // How-to Templates
  {
    id: 'creative-tutorial',
    name: 'Creative Tutorial',
    description: 'Fun, engaging tutorial showcasing product use in creative ways',
    category: 'how-to',
    suggestedDirector: 'zach-king-commercial',
    defaultConfig: {
      duration: '10s',
      platform: 'tiktok',
      audience: 'Creative individuals and DIY enthusiasts',
      concept: 'Quick, magical tutorial showing creative product applications'
    },
    brandPlaceholder: 'Adobe',
    productPlaceholder: 'Creative Cloud',
    tags: ['tutorial', 'creative', 'educational'],
    industryFit: ['Creative Software', 'Tools', 'Education']
  },

  {
    id: 'professional-how-to',
    name: 'Professional How-To',
    description: 'Professional, clear tutorial demonstrating product functionality',
    category: 'how-to',
    suggestedDirector: 'casey-neistat-commercial',
    defaultConfig: {
      duration: '30s',
      platform: 'youtube',
      audience: 'Professionals seeking to learn new tools or techniques',
      concept: 'Clear, step-by-step demonstration of professional use cases'
    },
    brandPlaceholder: 'Slack',
    productPlaceholder: 'Team communication platform',
    tags: ['professional', 'tutorial', 'demonstration'],
    industryFit: ['Professional Tools', 'Software', 'B2B']
  },

  // NEW DIVERSE TEMPLATES (as requested)
  
  {
    id: 'saas-productivity-demo',
    name: 'SaaS Productivity Transformation',
    description: 'Authentic workflow transformation showing before/after SaaS implementation',
    category: 'service-demo',
    suggestedDirector: 'casey-neistat-commercial',
    defaultConfig: {
      duration: '30s',
      platform: 'youtube',
      audience: 'Business professionals, entrepreneurs, and team leaders',
      concept: 'Documentary-style productivity transformation showing real workplace efficiency gains'
    },
    brandPlaceholder: 'Asana',
    productPlaceholder: 'Project management platform',
    tags: ['saas', 'productivity', 'transformation', 'b2b', 'workflow'],
    industryFit: ['SaaS', 'Productivity Software', 'Business Tools', 'Enterprise Solutions']
  },

  {
    id: 'electronics-lifestyle-integration',
    name: 'Consumer Electronics Lifestyle',
    description: 'Seamless technology integration into modern daily routines',
    category: 'product-launch',
    suggestedDirector: 'zach-king-commercial',
    defaultConfig: {
      duration: '10s',
      platform: 'tiktok',
      audience: 'Tech-savvy millennials and Gen Z consumers',
      concept: 'Magical technology integration showing how devices enhance daily life moments'
    },
    brandPlaceholder: 'Samsung',
    productPlaceholder: 'Galaxy smartwatch',
    tags: ['electronics', 'lifestyle', 'integration', 'wearable', 'smart-devices'],
    industryFit: ['Consumer Electronics', 'Wearable Technology', 'Smart Devices', 'Mobile Accessories']
  },

  {
    id: 'restaurant-community-experience',
    name: 'Local Restaurant Community Story',
    description: 'Heartwarming local restaurant experience showcasing community connection',
    category: 'brand-story',
    suggestedDirector: 'lucia-aniello-commercial',
    defaultConfig: {
      duration: '30s',
      platform: 'instagram',
      audience: 'Local community members, food enthusiasts, and family diners',
      concept: 'Warm storytelling showing restaurant as community gathering place with authentic experiences'
    },
    brandPlaceholder: 'Tony\'s Family Restaurant',
    productPlaceholder: 'Local dining experience',
    tags: ['restaurant', 'community', 'local-business', 'family', 'authentic'],
    industryFit: ['Food & Beverage', 'Local Business', 'Hospitality', 'Community Services']
  },

  {
    id: 'nonprofit-impact-story',
    name: 'Non-Profit Impact & Call to Action',
    description: 'Inspiring social impact story demonstrating tangible community change',
    category: 'testimonial',
    suggestedDirector: 'david-droga-commercial',
    defaultConfig: {
      duration: '30s',
      platform: 'youtube',
      audience: 'Socially conscious individuals, potential donors, and community volunteers',
      concept: 'Emotional storytelling showcasing real impact and inspiring action for social good'
    },
    brandPlaceholder: 'Clean Water Initiative',
    productPlaceholder: 'Community water access program',
    tags: ['nonprofit', 'social-impact', 'community', 'inspiration', 'call-to-action'],
    industryFit: ['Non-Profit Organizations', 'Social Causes', 'Community Outreach', 'Charitable Organizations']
  }
]

// Template categories for filtering
export const templateCategories = [
  { id: 'product-launch', name: 'Product Launch', icon: '🚀' },
  { id: 'service-demo', name: 'Service Demo', icon: '🛠️' },
  { id: 'brand-story', name: 'Brand Story', icon: '📖' },
  { id: 'comparison', name: 'Comparison', icon: '⚖️' },
  { id: 'testimonial', name: 'Testimonial', icon: '💬' },
  { id: 'how-to', name: 'How-To', icon: '📚' }
] as const

// Helper functions
export function getTemplatesByCategory(category: CommercialTemplate['category']): CommercialTemplate[] {
  return commercialTemplates.filter(template => template.category === category)
}

export function getTemplatesByIndustry(industry: string): CommercialTemplate[] {
  return commercialTemplates.filter(template => 
    template.industryFit.some(fit => 
      fit.toLowerCase().includes(industry.toLowerCase()) ||
      industry.toLowerCase().includes(fit.toLowerCase())
    )
  )
}

export function getTemplateById(id: string): CommercialTemplate | undefined {
  return commercialTemplates.find(template => template.id === id)
}

export function suggestTemplatesForBrief(brief: {
  industry?: string
  duration?: '10s' | '30s'
  platform?: 'tiktok' | 'instagram' | 'youtube'
  goal?: 'awareness' | 'conversion' | 'education'
}): CommercialTemplate[] {
  let scored = commercialTemplates.map(template => {
    let score = 0
    
    // Industry match
    if (brief.industry && template.industryFit.some(fit => 
      fit.toLowerCase().includes(brief.industry!.toLowerCase()))) {
      score += 3
    }
    
    // Duration preference
    if (brief.duration && template.defaultConfig.duration === brief.duration) {
      score += 2
    }
    
    // Platform preference
    if (brief.platform && template.defaultConfig.platform === brief.platform) {
      score += 2
    }
    
    // Goal alignment
    if (brief.goal === 'awareness' && ['brand-story', 'testimonial'].includes(template.category)) score += 2
    if (brief.goal === 'conversion' && ['product-launch', 'comparison'].includes(template.category)) score += 2
    if (brief.goal === 'education' && ['how-to', 'service-demo'].includes(template.category)) score += 2
    
    return { template, score }
  })
  
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.template)
    .slice(0, 6)
}

export default commercialTemplates