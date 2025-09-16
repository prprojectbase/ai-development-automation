import { NextResponse } from 'next/server'

// Available AI models configuration for Chutes AI
const AVAILABLE_MODELS = [
  {
    id: 'deepseek-v3.1',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'deepseek-ai',
    permission: [],
    root: 'deepseek-v3.1',
    parent: null,
    description: 'DeepSeek V3.1 - Advanced reasoning and coding capabilities'
  },
  {
    id: 'longcat-flash',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'meituan-longcat',
    permission: [],
    root: 'longcat-flash',
    parent: null,
    description: 'LongCat Flash - Fast and efficient model for general tasks'
  },
  {
    id: 'qwen3-235b',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'qwen',
    permission: [],
    root: 'qwen3-235b',
    parent: null,
    description: 'Qwen3 235B - Large language model with thinking capabilities'
  },
  {
    id: 'qwen3-coder-480b',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'qwen',
    permission: [],
    root: 'qwen3-coder-480b',
    parent: null,
    description: 'Qwen3 Coder 480B - Specialized model for programming and development'
  },
  {
    id: 'qwen3-next-80b',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'qwen',
    permission: [],
    root: 'qwen3-next-80b',
    parent: null,
    description: 'Qwen3 Next 80B - Advanced model with thinking capabilities'
  },
  {
    id: 'k2-think',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'llm360',
    permission: [],
    root: 'k2-think',
    parent: null,
    description: 'K2 Think - Model optimized for complex reasoning'
  },
  {
    id: 'glm-4.5',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'zai-org',
    permission: [],
    root: 'glm-4.5',
    parent: null,
    description: 'GLM 4.5 - General language model with strong performance'
  },
  {
    id: 'gpt-oss-120b',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'openai',
    permission: [],
    root: 'gpt-oss-120b',
    parent: null,
    description: 'GPT OSS 120B - Open source GPT variant'
  },
  {
    id: 'hermes-4-405b',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'nousresearch',
    permission: [],
    root: 'hermes-4-405b',
    parent: null,
    description: 'Hermes 4 405B - Large model with instruction following capabilities'
  },
  {
    id: 'deepseek-r1',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'deepseek-ai',
    permission: [],
    root: 'deepseek-r1',
    parent: null,
    description: 'DeepSeek R1 - Reasoning optimized model'
  },
  {
    id: 'kimi-k2',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'moonshotai',
    permission: [],
    root: 'kimi-k2',
    parent: null,
    description: 'Kimi K2 - Instruction model with strong performance'
  },
  {
    id: 'openhands-lm-32b',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'all-hands',
    permission: [],
    root: 'openhands-lm-32b',
    parent: null,
    description: 'OpenHands LM 32B - Model optimized for agent tasks'
  },
  {
    id: 'uigen-x-32b',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'tesslate',
    permission: [],
    root: 'uigen-x-32b',
    parent: null,
    description: 'UIGEN X 32B - Specialized for UI generation and design'
  }
]

// GET /api/models - List available models
export async function GET() {
  try {
    return NextResponse.json({
      object: 'list',
      data: AVAILABLE_MODELS
    })
  } catch (error) {
    console.error('Models list error:', error)
    return NextResponse.json(
      { 
        error: { 
          message: 'Internal server error',
          type: 'internal_error'
        } 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}