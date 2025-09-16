'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Square, 
  RefreshCw, 
  Download, 
  Share,
  Eye,
  Code,
  Terminal,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface PreviewPanelProps {
  content: string
}

interface ExecutionResult {
  id: string
  status: 'running' | 'completed' | 'failed'
  output?: string
  error?: string
  timestamp: Date
  duration?: number
}

export function PreviewPanel({ content }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState('preview')
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const executeCode = () => {
    const newResult: ExecutionResult = {
      id: Date.now().toString(),
      status: 'running',
      timestamp: new Date()
    }
    
    setExecutionResults(prev => [newResult, ...prev])
    setIsRunning(true)

    // Simulate code execution
    setTimeout(() => {
      setExecutionResults(prev => 
        prev.map(result => 
          result.id === newResult.id 
            ? {
                ...result,
                status: Math.random() > 0.3 ? 'completed' : 'failed',
                output: result.status === 'completed' 
                  ? 'Code executed successfully!\n\nOutput:\nHello, World!\nProcess completed in 0.234s'
                  : undefined,
                error: result.status === 'failed'
                  ? 'Error: Unable to execute code\n\nStack trace:\n  at main.js:10:5\n  at processTicksAndRejections (internal/process/task_queues.js:93:5)'
                  : undefined,
                duration: Math.floor(Math.random() * 1000) + 100
              }
            : result
        )
      )
      setIsRunning(false)
    }, 2000)
  }

  const stopExecution = () => {
    setIsRunning(false)
    setExecutionResults(prev => 
      prev.map(result => 
        result.status === 'running' 
          ? { ...result, status: 'failed', error: 'Execution stopped by user' }
          : result
      )
    )
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting for preview
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|p])/gm, '<p class="mb-4">')
      .replace(/<p class="mb-4"><\/p>/g, '')
  }

  const getStatusIcon = (status: ExecutionResult['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: ExecutionResult['status']) => {
    switch (status) {
      case 'running':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Preview & Output</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => executeCode()}
              disabled={isRunning}
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
            {isRunning && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={stopExecution}
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            )}
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              Code
            </TabsTrigger>
            <TabsTrigger value="terminal" className="flex items-center gap-1">
              <Terminal className="h-3 w-3" />
              Terminal
            </TabsTrigger>
            <TabsTrigger value="deploy" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Deploy
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="preview" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Generated Output Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: formatContent(content) 
                      }} 
                    />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="code" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Generated Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                      <code>{content}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="terminal" className="h-full m-0">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium">Execution Results</h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {executionResults.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No execution results yet. Click "Run" to execute code.
                    </div>
                  ) : (
                    executionResults.map((result) => (
                      <Card key={result.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result.status)}
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(result.status)}
                              >
                                {result.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {result.timestamp.toLocaleTimeString()}
                              {result.duration && ` • ${result.duration}ms`}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {result.output && (
                            <pre className="text-sm bg-green-50 p-2 rounded border border-green-200">
                              {result.output}
                            </pre>
                          )}
                          {result.error && (
                            <pre className="text-sm bg-red-50 p-2 rounded border border-red-200 text-red-800">
                              {result.error}
                            </pre>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="deploy" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Deployment Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">Deploy to Vercel</div>
                            <div className="text-sm text-muted-foreground">
                              Fast and seamless deployment
                            </div>
                          </div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <div className="flex items-center gap-3">
                          <Share className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">Export as ZIP</div>
                            <div className="text-sm text-muted-foreground">
                              Download project files
                            </div>
                          </div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <div className="flex items-center gap-3">
                          <Download className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">Generate Dockerfile</div>
                            <div className="text-sm text-muted-foreground">
                              Containerize your application
                            </div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}