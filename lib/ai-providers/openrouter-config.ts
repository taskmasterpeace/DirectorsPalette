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

  // 🆓 FREE MODELS (Perfect for Testing) - 20 req/min, 50-1000 daily
  'moonshotai/kimi-k2:free': {
    id: 'moonshotai/kimi-k2:free',
    name: 'KIMI K2 (FREE) ⭐',
    provider: 'MoonshotAI',
    pricing: { prompt: 0, completion: 0 },
    context: 33000,
    capabilities: ['text', 'reasoning'],
    isFree: true,
    isReasoning: true
  },
  'moonshotai/kimi-dev-72b:free': {
    id: 'moonshotai/kimi-dev-72b:free',
    name: 'KIMI Dev 72B (FREE)',
    provider: 'MoonshotAI',
    pricing: { prompt: 0, completion: 0 },
    context: 131000,
    capabilities: ['text', 'reasoning'],
    isFree: true,
    isReasoning: true
  },
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
  'google/gemma-2-9b-it:free': {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2 9B (Free)',
    provider: 'Google',
    pricing: { prompt: 0, completion: 0 },
    context: 8000,
    capabilities: ['text', 'fast'],
    isFree: true,
    isReasoning: false
  },
  'mistralai/mistral-7b-instruct:free': {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B (Free)',
    provider: 'Mistral',
    pricing: { prompt: 0, completion: 0 },
    context: 32000,
    capabilities: ['text', 'creative', 'fast'],
    isFree: true,
    isReasoning: false
  },
  'microsoft/phi-3-mini-128k-instruct:free': {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini (Free)',
    provider: 'Microsoft',
    pricing: { prompt: 0, completion: 0 },
    context: 128000,
    capabilities: ['text', 'fast'],
    isFree: true,
    isReasoning: false
  },

  // 💰 ULTRA CHEAP MODELS (Insane Value)
  'moonshotai/kimi-vl-a3b-thinking': {
    id: 'moonshotai/kimi-vl-a3b-thinking',
    name: 'KIMI VL A3B (CHEAPEST EVER!) ⭐⭐⭐',
    provider: 'MoonshotAI',
    pricing: { prompt: 0.025, completion: 0.10 },
    context: 131000,
    capabilities: ['text', 'image', 'reasoning'],
    isFree: false,
    isReasoning: true
  },
  'qwen/qwen-turbo': {
    id: 'qwen/qwen-turbo',
    name: 'Qwen Turbo (Ultra Cheap)',
    provider: 'Alibaba',
    pricing: { prompt: 0.05, completion: 0.20 },
    context: 1000000,
    capabilities: ['text', 'fast'],
    isFree: false,
    isReasoning: false
  },
  'baidu/ernie-4.5-21b-a3b': {
    id: 'baidu/ernie-4.5-21b-a3b',
    name: 'ERNIE 4.5 21B A3B',
    provider: 'Baidu',
    pricing: { prompt: 0.07, completion: 0.28 },
    context: 120000,
    capabilities: ['text', 'reasoning', 'fast'],
    isFree: false,
    isReasoning: true
  },
  'qwen/qwen3-30b-a3b-instruct-2507': {
    id: 'qwen/qwen3-30b-a3b-instruct-2507',
    name: 'Qwen3 30B A3B (Cheap MoE)',
    provider: 'Alibaba',
    pricing: { prompt: 0.20, completion: 0.80 },
    context: 131000,
    capabilities: ['text', 'reasoning'],
    isFree: false,
    isReasoning: true
  },

  // 🧠 REASONING SPECIALISTS (DeepSeek Focus)
  'deepseek/deepseek-chat-v3.1': {
    id: 'deepseek/deepseek-chat-v3.1',
    name: 'DeepSeek V3.1 (Hybrid Reasoning)',
    provider: 'DeepSeek',
    pricing: { prompt: 0.20, completion: 0.80 },
    context: 164000,
    capabilities: ['text', 'reasoning'],
    isFree: false,
    isReasoning: true
  },
  'deepseek/deepseek-v3.1-base': {
    id: 'deepseek/deepseek-v3.1-base',
    name: 'DeepSeek V3.1 Base',
    provider: 'DeepSeek',
    pricing: { prompt: 0.20, completion: 0.80 },
    context: 164000,
    capabilities: ['text', 'reasoning'],
    isFree: false,
    isReasoning: true
  },

  // 🎨 CREATIVE & EFFICIENT MODELS
  'ai21/jamba-mini-1.7': {
    id: 'ai21/jamba-mini-1.7',
    name: 'Jamba Mini 1.7 (Best Value)',
    provider: 'AI21',
    pricing: { prompt: 0.20, completion: 0.40 },
    context: 256000,
    capabilities: ['text', 'creative', 'fast'],
    isFree: false,
    isReasoning: false
  },
  'mistralai/mistral-medium-3.1': {
    id: 'mistralai/mistral-medium-3.1',
    name: 'Mistral Medium 3.1',
    provider: 'Mistral',
    pricing: { prompt: 0.40, completion: 2.00 },
    context: 262000,
    capabilities: ['text', 'reasoning', 'creative'],
    isFree: false,
    isReasoning: true
  },

  // 👁️ VISION/MULTIMODAL (Separate Category - Not in Main Workflow)
  'moonshotai/kimi-vl-a3b-thinking:free': {
    id: 'moonshotai/kimi-vl-a3b-thinking:free',
    name: 'KIMI VL A3B Thinking (FREE Vision)',
    provider: 'MoonshotAI',
    pricing: { prompt: 0, completion: 0 },
    context: 131000,
    capabilities: ['text', 'image', 'reasoning'],
    isFree: true,
    isReasoning: true
  },
  'qwen/qwen2.5-vl-32b-instruct:free': {
    id: 'qwen/qwen2.5-vl-32b-instruct:free',
    name: 'Qwen2.5 VL 32B (FREE Vision)',
    provider: 'Alibaba',
    pricing: { prompt: 0, completion: 0 },
    context: 8000,
    capabilities: ['text', 'image', 'reasoning'],
    isFree: true,
    isReasoning: true
  },
  'qwen/qwen2.5-vl-72b-instruct:free': {
    id: 'qwen/qwen2.5-vl-72b-instruct:free',
    name: 'Qwen2.5 VL 72B (FREE Vision)',
    provider: 'Alibaba',
    pricing: { prompt: 0, completion: 0 },
    context: 131000,
    capabilities: ['text', 'image', 'reasoning'],
    isFree: true,
    isReasoning: true
  },
  'baidu/ernie-4.5-vl-28b-a3b': {
    id: 'baidu/ernie-4.5-vl-28b-a3b',
    name: 'ERNIE 4.5 VL (Cheap Vision)',
    provider: 'Baidu',
    pricing: { prompt: 0.14, completion: 0.56 },
    context: 30000,
    capabilities: ['text', 'image', 'reasoning'],
    isFree: false,
    isReasoning: true
  },
  'z-ai/glm-4.5v': {
    id: 'z-ai/glm-4.5v',
    name: 'GLM 4.5V (Advanced Vision)',
    provider: 'Z.AI',
    pricing: { prompt: 0.50, completion: 1.80 },
    context: 66000,
    capabilities: ['text', 'image', 'reasoning'],
    isFree: false,
    isReasoning: true
  },

  // PREMIUM MODELS
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
  }
}

