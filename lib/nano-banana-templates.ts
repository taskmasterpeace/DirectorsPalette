// Nano-Banana Prompt Templates for Gemini 2.5 Flash Image
// These templates are optimized for character consistency and advanced workflows

export interface NanoBananaTemplate {
  id: string
  title: string
  category: string
  prompt: string
  description: string
  tags: string[]
  variables?: string[] // Variables that can be replaced in the prompt
  chainStep?: number // If part of a chain workflow, which step
  reference?: string // Reference to model/technique
}

export const nanoBananaTemplates: NanoBananaTemplate[] = [
  // Green Screen Character Workflow
  {
    id: 'nb-green-screen-extract',
    title: 'Extract Character to Green Screen',
    category: 'characters',
    prompt: 'Extract the main character from the background and place them on a pure green screen (#00FF00). Remove all shadows and environmental lighting. Maintain exact facial features, clothing details, and proportions. Keep the character\'s pose and expression unchanged. Character token: @[CHARACTER_TOKEN]',
    description: 'Extracts a character from any background and places them on a green screen for further compositing',
    tags: ['green-screen', 'extraction', 'character', 'chroma-key'],
    variables: ['CHARACTER_TOKEN'],
    chainStep: 1,
    reference: 'nano-banana-chroma'
  },

  {
    id: 'nb-split-screen-character',
    title: 'Split Screen Character View',
    category: 'characters',
    prompt: 'Create a split-screen view of the character. Left side: close-up portrait of the face showing detailed facial features and expression. Right side: full body shot showing complete outfit and pose. Both views must maintain identical character features. Use green screen background (#00FF00). Character token: @[CHARACTER_TOKEN]. Consistent lighting and color grading across both views.',
    description: 'Creates a split-screen view with face close-up and full body shot for consistent character reference',
    tags: ['split-screen', 'character', 'portrait', 'full-body', 'reference'],
    variables: ['CHARACTER_TOKEN'],
    chainStep: 2,
    reference: 'nano-banana-split'
  },

  // Character Consistency Templates
  {
    id: 'nb-character-token-init',
    title: 'Initialize Character Token',
    category: 'characters',
    prompt: 'Define character token: @[CHARACTER_NAME]-[UNIQUE_ID]. Character details: [DESCRIPTION]. Store these exact features: eye color [EYE_COLOR], hair style [HAIR_STYLE], clothing [CLOTHING], distinctive features [FEATURES]. This token will be used for all subsequent generations.',
    description: 'Initializes a unique character token for maintaining consistency across generations',
    tags: ['character', 'token', 'consistency', 'initialization'],
    variables: ['CHARACTER_NAME', 'UNIQUE_ID', 'DESCRIPTION', 'EYE_COLOR', 'HAIR_STYLE', 'CLOTHING', 'FEATURES'],
    chainStep: 0,
    reference: 'nano-banana-token'
  },

  {
    id: 'nb-character-turnaround',
    title: 'Character Turnaround Sheet',
    category: 'characters',
    prompt: 'Generate a character turnaround sheet with multiple views on green screen. Include: front view, 3/4 view, side profile, back view. All views must maintain exact proportions and details. Character token: @[CHARACTER_TOKEN]. Arrange views in a horizontal row with consistent height and lighting.',
    description: 'Creates a complete character turnaround sheet for animation and reference',
    tags: ['turnaround', 'character', 'reference', 'multiple-views'],
    variables: ['CHARACTER_TOKEN'],
    reference: 'nano-banana-turnaround'
  },

  // Environment and Scene Templates
  {
    id: 'nb-change-environment',
    title: 'Change Character Environment',
    category: 'environments',
    prompt: 'Keep the exact same character with token @[CHARACTER_TOKEN] but change the environment to [NEW_ENVIRONMENT]. Maintain all character details including pose, expression, clothing, and proportions. Adjust only environmental lighting to match new setting.',
    description: 'Places the same character in a different environment while maintaining consistency',
    tags: ['environment', 'background', 'character', 'consistency'],
    variables: ['CHARACTER_TOKEN', 'NEW_ENVIRONMENT'],
    reference: 'nano-banana-env'
  },

  {
    id: 'nb-remove-shadows',
    title: 'Remove Shadows and Clean Edges',
    category: 'technical',
    prompt: 'Remove all shadows from the character while maintaining form definition. Clean up edges for perfect cutout. Preserve all texture details and colors. Character token: @[CHARACTER_TOKEN]. Output with transparent or green screen background.',
    description: 'Removes shadows and prepares character for clean compositing',
    tags: ['shadows', 'cleanup', 'technical', 'compositing'],
    variables: ['CHARACTER_TOKEN'],
    reference: 'nano-banana-clean'
  },

  // Chain Workflow Templates
  {
    id: 'nb-chain-step1-extract',
    title: 'Chain Step 1: Extract Character',
    category: 'workflow',
    prompt: 'STEP 1 of character workflow: Extract main character from current background. Create character token: @[AUTO_TOKEN]. Remove background completely. Output on neutral gray for next step processing.',
    description: 'First step in the chain workflow - character extraction',
    tags: ['chain', 'workflow', 'step1', 'extraction'],
    variables: ['AUTO_TOKEN'],
    chainStep: 1,
    reference: 'nano-banana-chain'
  },

  {
    id: 'nb-chain-step2-green',
    title: 'Chain Step 2: Apply Green Screen',
    category: 'workflow',
    prompt: 'STEP 2 of character workflow: Take extracted character from Step 1. Place on pure green screen (#00FF00). Remove all shadows. Maintain character token: @[AUTO_TOKEN]. Prepare for split-screen in Step 3.',
    description: 'Second step in the chain workflow - green screen application',
    tags: ['chain', 'workflow', 'step2', 'green-screen'],
    variables: ['AUTO_TOKEN'],
    chainStep: 2,
    reference: 'nano-banana-chain'
  },

  {
    id: 'nb-chain-step3-split',
    title: 'Chain Step 3: Create Split Screen',
    category: 'workflow',
    prompt: 'STEP 3 of character workflow: Create split-screen from Step 2 green screen character. Left: face close-up (shoulders up). Right: full body. Both on green screen. Maintain character token: @[AUTO_TOKEN]. Equal panel sizes.',
    description: 'Third step in the chain workflow - split screen creation',
    tags: ['chain', 'workflow', 'step3', 'split-screen'],
    variables: ['AUTO_TOKEN'],
    chainStep: 3,
    reference: 'nano-banana-chain'
  },

  // Advanced Techniques
  {
    id: 'nb-face-consistency-lock',
    title: 'Lock Face Consistency',
    category: 'advanced',
    prompt: 'Lock facial features for character token @[CHARACTER_TOKEN]. Preserve exact: facial structure, eye shape and color, nose, mouth, skin tone, and any distinctive marks. Allow only expression changes. Use this locked reference for all variations.',
    description: 'Locks facial features for maximum consistency across variations',
    tags: ['face', 'lock', 'consistency', 'advanced'],
    variables: ['CHARACTER_TOKEN'],
    reference: 'nano-banana-face-lock'
  },

  {
    id: 'nb-outfit-swap',
    title: 'Change Character Outfit',
    category: 'characters',
    prompt: 'Keep the same character with token @[CHARACTER_TOKEN], but change outfit to [NEW_OUTFIT]. Maintain exact facial features, body proportions, pose, and expression. Only clothing changes. Green screen background.',
    description: 'Changes character outfit while maintaining identity',
    tags: ['outfit', 'clothing', 'character', 'consistency'],
    variables: ['CHARACTER_TOKEN', 'NEW_OUTFIT'],
    reference: 'nano-banana-outfit'
  },

  {
    id: 'nb-expression-variations',
    title: 'Generate Expression Variations',
    category: 'characters',
    prompt: 'Create 6 expression variations for character token @[CHARACTER_TOKEN]: happy, sad, angry, surprised, neutral, laughing. Arrange in 2x3 grid. Maintain exact facial structure and features. Only expression changes. Green screen background.',
    description: 'Creates multiple expression variations for the same character',
    tags: ['expressions', 'variations', 'character', 'emotions'],
    variables: ['CHARACTER_TOKEN'],
    reference: 'nano-banana-expressions'
  },

  // Quick Access Presets
  {
    id: 'nb-quick-green-extract',
    title: '⚡ Quick Green Screen Extract',
    category: 'quick',
    prompt: 'Extract character, remove background, place on green screen #00FF00, remove shadows. Keep all details intact.',
    description: 'Quick one-click green screen extraction',
    tags: ['quick', 'green-screen', 'extract'],
    reference: 'nano-banana-quick'
  },

  {
    id: 'nb-quick-split-view',
    title: '⚡ Quick Split View',
    category: 'quick',
    prompt: 'Split screen: left = face close-up, right = full body. Green screen background. Keep character consistent.',
    description: 'Quick one-click split screen view',
    tags: ['quick', 'split-screen', 'view'],
    reference: 'nano-banana-quick'
  },

  {
    id: 'nb-quick-consistency',
    title: '⚡ Quick Consistency Token',
    category: 'quick',
    prompt: 'Create character token for consistency. Lock all features: face, hair, outfit. Ready for variations.',
    description: 'Quick character token creation for consistency',
    tags: ['quick', 'token', 'consistency'],
    reference: 'nano-banana-quick'
  }
]

// Helper function to get templates by category
export function getNanoBananaTemplatesByCategory(category: string): NanoBananaTemplate[] {
  return nanoBananaTemplates.filter(t => t.category === category)
}

// Helper function to get chain workflow templates in order
export function getNanoBananaChainWorkflow(): NanoBananaTemplate[] {
  return nanoBananaTemplates
    .filter(t => t.chainStep !== undefined)
    .sort((a, b) => (a.chainStep || 0) - (b.chainStep || 0))
}

// Helper function to replace variables in prompt
export function replacePromptVariables(prompt: string, variables: Record<string, string>): string {
  let result = prompt
  Object.entries(variables).forEach(([key, value]) => {
    // Replace both @[VARIABLE] and [VARIABLE] patterns
    result = result.replace(new RegExp(`@\\[${key}\\]`, 'g'), `@${value}`)
    result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value)
  })
  return result
}

// Get quick access templates
export function getQuickAccessTemplates(): NanoBananaTemplate[] {
  return nanoBananaTemplates.filter(t => t.category === 'quick')
}