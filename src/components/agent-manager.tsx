'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Play, 
  Pause, 
  Square, 
  Plus,
  Settings,
  Bot,
  Zap,
  Code,
  FileText,
  Globe,
  Terminal,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  description: string
  model: string
  status: 'idle' | 'running' | 'paused' | 'error'
  tools: string[]
  created: Date
  lastRun?: Date
  instructions: string
}

interface AgentExecution {
  id: string
  agentId: string
  input: string
  output?: string
  error?: string
  status: 'running' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  toolsUsed: string[]
}

const AVAILABLE_TOOLS = [
  { id: 'file-operations', name: 'File Operations', icon: FileText },
  { id: 'code-execution', name: 'Code Execution', icon: Code },
  { id: 'terminal', name: 'Terminal', icon: Terminal },
  { id: 'web-search', name: 'Web Search', icon: Globe },
  { id: 'image-generation', name: 'Image Generation', icon: Sparkles }
]

const AGENT_TEMPLATES = [
  {
    name: 'Code Reviewer',
    description: 'Reviews code for best practices and potential issues',
    model: 'gpt-4',
    tools: ['file-operations', 'code-execution'],
    instructions: 'You are a code review assistant. Analyze the provided code for:\n1. Code quality and best practices\n2. Potential bugs and security issues\n3. Performance optimizations\n4. Readability and maintainability\n\nProvide detailed feedback with specific suggestions for improvement.'
  },
  {
    name: 'Documentation Writer',
    description: 'Generates documentation for code and projects',
    model: 'gpt-4',
    tools: ['file-operations', 'web-search'],
    instructions: 'You are a technical documentation writer. Create comprehensive documentation including:\n1. Overview and purpose\n2. Installation and setup instructions\n3. API documentation\n4. Usage examples\n5. Troubleshooting guide\n\nUse clear, concise language and include code examples where helpful.'
  },
  {
    name: 'Test Generator',
    description: 'Creates unit and integration tests for code',
    model: 'gpt-4',
    tools: ['file-operations', 'code-execution'],
    instructions: 'You are a test generation specialist. Create comprehensive tests including:\n1. Unit tests for individual functions\n2. Integration tests for components\n3. Edge case testing\n4. Error handling tests\n\nUse appropriate testing frameworks and follow testing best practices.'
  }
]

