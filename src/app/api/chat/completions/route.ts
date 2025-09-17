import { NextRequest, NextResponse } from 'next/server'

// Chutes AI API configuration
const CHUTES_API_KEY = process.env.CHUTES_API_KEY
const CHUTES_API_URL = 'https://llm.chutes.ai/v1/chat/completions'

// OpenAI compatible chat completions endpoint using Chutes AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      messages, 
      model = 'deepseek-ai/DeepSeek-V3.1', 
      temperature = 0.7, 
      max_tokens = 30000,
      stream = false,
      tools,
      tool_choice
    } = body

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: { message: 'Messages are required and must be an array' } },
        { status: 400 }
      )
    }

    // Validate API key
    if (!CHUTES_API_KEY) {
      return NextResponse.json(
        { 
          error: { 
            message: 'Chutes API key is not configured',
            type: 'configuration_error'
          } 
        },
        { status: 500 }
      )
    }

    console.log('Calling Chutes AI API...')
    console.log('Model:', model)
    console.log('Messages count:', messages.length)
    
    const response = await fetch(CHUTES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHUTES_API_KEY}`,
      },
      body: JSON.stringify({
        messages,
        model,
        temperature,
        max_tokens,
        stream,
        ...(tools && { tools }),
        ...(tool_choice && { tool_choice })
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Chutes AI API call successful')
      console.log('Response ID:', data.id)
      return NextResponse.json(data)
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.log('Chutes AI API error:', errorData)
      console.log('Status:', response.status)
      
      return NextResponse.json(
        { 
          error: { 
            message: errorData.detail || errorData.error?.message || 'Chutes API request failed',
            type: 'api_error',
            status: response.status,
            details: errorData
          } 
        },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Chat completion error:', error)
    return NextResponse.json(
      { 
        error: { 
          message: 'Internal server error',
          type: 'internal_error',
          details: error.message
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