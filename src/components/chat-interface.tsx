'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Send, 
  Bot, 
  User, 
  Code, 
  Play, 
  Settings,
  Sparkles,
  FileText,
  Terminal
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SandboxManager } from '@/components/sandbox-manager'
import { AgentManager } from '@/components/agent-manager'
import { AutomationManager } from '@/components/automation-manager'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  tools?: string[]
}

interface ChatInterfaceProps {
  messages: Message[]
  onMessagesChange: (messages: Message[]) => void
  onPreviewUpdate: (content: string) => void
}

const AI_MODELS = [
  { id: 'deepseek-ai/DeepSeek-V3.1', name: 'DeepSeek V3.1' },
  { id: 'meituan-longcat/LongCat-Flash-Chat-FP8', name: 'LongCat Flash' },
  { id: 'Qwen/Qwen3-235B-A22B-Thinking-2507', name: 'Qwen3 235B' },
  { id: 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8', name: 'Qwen3 Coder 480B' },
  { id: 'Qwen/Qwen3-Next-80B-A3B-Thinking', name: 'Qwen3 Next 80B' },
  { id: 'zai-org/GLM-4.5-FP8', name: 'GLM 4.5' },
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B' },
  { id: 'NousResearch/Hermes-4-405B-FP8', name: 'Hermes 4 405B' },
  { id: 'deepseek-ai/DeepSeek-R1-0528', name: 'DeepSeek R1' },
  { id: 'moonshotai/Kimi-K2-Instruct-0905', name: 'Kimi K2' },
  { id: 'all-hands/openhands-lm-32b-v0.1-ep3', name: 'OpenHands LM 32B' },
  { id: 'Tesslate/UIGEN-X-32B-0727', name: 'UIGEN X 32B' }
]

const TOOLS = [
  { id: 'file-operations', name: 'File Operations', icon: FileText },
  { id: 'code-execution', name: 'Code Execution', icon: Code },
  { id: 'terminal', name: 'Terminal', icon: Terminal },
  { id: 'web-search', name: 'Web Search', icon: Sparkles }
]

export function ChatInterface({ messages, onMessagesChange, onPreviewUpdate }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8')
  const [enabledTools, setEnabledTools] = useState<string[]>(['file-operations', 'code-execution'])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    onMessagesChange([...messages, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call the real AI API
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an AI development assistant. Help users automate their software development tasks.' },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: input }
          ],
          model: selectedModel,
          temperature: 0.7,
          max_tokens: 1000,
          // Add tools if enabled
          ...(enabledTools.length > 0 && {
            tools: enabledTools.map(tool => ({
              type: 'function',
              function: {
                name: tool,
                description: `Execute ${tool} operation`
              }
            }))
          })
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'I apologize, but I encountered an error.',
        timestamp: new Date(),
        tools: enabledTools
      }

      onMessagesChange([...messages, userMessage, assistantMessage])
      setIsLoading(false)
      
      // Update preview with AI response
      onPreviewUpdate(`# AI Response\n\n${data.choices[0]?.message?.content}\n\n---\n**Model:** ${selectedModel}\n**Tokens Used:** ${data.usage?.total_tokens || 0}\n**Tools Available:** ${enabledTools.join(', ')}`)
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }

      onMessagesChange([...messages, userMessage, errorMessage])
      setIsLoading(false)
      
      // Update preview with error information
      onPreviewUpdate(`# Error\n\nFailed to process request: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your connection and try again.`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleTool = (toolId: string) => {
    setEnabledTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.*)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">AI Development Assistant</h2>
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-0">
            <div className="flex flex-wrap gap-2">
              {TOOLS.map(tool => {
                const Icon = tool.icon
                const isEnabled = enabledTools.includes(tool.id)
                return (
                  <Badge 
                    key={tool.id}
                    variant={isEnabled ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTool(tool.id)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {tool.name}
                  </Badge>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="agents" className="mt-0">
            <div className="h-full">
              <AgentManager />
            </div>
          </TabsContent>
          
          <TabsContent value="sandbox" className="mt-0">
            <div className="h-full">
              <SandboxManager />
            </div>
          </TabsContent>
          
          <TabsContent value="automation" className="mt-0">
            <div className="h-full">
              <AutomationManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {message.role === 'assistant' ? (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: formatMessage(message.content) 
                      }} 
                    />
                  ) : (
                    message.content
                  )}
                </div>
                
                {message.tools && message.tools.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.tools.map(tool => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {message.timestamp && (
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to help you with your development tasks..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}