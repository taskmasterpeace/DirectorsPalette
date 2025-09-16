// INTERNAL ONLY - Model cost configuration with 3x profit markup
// NEVER expose API costs to users - credits only!

interface ModelCostConfig {
  credits: number        // Credits to charge user (includes 3x markup)
  apiCost: number       // Internal: actual API cost (NEVER show to user)
  perImage: boolean     // Whether cost is per image or per generation
}

// CONFIDENTIAL: Cost structure with healthy profit margins
const MODEL_COSTS: Record<string, ModelCostConfig> = {
  'seedream-4': { 
    credits: 9,           // User pays 9 credits
    apiCost: 0.03,       // We pay $0.03 - 3x markup = 200% profit
    perImage: true 
  },
  'nano-banana': { 
    credits: 12,          // User pays 12 credits  
    apiCost: 0.039,      // We pay $0.039 - 3x markup = 200% profit
    perImage: true 
  },
  'gen4-image': { 
    credits: 25,          // From existing design doc
    apiCost: 0.20,       // 25% markup as documented
    perImage: true 
  },
  'gen4-image-turbo': {
    credits: 20,          // From existing design doc
    apiCost: 0.15,       // 33% markup as documented
    perImage: true
  },
  'qwen-image': {
    credits: 12,          // User pays 12 credits
    apiCost: 0.04,       // We pay ~$0.04 - 3x markup = 200% profit
    perImage: true
  }
}

// Calculate total credits for user (includes profit markup)
export function calculateUserCredits(model: string, imageCount: number = 1): number {
  const modelConfig = MODEL_COSTS[model] || MODEL_COSTS['nano-banana']
  return modelConfig.credits * imageCount
}

// Get model info for internal use (NEVER expose to frontend)
export function getModelInfo(model: string): ModelCostConfig {
  return MODEL_COSTS[model] || MODEL_COSTS['nano-banana']
}

// Supported models list
export const SUPPORTED_MODELS = Object.keys(MODEL_COSTS)

// BUSINESS RULE: All costs shown to users are in credits only
// Never display dollar amounts, API costs, or markup percentages