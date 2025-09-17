import { NextRequest, NextResponse } from 'next/server'

// Import the shared sandboxes map (in a real app, this would be in a database)
const sandboxes = new Map<string, any>()

// GET /api/sandbox/[id] - Get sandbox details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sandbox = sandboxes.get(params.id)
    
    if (!sandbox) {
      return NextResponse.json(
        { error: { message: 'Sandbox not found' } },
        { status: 404 }
      )
    }

    // Update last accessed time
    sandbox.lastAccessed = new Date()

    return NextResponse.json({
      sandbox: {
        id: sandbox.id,
        name: sandbox.name,
        type: sandbox.type,
        status: sandbox.status,
        created: sandbox.created,
        lastAccessed: sandbox.lastAccessed,
        port: sandbox.port,
        files: sandbox.files,
        environment: sandbox.environment
      }
    })
  } catch (error) {
    console.error('Sandbox get error:', error)
    return NextResponse.json(
      { 
        error: { 
          message: 'Failed to get sandbox'
        } 
      },
      { status: 500 }
    )
  }
}

// PUT /api/sandbox/[id] - Update sandbox
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    const sandbox = sandboxes.get(params.id)
    
    if (!sandbox) {
      return NextResponse.json(
        { error: { message: 'Sandbox not found' } },
        { status: 404 }
      )
    }

    switch (action) {
      case 'start':
        sandbox.status = 'running'
        sandbox.port = Math.floor(Math.random() * 9000) + 1000
        break
      
      case 'stop':
        sandbox.status = 'stopped'
        sandbox.port = undefined
        break
      
      case 'restart':
        sandbox.status = 'creating'
        setTimeout(() => {
          sandbox.status = 'running'
          sandbox.port = Math.floor(Math.random() * 9000) + 1000
        }, 1000)
        break
      
      case 'update':
        if (data.name) sandbox.name = data.name
        if (data.environment) sandbox.environment = { ...sandbox.environment, ...data.environment }
        break
      
      default:
        return NextResponse.json(
          { error: { message: 'Invalid action' } },
          { status: 400 }
        )
    }

    sandbox.lastAccessed = new Date()

    return NextResponse.json({
      sandbox: {
        id: sandbox.id,
        name: sandbox.name,
        type: sandbox.type,
        status: sandbox.status,
        created: sandbox.created,
        lastAccessed: sandbox.lastAccessed,
        port: sandbox.port
      }
    })
  } catch (error) {
    console.error('Sandbox update error:', error)
    return NextResponse.json(
      { 
        error: { 
          message: 'Failed to update sandbox'
        } 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/sandbox/[id] - Delete sandbox
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sandbox = sandboxes.get(params.id)
    
    if (!sandbox) {
      return NextResponse.json(
        { error: { message: 'Sandbox not found' } },
        { status: 404 }
      )
    }

    // Stop sandbox if running
    if (sandbox.status === 'running') {
      sandbox.status = 'stopped'
    }

    // Remove sandbox
    sandboxes.delete(params.id)

    return NextResponse.json({
      message: 'Sandbox deleted successfully'
    })
  } catch (error) {
    console.error('Sandbox deletion error:', error)
    return NextResponse.json(
      { 
        error: { 
          message: 'Failed to delete sandbox'
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