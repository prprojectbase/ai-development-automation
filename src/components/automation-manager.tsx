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
import { Switch } from '@/components/ui/switch'
import { 
  Play, 
  Pause, 
  Square, 
  Plus,
  Settings,
  Zap,
  Clock,
  Calendar,
  Repeat,
  CheckCircle,
  AlertCircle,
  GitBranch,
  Database,
  Upload,
  Download,
  Rocket
} from 'lucide-react'

interface WorkflowStep {
  id: string
  type: 'agent' | 'tool' | 'condition' | 'delay'
  name: string
  config: Record<string, any>
  nextSteps: string[]
}

interface Workflow {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'error'
  steps: WorkflowStep[]
  triggers: WorkflowTrigger[]
  created: Date
  lastRun?: Date
  schedule?: string
}

interface WorkflowTrigger {
  id: string
  type: 'manual' | 'schedule' | 'webhook' | 'event'
  config: Record<string, any>
  active: boolean
}

interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: Date
  endTime?: Date
  currentStep?: string
  results: Record<string, any>
  trigger: string
}

const WORKFLOW_TEMPLATES = [
  {
    name: 'Code Review Pipeline',
    description: 'Automated code review and testing pipeline',
    steps: [
      {
        type: 'agent' as const,
        name: 'Code Review',
        config: { agentId: 'code-reviewer', input: '${code}' }
      },
      {
        type: 'tool' as const,
        name: 'Run Tests',
        config: { tool: 'code-execution', code: 'npm test' }
      },
      {
        type: 'condition' as const,
        name: 'Check Results',
        config: { condition: '${tests.passed} == true' }
      }
    ]
  },
  {
    name: 'Documentation Generator',
    description: 'Generate documentation from code',
    steps: [
      {
        type: 'tool' as const,
        name: 'Analyze Code',
        config: { tool: 'file-operations', action: 'read', path: './src' }
      },
      {
        type: 'agent' as const,
        name: 'Generate Docs',
        config: { agentId: 'documentation-writer', input: '${codeAnalysis}' }
      },
      {
        type: 'tool' as const,
        name: 'Save Documentation',
        config: { tool: 'file-operations', action: 'write', path: './docs', content: '${documentation}' }
      }
    ]
  },
  {
    name: 'Deployment Pipeline',
    description: 'Build, test, and deploy application',
    steps: [
      {
        type: 'tool' as const,
        name: 'Build Application',
        config: { tool: 'code-execution', code: 'npm run build' }
      },
      {
        type: 'tool' as const,
        name: 'Run Tests',
        config: { tool: 'code-execution', code: 'npm test' }
      },
      {
        type: 'condition' as const,
        name: 'Quality Gate',
        config: { condition: '${build.success} && ${tests.passed}' }
      },
      {
        type: 'tool' as const,
        name: 'Deploy',
        config: { tool: 'code-execution', code: 'npm run deploy' }
      }
    ]
  }
]

const STEP_TYPES = [
  { id: 'agent', name: 'AI Agent', icon: Zap },
  { id: 'tool', name: 'Tool Execution', icon: Database },
  { id: 'condition', name: 'Condition', icon: GitBranch },
  { id: 'delay', name: 'Delay', icon: Clock }
]

const TRIGGER_TYPES = [
  { id: 'manual', name: 'Manual Trigger', icon: Play },
  { id: 'schedule', name: 'Schedule', icon: Calendar },
  { id: 'webhook', name: 'Webhook', icon: Upload },
  { id: 'event', name: 'Event', icon: AlertCircle }
]

