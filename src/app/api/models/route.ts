import { NextResponse } from 'next/server'

// Available AI models configuration for Chutes AI
const AVAILABLE_MODELS = [
  {
    id: 'deepseek-ai/DeepSeek-V3.1',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'deepseek-ai',
    permission: [],
    root: 'deepseek-ai/DeepSeek-V3.1',
    parent: null,
    description: 'DeepSeek V3.1 - Advanced reasoning and coding capabilities'
  },
  {
    id: 'meituan-longcat/LongCat-Flash-Chat-FP8',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'meituan-longcat',
    permission: [],
    root: 'meituan-longcat/LongCat-Flash-Chat-FP8',
    parent: null,
    description: 'LongCat Flash - Fast and efficient model for general tasks'
  },
  {
    id: 'Qwen/Qwen3-235B-A22B-Thinking-2507',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'qwen',
    permission: [],
    root: 'Qwen/Qwen3-235B-A22B-Thinking-2507',
    parent: null,
    description: 'Qwen3 235B - Large language model with thinking capabilities'
  },
  {
    id: 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'qwen',
    permission: [],
    root: 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8',
    parent: null,
    description: 'Qwen3 Coder 480B - Specialized model for programming and development'
  },
  {
    id: 'Qwen/Qwen3-Next-80B-A3B-Thinking',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'qwen',
    permission: [],
    root: 'Qwen/Qwen3-Next-80B-A3B-Thinking',
    parent: null,
    description: 'Qwen3 Next 80B - Advanced model with thinking capabilities'
  },
  {
    id: 'zai-org/GLM-4.5-FP8',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'zai-org',
    permission: [],
    root: 'zai-org/GLM-4.5-FP8',
    parent: null,
    description: 'GLM 4.5 - General language model with strong performance'
  },
  {
    id: 'openai/gpt-oss-120b',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'openai',
    permission: [],
    root: 'openai/gpt-oss-120b',
    parent: null,
    description: 'GPT OSS 120B - Open source GPT variant'
  },
  {
    id: 'NousResearch/Hermes-4-405B-FP8',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'nousresearch',
    permission: [],
    root: 'NousResearch/Hermes-4-405B-FP8',
    parent: null,
    description: 'Hermes 4 405B - Large model with instruction following capabilities'
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-0528',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'deepseek-ai',
    permission: [],
    root: 'deepseek-ai/DeepSeek-R1-0528',
    parent: null,
    description: 'DeepSeek R1 - Reasoning optimized model'
  },
  {
    id: 'moonshotai/Kimi-K2-Instruct-0905',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'moonshotai',
    permission: [],
    root: 'moonshotai/Kimi-K2-Instruct-0905',
    parent: null,
    description: 'Kimi K2 - Instruction model with strong performance'
  },
  {
    id: 'all-hands/openhands-lm-32b-v0.1-ep3',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'all-hands',
    permission: [],
    root: 'all-hands/openhands-lm-32b-v0.1-ep3',
    parent: null,
    description: 'OpenHands LM 32B - Model optimized for agent tasks'
  },
  {
    id: 'Tesslate/UIGEN-X-32B-0727',
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'tesslate',
    permission: [],
    root: 'Tesslate/UIGEN-X-32B-0727',
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