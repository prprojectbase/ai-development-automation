'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Play, 
  Square, 
  RefreshCw, 
  Trash2, 
  Plus,
  Settings,
  Globe,
  Terminal,
  Code,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface Sandbox {
  id: string
  name: string
  type: 'node' | 'python' | 'bash' | 'docker'
  status: 'creating' | 'running' | 'stopped' | 'error'
  created: Date
  lastAccessed: Date
  port?: number
  fileCount: number
}

interface ExecutionResult {
  execution_id: string
  sandbox_id: string
  language: string
  code: string
  result: {
    output: string
    error?: string
    status: string
  }
  timestamp: Date
}

export function SandboxManager() {
  const [sandboxes, setSandboxes] = useState<Sandbox[]>([])
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([])
  const [newSandboxName, setNewSandboxName] = useState('')
  const [newSandboxType, setNewSandboxType] = useState('node')
  const [selectedSandbox, setSelectedSandbox] = useState<string | null>(null)
  const [executionCode, setExecutionCode] = useState('')
  const [executionLanguage, setExecutionLanguage] = useState('javascript')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadSandboxes()
  }, [])

  const loadSandboxes = async () => {
    try {
      const response = await fetch('/api/sandbox')
      if (response.ok) {
        const data = await response.json()
        setSandboxes(data.sandboxes.map((s: any) => ({
          ...s,
          created: new Date(s.created),
          lastAccessed: new Date(s.lastAccessed)
        })))
      }
    } catch (error) {
      console.error('Failed to load sandboxes:', error)
    }
  }

  const createSandbox = async () => {
    if (!newSandboxName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSandboxName,
          type: newSandboxType
        })
      })

      if (response.ok) {
        setNewSandboxName('')
        await loadSandboxes()
      }
    } catch (error) {
      console.error('Failed to create sandbox:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSandbox = async (id: string, action: string) => {
    try {
      const response = await fetch(`/api/sandbox/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        await loadSandboxes()
      }
    } catch (error) {
      console.error('Failed to update sandbox:', error)
    }
  }

  const deleteSandbox = async (id: string) => {
    try {
      const response = await fetch(`/api/sandbox/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadSandboxes()
        if (selectedSandbox === id) {
          setSelectedSandbox(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete sandbox:', error)
    }
  }

  const executeCode = async () => {
    if (!selectedSandbox || !executionCode.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/sandbox/${selectedSandbox}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: executionCode,
          language: executionLanguage
        })
      })

      if (response.ok) {
        const data = await response.json()
        setExecutionResults(prev => [{
          ...data,
          timestamp: new Date(data.timestamp)
        }, ...prev])
        setExecutionCode('')
      }
    } catch (error) {
      console.error('Failed to execute code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: Sandbox['status']) => {
    switch (status) {
      case 'creating':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: Sandbox['status']) => {
    switch (status) {
      case 'creating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'stopped':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const selectedSandboxData = sandboxes.find(s => s.id === selectedSandbox)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Sandbox Management</h2>
        
        <Tabs defaultValue="sandboxes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sandboxes">Sandboxes</TabsTrigger>
            <TabsTrigger value="execution">Code Execution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sandboxes" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Sandbox name..."
                  value={newSandboxName}
                  onChange={(e) => setNewSandboxName(e.target.value)}
                  className="flex-1"
                />
                <Select value={newSandboxType} onValueChange={setNewSandboxType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="node">Node.js</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="bash">Bash</SelectItem>
                    <SelectItem value="docker">Docker</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={createSandbox}
                  disabled={!newSandboxName.trim() || isLoading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {sandboxes.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No sandboxes created yet
                    </div>
                  ) : (
                    sandboxes.map((sandbox) => (
                      <Card 
                        key={sandbox.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedSandbox === sandbox.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedSandbox(sandbox.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(sandbox.status)}
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(sandbox.status)}
                              >
                                {sandbox.status.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{sandbox.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {sandbox.status === 'running' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateSandbox(sandbox.id, 'stop')
                                  }}
                                >
                                  <Square className="h-3 w-3" />
                                </Button>
                              )}
                              {sandbox.status === 'stopped' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateSandbox(sandbox.id, 'start')
                                  }}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteSandbox(sandbox.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Code className="h-3 w-3" />
                              Type: {sandbox.type}
                            </div>
                            {sandbox.port && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-3 w-3" />
                                Port: {sandbox.port}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Terminal className="h-3 w-3" />
                              Files: {sandbox.fileCount}
                            </div>
                            <div className="text-xs">
                              Created: {sandbox.created.toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="execution" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedSandbox || ''} onValueChange={setSelectedSandbox}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a sandbox" />
                  </SelectTrigger>
                  <SelectContent>
                    {sandboxes.filter(s => s.status === 'running').map((sandbox) => (
                      <SelectItem key={sandbox.id} value={sandbox.id}>
                        {sandbox.name} ({sandbox.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={executionLanguage} onValueChange={setExecutionLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="bash">Bash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Code to Execute:</label>
                <textarea
                  value={executionCode}
                  onChange={(e) => setExecutionCode(e.target.value)}
                  placeholder={`Enter ${executionLanguage} code to execute...`}
                  className="w-full h-32 p-3 border rounded-md resize-none font-mono text-sm"
                  disabled={!selectedSandbox}
                />
              </div>
              
              <Button 
                onClick={executeCode}
                disabled={!selectedSandbox || !executionCode.trim() || isLoading}
                className="w-full"
              >
                <Terminal className="h-4 w-4 mr-2" />
                Execute Code
              </Button>
              
              {executionResults.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Execution Results:</label>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {executionResults.map((result) => (
                        <Card key={result.execution_id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant={result.result.status === 'success' ? 'default' : 'destructive'}>
                                  {result.result.status.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {result.language}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {result.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {result.result.output && (
                              <pre className="text-sm bg-green-50 p-2 rounded border border-green-200">
                                {result.result.output}
                              </pre>
                            )}
                            {result.result.error && (
                              <pre className="text-sm bg-red-50 p-2 rounded border border-red-200 text-red-800">
                                {result.result.error}
                              </pre>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}