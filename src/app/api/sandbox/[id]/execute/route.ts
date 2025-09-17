import { NextRequest, NextResponse } from 'next/server'

// Import the shared sandboxes map (in a real app, this would be in a database)
const sandboxes = new Map<string, any>()

// POST /api/sandbox/[id]/execute - Execute code in sandbox
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { code, language = 'javascript', files = [] } = body

    if (!code) {
      return NextResponse.json(
        { error: { message: 'Code is required' } },
        { status: 400 }
      )
    }

    const sandbox = sandboxes.get(id)
    
    if (!sandbox) {
      return NextResponse.json(
        { error: { message: 'Sandbox not found' } },
        { status: 404 }
      )
    }

    if (sandbox.status !== 'running') {
      return NextResponse.json(
        { error: { message: 'Sandbox is not running' } },
        { status: 400 }
      )
    }

    // Update sandbox files if provided
    if (files.length > 0) {
      files.forEach((file: any) => {
        const existingFileIndex = sandbox.files.findIndex((f: any) => f.path === file.path)
        if (existingFileIndex >= 0) {
          sandbox.files[existingFileIndex] = file
        } else {
          sandbox.files.push(file)
        }
      })
    }

    // Execute code based on language
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    
    let result
    let output = ''
    let error = null

    try {
      switch (language) {
        case 'javascript':
          // Simulate JavaScript execution
          if (code.includes('console.log')) {
            const logs = code.match(/console\.log\(([^)]+)\)/g) || []
            output = logs.map(log => {
              const match = log.match(/console\.log\(([^)]+)\)/)
              return match ? match[1] : ''
            }).join('\n')
          }
          
          // Try to evaluate the code (WARNING: Unsafe for production)
          try {
            const evalResult = eval(code)
            if (evalResult !== undefined && !code.includes('console.log')) {
              output = String(evalResult)
            }
          } catch (evalError) {
            // Ignore eval errors for now, focus on console.log output
          }
          
          result = {
            output: output || 'Code executed successfully (no output)',
            status: 'success'
          }
          break

        case 'python':
          // Simulate Python execution
          result = {
            output: `Python code executed successfully:\n${code}\n\nOutput: Python execution simulated`,
            status: 'success'
          }
          break

        case 'bash':
          // Simulate Bash execution
          result = {
            output: `Command executed: ${code}\n\nOutput: Bash execution simulated`,
            status: 'success'
          }
          break

        default:
          throw new Error(`Unsupported language: ${language}`)
      }
    } catch (execError) {
      error = execError instanceof Error ? execError.message : 'Unknown error'
      result = {
        output: '',
        error: error,
        status: 'error'
      }
    }

    // Update sandbox last accessed time
    sandbox.lastAccessed = new Date()

    return NextResponse.json({
      execution_id: executionId,
      sandbox_id: id,
      language,
      code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
      result,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Sandbox execution error:', error)
    return NextResponse.json(
      { 
        error: { 
          message: 'Failed to execute code',
          details: error instanceof Error ? error.message : 'Unknown error'
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