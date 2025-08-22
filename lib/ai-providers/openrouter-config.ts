'use client'

// OpenRouter Model Configuration
export interface ModelConfig {
  id: string
  name: string
  provider: string
  pricing: {
    prompt: number // per 1M tokens
    completion: number // per 1M tokens
  }
  context: number // max context length
  capabilities: ('text' | 'image' | 'reasoning' | 'fast' | 'creative')[]
  isFree: boolean
  isReasoning: boolean
}

// OpenRouter Model Catalog (Curated Selection)
export const OPENROUTER_MODELS: Record<string, ModelConfig> = {
  // CURRENT MODELS (Migrated to OpenRouter)
  'openai/gpt-4o': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (Current)',
    provider: 'OpenAI',
    pricing: { prompt: 5, completion: 15 },
    context: 128000,
    capabilities: ['text', 'image', 'reasoning'],
    isFree: false,
    isReasoning: true
  },
  'openai/gpt-4o-mini': {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini (Current)',
    provider: 'OpenAI', 
    pricing: { prompt: 0.15, completion: 0.6 },
    context: 128000,
    capabilities: ['text', 'fast'],
    isFree: false,
    isReasoning: false
  },

  // SUGGESTED ALTERNATIVES
  'anthropic/claude-3.5-sonnet': {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    pricing: { prompt: 3, completion: 15 },
    context: 200000,
    capabilities: ['text', 'reasoning', 'creative'],
    isFree: false,
    isReasoning: true
  },
  'google/gemini-pro-1.5': {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'Google',
    pricing: { prompt: 1.25, completion: 5 },
    context: 1000000,
    capabilities: ['text', 'image', 'fast'],
    isFree: false,
    isReasoning: false
  },
  'meta-llama/llama-3.3-70b-instruct': {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    pricing: { prompt: 0.59, completion: 0.79 },
    context: 128000,
    capabilities: ['text', 'reasoning'],
    isFree: false,
    isReasoning: true
  },

  // FREE MODELS
  'meta-llama/llama-3.3-70b-instruct:free': {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (Free)',
    provider: 'Meta',
    pricing: { prompt: 0, completion: 0 },
    context: 128000,
    capabilities: ['text', 'reasoning'],
    isFree: true,
    isReasoning: true
  },
  'google/gemini-2.0-flash-exp:free': {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    provider: 'Google',
    pricing: { prompt: 0, completion: 0 },
    context: 1000000,
    capabilities: ['text', 'fast'],
    isFree: true,
    isReasoning: false
  },
  'deepseek/deepseek-r1:free': {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
    pricing: { prompt: 0, completion: 0 },
    context: 64000,
    capabilities: ['text', 'reasoning'],
    isFree: true,
    isReasoning: true
  }
}

// Function-specific model assignments
export interface FunctionModelConfig {
  function: 'story-breakdown' | 'music-analysis' | 'director-creation' | 'entity-extraction' | 'commercial-generation'
  defaultModel: string
  suggestedModels: string[]
  freeAlternatives: string[]
  description: string
}

export const FUNCTION_MODEL_CONFIG: Record<string, FunctionModelConfig> = {
  'story-breakdown': {
    function: 'story-breakdown',
    defaultModel: 'openai/gpt-4o',
    suggestedModels: ['anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.3-70b-instruct'],
    freeAlternatives: ['meta-llama/llama-3.3-70b-instruct:free'],
    description: 'Complex narrative analysis and chapter generation'
  },
  'music-analysis': {
    function: 'music-analysis',
    defaultModel: 'openai/gpt-4o-mini',
    suggestedModels: ['google/gemini-pro-1.5', 'meta-llama/llama-3.3-70b-instruct'],
    freeAlternatives: ['google/gemini-2.0-flash-exp:free'],
    description: 'Music video structure and lyric analysis'
  },
  'director-creation': {
    function: 'director-creation',
    defaultModel: 'openai/gpt-4o',
    suggestedModels: ['anthropic/claude-3.5-sonnet'],
    freeAlternatives: ['meta-llama/llama-3.3-70b-instruct:free'],
    description: 'Creative director style generation'
  },
  'entity-extraction': {
    function: 'entity-extraction',
    defaultModel: 'openai/gpt-4o-mini',
    suggestedModels: ['google/gemini-pro-1.5'],
    freeAlternatives: ['google/gemini-2.0-flash-exp:free'],
    description: 'Character, location, and prop extraction'
  },
  'commercial-generation': {
    function: 'commercial-generation',
    defaultModel: 'openai/gpt-4o',
    suggestedModels: ['anthropic/claude-3.5-sonnet'],
    freeAlternatives: ['meta-llama/llama-3.3-70b-instruct:free'],
    description: 'Commercial concept and campaign generation'
  }
}

// Admin model configuration
export interface AdminModelSelection {
  [functionName: string]: string // function -> selected model ID
}

// Get model for specific function (with admin override)
export function getModelForFunction(
  functionName: string, 
  adminConfig?: AdminModelSelection
): ModelConfig {
  const selectedModelId = adminConfig?.[functionName] || 
                         FUNCTION_MODEL_CONFIG[functionName]?.defaultModel ||
                         'openai/gpt-4o'
  
  return OPENROUTER_MODELS[selectedModelId] || OPENROUTER_MODELS['openai/gpt-4o']
}