// Function-specific model assignments
export interface FunctionModelConfig {
  function: 'story-breakdown' | 'music-analysis' | 'director-creation' | 'entity-extraction' | 'commercial-generation' | 'image-analysis' | 'reasoning-tasks' | 'children-book-generation'
  defaultModel: string
  suggestedModels: string[]
  freeAlternatives: string[]
  description: string
}

export const FUNCTION_MODEL_CONFIG: Record<string, FunctionModelConfig> = {
  'story-breakdown': {
    function: 'story-breakdown',
    defaultModel: 'openai/gpt-4o', // GPT-4o as system-wide default
    suggestedModels: ['deepseek/deepseek-chat-v3.1', 'moonshotai/kimi-vl-a3b-thinking', 'baidu/ernie-4.5-21b-a3b'],
    freeAlternatives: ['moonshotai/kimi-k2:free', 'moonshotai/kimi-dev-72b:free'],
    description: 'Complex narrative analysis and chapter generation'
  },
  'music-analysis': {
    function: 'music-analysis',
    defaultModel: 'openai/gpt-4o', // GPT-4o as system-wide default
    suggestedModels: ['ai21/jamba-mini-1.7', 'baidu/ernie-4.5-21b-a3b', 'mistralai/mistral-medium-3.1'],
    freeAlternatives: ['google/gemma-2-9b-it:free', 'mistralai/mistral-7b-instruct:free'],
    description: 'Music video structure and lyric analysis'
  },
  'director-creation': {
    function: 'director-creation',
    defaultModel: 'openai/gpt-4o', // GPT-4o as system-wide default
    suggestedModels: ['anthropic/claude-3.5-sonnet', 'deepseek/deepseek-chat-v3.1', 'mistralai/mistral-medium-3.1'],
    freeAlternatives: ['meta-llama/llama-3.3-70b-instruct:free', 'mistralai/mistral-7b-instruct:free'],
    description: 'Creative director style generation'
  },
  'entity-extraction': {
    function: 'entity-extraction',
    defaultModel: 'openai/gpt-4o', // GPT-4o as system-wide default
    suggestedModels: ['qwen/qwen-turbo', 'moonshotai/kimi-vl-a3b-thinking', 'baidu/ernie-4.5-21b-a3b'],
    freeAlternatives: ['google/gemma-2-9b-it:free', 'microsoft/phi-3-mini-128k-instruct:free'],
    description: 'Character, location, and prop extraction'
  },
  'commercial-generation': {
    function: 'commercial-generation',
    defaultModel: 'openai/gpt-4o', // GPT-4o as system-wide default
    suggestedModels: ['mistralai/mistral-medium-3.1', 'deepseek/deepseek-chat-v3.1', 'ai21/jamba-mini-1.7'],
    freeAlternatives: ['meta-llama/llama-3.3-70b-instruct:free', 'mistralai/mistral-7b-instruct:free'],
    description: 'Commercial concept and campaign generation'
  },
  'image-analysis': {
    function: 'image-analysis',
    defaultModel: 'baidu/ernie-4.5-vl-28b-a3b', // Cheapest vision model
    suggestedModels: ['z-ai/glm-4.5v', 'google/gemini-pro-1.5'],
    freeAlternatives: ['meta-llama/llama-3.3-70b-instruct:free'], // No free vision models
    description: 'Image understanding and visual analysis'
  },
  'reasoning-tasks': {
    function: 'reasoning-tasks',
    defaultModel: 'openai/gpt-4o', // GPT-4o as system-wide default
    suggestedModels: ['deepseek/deepseek-chat-v3.1', 'qwen/qwen3-30b-a3b-instruct-2507', 'baidu/ernie-4.5-21b-a3b'],
    freeAlternatives: ['moonshotai/kimi-k2:free', 'moonshotai/kimi-dev-72b:free'],
    description: 'Complex reasoning and problem-solving tasks'
  },
  'vision-tasks': {
    function: 'vision-tasks',
    defaultModel: 'moonshotai/kimi-vl-a3b-thinking', // Cheapest vision ever
    suggestedModels: ['baidu/ernie-4.5-vl-28b-a3b', 'z-ai/glm-4.5v'],
    freeAlternatives: ['moonshotai/kimi-vl-a3b-thinking:free', 'qwen/qwen2.5-vl-32b-instruct:free'],
    description: 'Image analysis and visual understanding (Future Use)'
  },
  'children-book-generation': {
    function: 'children-book-generation',
    defaultModel: 'openai/gpt-4o', // Keep GPT-4o as requested - supports structured output
    suggestedModels: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini'], // Both support structured output
    freeAlternatives: ['moonshotai/kimi-k2:free'], // KIMI supports structured output, some others may not
    description: 'Children\'s book story analysis and scene generation (requires structured output)'
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

// Admin Configuration Management
export function saveAdminModelConfig(config: AdminModelSelection): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin-model-config', JSON.stringify(config))
    console.log('✅ Admin model configuration saved:', config)
  }
}

export function loadAdminModelConfig(): AdminModelSelection {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin-model-config')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('❌ Failed to load admin config:', error)
      }
    }
  }
  return {}
}

// Get all function types for admin interface
export function getAllFunctionTypes(): string[] {
  return Object.keys(FUNCTION_MODEL_CONFIG)
}

// Get available models for a function type
export function getModelsForFunction(functionName: string): ModelConfig[] {
  const config = FUNCTION_MODEL_CONFIG[functionName]
  if (!config) return []
  
  const allModelIds = [config.defaultModel, ...config.suggestedModels, ...config.freeAlternatives]
  return allModelIds.map(id => OPENROUTER_MODELS[id]).filter(Boolean)
}