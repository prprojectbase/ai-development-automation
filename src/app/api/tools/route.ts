import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { writeFile, mkdir, readFile, readdir } from 'fs/promises'
import { join } from 'path'

// Available tools for AI agents
const AVAILABLE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_file',
      description: 'Create a new file with specified content',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path relative to project root'
          },
          content: {
            type: 'string',
            description: 'File content'
          }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read content of a file',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path relative to project root'
          }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_files',
      description: 'List files in a directory',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Directory path relative to project root'
          }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'execute_code',
      description: 'Execute code in a sandbox environment',
      parameters: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Code to execute'
          },
          language: {
            type: 'string',
            enum: ['javascript', 'python', 'bash'],
            description: 'Programming language'
          }
        },
        required: ['code', 'language']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for information',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          },
          num_results: {
            type: 'number',
            description: 'Number of results to return',
            default: 5
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_image',
      description: 'Generate an image using AI',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Image generation prompt'
          },
          size: {
            type: 'string',
            enum: ['256x256', '512x512', '1024x1024'],
            description: 'Image size',
            default: '512x512'
          }
        },
        required: ['prompt']
      }
    }
  }
]

// POST /api/tools - Execute a tool call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tool_name, parameters } = body

    if (!tool_name || !parameters) {
      return NextResponse.json(
        { error: { message: 'Tool name and parameters are required' } },
        { status: 400 }
      )
    }

    let result

    switch (tool_name) {
      case 'create_file':
        result = await createFile(parameters.path, parameters.content)
        break
      
      case 'read_file':
        result = await readFileContent(parameters.path)
        break
      
      case 'list_files':
        result = await listDirectoryFiles(parameters.path)
        break
      
      case 'execute_code':
        result = await executeCode(parameters.code, parameters.language)
        break
      
      case 'web_search':
        result = await performWebSearch(parameters.query, parameters.num_results)
        break
      
      case 'generate_image':
        result = await generateImage(parameters.prompt, parameters.size)
        break
      
      default:
        return NextResponse.json(
          { error: { message: `Unknown tool: ${tool_name}` } },
          { status: 400 }
        )
    }

    return NextResponse.json({
      tool_name,
      result,
      status: 'success'
    })
  } catch (error) {
    console.error('Tool execution error:', error)
    return NextResponse.json(
      { 
        error: { 
          message: 'Tool execution failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    )
  }
}

// GET /api/tools - List available tools
export async function GET() {
  return NextResponse.json({
    tools: AVAILABLE_TOOLS
  })
}

// Tool implementations
async function createFile(path: string, content: string) {
  const fullPath = join(process.cwd(), path)
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'))
  
  // Create directory if it doesn't exist
  await mkdir(dir, { recursive: true })
  
  // Write file
  await writeFile(fullPath, content, 'utf-8')
  
  return {
    message: `File created successfully at ${path}`,
    path
  }
}

async function readFileContent(path: string) {
  const fullPath = join(process.cwd(), path)
  const content = await readFile(fullPath, 'utf-8')
  
  return {
    content,
    path
  }
}

async function listDirectoryFiles(path: string) {
  const fullPath = join(process.cwd(), path)
  const files = await readdir(fullPath, { withFileTypes: true })
  
  const fileList = files.map(file => ({
    name: file.name,
    isDirectory: file.isDirectory(),
    path: join(path, file.name)
  }))
  
  return {
    files: fileList,
    path
  }
}

async function executeCode(code: string, language: string) {
  // For now, simulate code execution
  // In a real implementation, you would use a sandbox environment
  
  const executionId = `exec_${Date.now()}`
  
  // Simulate different language execution
  let output = ''
  
  switch (language) {
    case 'javascript':
      try {
        // WARNING: This is unsafe for production - use proper sandboxing
        // For demo purposes only
        const result = eval(code)
        output = `Execution result: ${JSON.stringify(result)}`
      } catch (error) {
        output = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
      break
    
    case 'python':
      output = `Python execution simulated. Code:\n${code}\n\nOutput: Python execution would happen here.`
      break
    
    case 'bash':
      output = `Bash command execution simulated. Command:\n${code}\n\nOutput: Command execution would happen here.`
      break
  }
  
  return {
    execution_id: executionId,
    output,
    language,
    status: 'completed'
  }
}

async function performWebSearch(query: string, numResults: number = 5) {
  try {
    const zai = await ZAI.create()
    
    const searchResult = await zai.functions.invoke("web_search", {
      query,
      num: numResults
    })
    
    return {
      query,
      results: searchResult,
      count: searchResult.length
    }
  } catch (error) {
    throw new Error(`Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function generateImage(prompt: string, size: string = '512x512') {
  try {
    const zai = await ZAI.create()
    
    const response = await zai.images.generations.create({
      prompt,
      size: size as any
    })
    
    return {
      prompt,
      size,
      image_data: response.data[0].base64,
      status: 'success'
    }
  } catch (error) {
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}