export function AutomationManager() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    template: ''
  })

  useEffect(() => {
    // Load default workflows
    const defaultWorkflows: Workflow[] = WORKFLOW_TEMPLATES.map(template => ({
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: template.name,
      description: template.description,
      status: 'draft' as const,
      steps: template.steps.map((step, index) => ({
        id: `step_${index}`,
        ...step,
        nextSteps: index < template.steps.length - 1 ? [`step_${index + 1}`] : []
      })),
      triggers: [
        {
          id: 'trigger_manual',
          type: 'manual',
          config: {},
          active: true
        }
      ],
      created: new Date()
    }))
    setWorkflows(defaultWorkflows)
  }, [])

  const createWorkflow = () => {
    if (!newWorkflow.name.trim()) return

    const template = WORKFLOW_TEMPLATES.find(t => t.name === newWorkflow.template)
    
    const workflow: Workflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: newWorkflow.name,
      description: newWorkflow.description,
      status: 'draft',
      steps: template ? template.steps.map((step, index) => ({
        id: `step_${index}`,
        ...step,
        nextSteps: index < template.steps.length - 1 ? [`step_${index + 1}`] : []
      })) : [],
      triggers: [
        {
          id: 'trigger_manual',
          type: 'manual',
          config: {},
          active: true
        }
      ],
      created: new Date()
    }

    setWorkflows(prev => [...prev, workflow])
    setNewWorkflow({ name: '', description: '', template: '' })
    setIsCreating(false)
  }

  const executeWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    // Update workflow status
    setWorkflows(prev => 
      prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'active', lastRun: new Date() }
          : w
      )
    )

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      workflowId,
      status: 'running',
      startTime: new Date(),
      results: {},
      trigger: 'manual'
    }

    setExecutions(prev => [execution, ...prev])

    try {
      // Simulate workflow execution
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i]
        
        // Update current step
        setExecutions(prev => 
          prev.map(exec => 
            exec.id === execution.id 
              ? { ...exec, currentStep: step.id }
              : exec
          )
        )

        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Store step result
        execution.results[step.id] = {
          status: 'completed',
          output: `Step "${step.name}" completed successfully`,
          timestamp: new Date()
        }
      }

      // Mark execution as completed
      setExecutions(prev => 
        prev.map(exec => 
          exec.id === execution.id 
            ? { ...exec, status: 'completed', endTime: new Date() }
            : exec
        )
      )

      setWorkflows(prev => 
        prev.map(w => 
          w.id === workflowId 
            ? { ...w, status: 'draft' }
            : w
        )
      )
    } catch (error) {
      setExecutions(prev => 
        prev.map(exec => 
          exec.id === execution.id 
            ? { 
                ...exec, 
                status: 'failed', 
                endTime: new Date(),
                results: {
                  ...exec.results,
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              }
            : exec
        )
      )

      setWorkflows(prev => 
        prev.map(w => 
          w.id === workflowId 
            ? { ...w, status: 'error' }
            : w
        )
      )
    }
  }

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId))
    if (selectedWorkflow === workflowId) {
      setSelectedWorkflow(null)
    }
  }

  const toggleWorkflow = (workflowId: string, active: boolean) => {
    setWorkflows(prev => 
      prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: active ? 'active' : 'paused' }
          : w
      )
    )
  }

  const getStatusIcon = (status: Workflow['status']) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const selectedWorkflowData = workflows.find(w => w.id === selectedWorkflow)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Automation & Workflows</h2>
        
        <Tabs defaultValue="workflows" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="create">Create Workflow</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflows" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button 
                  onClick={() => setIsCreating(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Workflow
                </Button>
                <div className="text-sm text-muted-foreground">
                  {workflows.length} workflows
                </div>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {workflows.map((workflow) => (
                    <Card 
                      key={workflow.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedWorkflow === workflow.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedWorkflow(workflow.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(workflow.status)}
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(workflow.status)}
                            >
                              {workflow.status.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{workflow.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={workflow.status === 'active'}
                              onCheckedChange={(checked) => toggleWorkflow(workflow.id, checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                executeWorkflow(workflow.id)
                              }}
                              disabled={workflow.status === 'active'}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteWorkflow(workflow.id)
                              }}
                            >
                              <Square className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {workflow.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />
                              {workflow.steps.length} steps
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {workflow.triggers.filter(t => t.active).length} triggers
                            </div>
                            <div>
                              Created: {workflow.created.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              
              {selectedWorkflowData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Workflow: {selectedWorkflowData.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Steps:</h4>
                        <div className="space-y-2">
                          {selectedWorkflowData.steps.map((step, index) => {
                            const StepIcon = STEP_TYPES.find(t => t.id === step.type)?.icon || Zap
                            return (
                              <div key={step.id} className="flex items-center gap-2 p-2 border rounded">
                                <div className="flex-shrink-0">
                                  <StepIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{step.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {step.type} • {step.nextSteps.length} next steps
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Step {index + 1}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Triggers:</h4>
                        <div className="space-y-2">
                          {selectedWorkflowData.triggers.map((trigger) => {
                            const TriggerIcon = TRIGGER_TYPES.find(t => t.id === trigger.type)?.icon || Play
                            return (
                              <div key={trigger.id} className="flex items-center gap-2 p-2 border rounded">
                                <TriggerIcon className="h-4 w-4" />
                                <div className="flex-1">
                                  <div className="font-medium text-sm capitalize">{trigger.type}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {trigger.active ? 'Active' : 'Inactive'}
                                  </div>
                                </div>
                                <Switch
                                  checked={trigger.active}
                                  onCheckedChange={(checked) => {
                                    setWorkflows(prev => 
                                      prev.map(w => 
                                        w.id === selectedWorkflowData.id
                                          ? {
                                              ...w,
                                              triggers: w.triggers.map(t => 
                                                t.id === trigger.id 
                                                  ? { ...t, active: checked }
                                                  : t
                                              )
                                            }
                                          : w
                                      )
                                    )
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="create" className="mt-4">
            {isCreating ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Workflow Name</label>
                  <Input
                    placeholder="Enter workflow name..."
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe what this workflow does..."
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-20"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Template (Optional)</label>
                  <Select 
                    value={newWorkflow.template} 
                    onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, template: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Start from scratch</SelectItem>
                      {WORKFLOW_TEMPLATES.map(template => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={createWorkflow}
                    disabled={!newWorkflow.name.trim()}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Click "New Workflow" to create a new automation workflow
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="executions" className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {executions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No workflow executions yet
                  </div>
                ) : (
                  executions.map((execution) => {
                    const workflow = workflows.find(w => w.id === execution.workflowId)
                    return (
                      <Card key={execution.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                execution.status === 'completed' ? 'default' : 
                                execution.status === 'failed' ? 'destructive' : 
                                'secondary'
                              }>
                                {execution.status.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{workflow?.name || 'Unknown Workflow'}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {execution.startTime.toLocaleTimeString()}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">Trigger:</span> {execution.trigger}
                            </div>
                            
                            {execution.currentStep && (
                              <div className="text-sm">
                                <span className="font-medium">Current Step:</span> {execution.currentStep}
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground">
                              Duration: {execution.endTime 
                                ? `${Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)}s`
                                : 'Running...'
                              }
                            </div>
                            
                            {Object.keys(execution.results).length > 0 && (
                              <div>
                                <label className="text-xs font-medium">Results:</label>
                                <div className="text-xs bg-muted p-2 rounded max-h-20 overflow-y-auto">
                                  {Object.entries(execution.results).map(([stepId, result]) => (
                                    <div key={stepId} className="mb-1">
                                      <strong>{stepId}:</strong> {typeof result === 'object' ? JSON.stringify(result) : result}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
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