export function AgentManager() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [executions, setExecutions] = useState<AgentExecution[]>([])
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentDescription, setNewAgentDescription] = useState('')
  const [newAgentModel, setNewAgentModel] = useState('gpt-4')
  const [newAgentInstructions, setNewAgentInstructions] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [agentInput, setAgentInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    // Load some default agents
    const defaultAgents: Agent[] = AGENT_TEMPLATES.map(template => ({
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: template.name,
      description: template.description,
      model: template.model,
      status: 'idle' as const,
      tools: template.tools,
      created: new Date(),
      instructions: template.instructions
    }))
    setAgents(defaultAgents)
  }, [])

  const createAgent = async () => {
    if (!newAgentName.trim() || !newAgentInstructions.trim()) return

    setIsCreating(true)
    try {
      const newAgent: Agent = {
        id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: newAgentName,
        description: newAgentDescription,
        model: newAgentModel,
        status: 'idle',
        tools: selectedTools,
        created: new Date(),
        instructions: newAgentInstructions
      }

      setAgents(prev => [...prev, newAgent])
      
      // Reset form
      setNewAgentName('')
      setNewAgentDescription('')
      setNewAgentInstructions('')
      setSelectedTools([])
    } catch (error) {
      console.error('Failed to create agent:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const runAgent = async (agentId: string, input: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return

    setIsRunning(true)
    
    // Update agent status
    setAgents(prev => 
      prev.map(a => 
        a.id === agentId 
          ? { ...a, status: 'running', lastRun: new Date() }
          : a
      )
    )

    const execution: AgentExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      agentId,
      input,
      status: 'running',
      startTime: new Date(),
      toolsUsed: agent.tools
    }

    setExecutions(prev => [execution, ...prev])

    try {
      // Simulate agent execution with tool calls
      await new Promise(resolve => setTimeout(resolve, 3000))

      const mockOutput = `Agent "${agent.name}" executed successfully with input: "${input}"

Tools used: ${agent.tools.join(', ')}

Instructions followed: ${agent.instructions.substring(0, 100)}...

Results:
- Analyzed input requirements
- Executed available tools
- Generated comprehensive output
- Completed all tasks successfully`

      setExecutions(prev => 
        prev.map(exec => 
          exec.id === execution.id 
            ? { 
                ...exec, 
                status: 'completed',
                output: mockOutput,
                endTime: new Date()
              }
            : exec
        )
      )

      setAgents(prev => 
        prev.map(a => 
          a.id === agentId 
            ? { ...a, status: 'idle' }
            : a
        )
      )
    } catch (error) {
      setExecutions(prev => 
        prev.map(exec => 
          exec.id === execution.id 
            ? { 
                ...exec, 
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                endTime: new Date()
              }
            : exec
        )
      )

      setAgents(prev => 
        prev.map(a => 
          a.id === agentId 
            ? { ...a, status: 'error' }
            : a
        )
      )
    } finally {
      setIsRunning(false)
    }
  }

  const deleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId))
    if (selectedAgent === agentId) {
      setSelectedAgent(null)
    }
  }

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'idle':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const selectedAgentData = agents.find(a => a.id === selectedAgent)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">AI Agents</h2>
        
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agents">My Agents</TabsTrigger>
            <TabsTrigger value="create">Create Agent</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search agents..."
                  className="flex-1"
                />
                <Button variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {agents.map((agent) => (
                    <Card 
                      key={agent.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedAgent === agent.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(agent.status)}
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(agent.status)}
                            >
                              {agent.status.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{agent.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteAgent(agent.id)
                            }}
                          >
                            <Square className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {agent.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {agent.tools.map(tool => {
                              const toolData = AVAILABLE_TOOLS.find(t => t.id === tool)
                              const Icon = toolData?.icon || Zap
                              return (
                                <Badge key={tool} variant="secondary" className="text-xs">
                                  <Icon className="h-3 w-3 mr-1" />
                                  {toolData?.name || tool}
                                </Badge>
                              )
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Model: {agent.model} • Created: {agent.created.toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              
              {selectedAgentData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Run Agent: {selectedAgentData.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Enter input for the agent..."
                      value={agentInput}
                      onChange={(e) => setAgentInput(e.target.value)}
                      className="min-h-20"
                    />
                    <Button 
                      onClick={() => runAgent(selectedAgentData.id, agentInput)}
                      disabled={!agentInput.trim() || isRunning || selectedAgentData.status === 'running'}
                      className="w-full"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Run Agent
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="create" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Agent Name</label>
                  <Input
                    placeholder="Enter agent name..."
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Model</label>
                  <Select value={newAgentModel} onValueChange={setNewAgentModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="local-model">Local Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Describe what this agent does..."
                  value={newAgentDescription}
                  onChange={(e) => setNewAgentDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Instructions</label>
                <Textarea
                  placeholder="Enter detailed instructions for the agent..."
                  value={newAgentInstructions}
                  onChange={(e) => setNewAgentInstructions(e.target.value)}
                  className="min-h-32"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Available Tools</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AVAILABLE_TOOLS.map(tool => {
                    const Icon = tool.icon
                    const isSelected = selectedTools.includes(tool.id)
                    return (
                      <Badge 
                        key={tool.id}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTool(tool.id)}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {tool.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              
              <Button 
                onClick={createAgent}
                disabled={!newAgentName.trim() || !newAgentInstructions.trim() || isCreating}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="executions" className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {executions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No agent executions yet
                  </div>
                ) : (
                  executions.map((execution) => {
                    const agent = agents.find(a => a.id === execution.agentId)
                    return (
                      <Card key={execution.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={execution.status === 'completed' ? 'default' : 'destructive'}>
                                {execution.status.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{agent?.name || 'Unknown Agent'}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {execution.startTime.toLocaleTimeString()}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium">Input:</label>
                              <p className="text-sm bg-muted p-2 rounded">
                                {execution.input}
                              </p>
                            </div>
                            
                            {execution.output && (
                              <div>
                                <label className="text-xs font-medium">Output:</label>
                                <pre className="text-sm bg-green-50 p-2 rounded border border-green-200 text-xs">
                                  {execution.output}
                                </pre>
                              </div>
                            )}
                            
                            {execution.error && (
                              <div>
                                <label className="text-xs font-medium">Error:</label>
                                <pre className="text-sm bg-red-50 p-2 rounded border border-red-200 text-red-800 text-xs">
                                  {execution.error}
                                </pre>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-1">
                              {execution.toolsUsed.map(tool => {
                                const toolData = AVAILABLE_TOOLS.find(t => t.id === tool)
                                const Icon = toolData?.icon || Zap
                                return (
                                  <Badge key={tool} variant="outline" className="text-xs">
                                    <Icon className="h-3 w-3 mr-1" />
                                    {toolData?.name || tool}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}