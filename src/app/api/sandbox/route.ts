import { NextRequest, NextResponse } from 'next/server'

// Sandbox storage (in-memory for demo, use database in production)
const sandboxes = new Map<string, any>()

// Sandbox interface
interface Sandbox {
  id: string
  name: string
  type: 'node' | 'python' | 'bash' | 'docker'
  status: 'creating' | 'running' | 'stopped' | 'error'
  created: Date
  lastAccessed: Date
  files: { path: string; content: string }[]
  environment: Record<string, string>
  port?: number
}

// POST /api/sandbox - Create a new sandbox
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type = 'node', environment = {} } = body

    if (!name) {
      return NextResponse.json(
        { error: { message: 'Sandbox name is required' } },
        { status: 400 }
      )
    }

    const sandboxId = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const sandbox: Sandbox = {
      id: sandboxId,
      name,
      type,
      status: 'creating',
      created: new Date(),
      lastAccessed: new Date(),
      files: [],
      environment: {
        ...environment,
        SANDBOX_ID: sandboxId
      }
    }

    // Simulate sandbox creation
    setTimeout(() => {
      sandbox.status = 'running'
      sandbox.port = Math.floor(Math.random() * 9000) + 1000
    }, 2000)

    sandboxes.set(sandboxId, sandbox)

    return NextResponse.json({
      sandbox: {
        id: sandbox.id,
        name: sandbox.name,
        type: sandbox.type,
        status: sandbox.status,
        created: sandbox.created,
        port: sandbox.port
      }
    })
  } catch (error) {
    console.error('Sandbox creation error:', error)
    return NextResponse.json(
      { 
        error: { 
          message: 'Failed to create sandbox',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}

// GET /api/sandbox - List all sandboxes
export async function GET() {
  try {
    const sandboxList = Array.from(sandboxes.values()).map(sandbox => ({
      id: sandbox.id,
      name: sandbox.name,
      type: sandbox.type,
      status: sandbox.status,
      created: sandbox.created,
      lastAccessed: sandbox.lastAccessed,
      port: sandbox.port,
      fileCount: sandbox.files.length
    }))

    return NextResponse.json({
      sandboxes: sandboxList
    })
  } catch (error) {
    console.error('Sandbox list error:', error)
    return NextResponse.json(
      { 
        error: { 
          message: 'Failed to list sandboxes'
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