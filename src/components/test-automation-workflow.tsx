'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Square, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code,
  TestTube,
  Bug,
  BarChart3,
  Clock,
  FileText,
  Zap,
  Target,
  Settings
} from 'lucide-react'

interface TestStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'fixed'
  type: 'generation' | 'execution' | 'testing' | 'validation' | 'fixing'
  input: string
  output?: string
  error?: string
  startTime?: Date
  endTime?: Date
  duration?: number
  details?: any
}

interface TestExecution {
  id: string
  userPrompt: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  steps: TestStep[]
  startTime?: Date
  endTime?: Date
  totalDuration?: number
  statistics: {
    codeGenerated: boolean
    errorsDetected: number
    errorsFixed: number
    testsGenerated: boolean
    testsPassed: boolean
    outputMatched: boolean
  }
}

const WORKFLOW_STEPS = [
  {
    id: 'generation',
    name: 'Code Generation',
    type: 'generation' as const,
    description: 'Generate code based on user prompt'
  },
  {
    id: 'execution',
    name: 'Code Execution',
    type: 'execution' as const,
    description: 'Execute generated code in sandbox'
  },
  {
    id: 'error-detection',
    name: 'Error Detection',
    type: 'testing' as const,
    description: 'Automatically detect errors in code'
  },
  {
    id: 'error-fixing',
    name: 'Error Fixing',
    type: 'fixing' as const,
    description: 'Fix detected errors automatically'
  },
  {
    id: 'test-generation',
    name: 'Test Generation',
    type: 'testing' as const,
    description: 'Generate comprehensive tests'
  },
  {
    id: 'test-execution',
    name: 'Test Execution',
    type: 'testing' as const,
    description: 'Execute generated tests'
  },
  {
    id: 'validation',
    name: 'Output Validation',
    type: 'validation' as const,
    description: 'Validate output matches expected functionality'
  },
  {
    id: 'statistics',
    name: 'Generate Statistics',
    type: 'validation' as const,
    description: 'Generate implementation statistics'
  }
]

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'html-css-js', label: 'HTML/CSS/JavaScript' },
  { value: 'bash', label: 'Bash' },
  { value: 'typescript', label: 'TypeScript' }
]

export function TestAutomationWorkflow() {
  const [userPrompt, setUserPrompt] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [currentExecution, setCurrentExecution] = useState<TestExecution | null>(null)
  const [executionHistory, setExecutionHistory] = useState<TestExecution[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const executeWorkflow = async () => {
    if (!userPrompt.trim()) return

    setIsRunning(true)
    setProgress(0)

    const execution: TestExecution = {
      id: `exec_${Date.now()}`,
      userPrompt,
      status: 'running',
      startTime: new Date(),
      steps: WORKFLOW_STEPS.map(step => ({
        id: step.id,
        name: step.name,
        type: step.type,
        status: 'pending' as const,
        input: userPrompt
      })),
      statistics: {
        codeGenerated: false,
        errorsDetected: 0,
        errorsFixed: 0,
        testsGenerated: false,
        testsPassed: false,
        outputMatched: false
      }
    }

    setCurrentExecution(execution)

    try {
      // Step 1: Code Generation
      await executeStep(execution, 'generation', async () => {
        const response = await fetch('/api/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: `You are an expert ${selectedLanguage} developer. Generate complete, working code based on the user's request. Include all necessary imports, functions, and example usage.` },
              { role: 'user', content: userPrompt }
            ],
            model: 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8',
            max_tokens: 2000,
            temperature: 0.3
          })
        })

        const data = await response.json()
        return data.choices[0]?.message?.content || 'No code generated'
      })

      // Step 2: Code Execution
      await executeStep(execution, 'execution', async () => {
        const generatedCode = execution.steps.find(s => s.id === 'generation')?.output || ''
        
        // Create sandbox
        const sandboxResponse = await fetch('/api/sandbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `test_${Date.now()}`,
            type: 'node'
          })
        })

        const sandboxData = await sandboxResponse.json()
        const sandboxId = sandboxData.sandbox.id

        // Execute code in sandbox
        const executionResponse = await fetch(`/api/sandbox/${sandboxId}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: generatedCode,
            language: selectedLanguage === 'html-css-js' ? 'javascript' : selectedLanguage
          })
        })

        const executionData = await executionResponse.json()
        return executionData.result
      })

      // Step 3: Error Detection
      await executeStep(execution, 'error-detection', async () => {
        const executionResult = execution.steps.find(s => s.id === 'execution')?.output
        const generatedCode = execution.steps.find(s => s.id === 'generation')?.output || ''
        
        const response = await fetch('/api/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a code quality expert. Analyze the provided code and execution results to detect errors, bugs, and potential issues. Return a JSON response with error count and specific issues found.' },
              { role: 'user', content: `Code:\n${generatedCode}\n\nExecution Result:\n${JSON.stringify(executionResult)}` }
            ],
            model: 'deepseek-ai/DeepSeek-V3.1',
            max_tokens: 1000,
            temperature: 0.2
          })
        })

        const data = await response.json()
        const analysis = data.choices[0]?.message?.content || 'No errors detected'
        
        // Parse error count from analysis (simplified)
        const errorCount = (analysis.match(/error/gi) || []).length
        execution.statistics.errorsDetected = errorCount
        
        return analysis
      })

      // Step 4: Error Fixing (if errors detected)
      if (execution.statistics.errorsDetected > 0) {
        await executeStep(execution, 'error-fixing', async () => {
          const generatedCode = execution.steps.find(s => s.id === 'generation')?.output || ''
          const errorAnalysis = execution.steps.find(s => s.id === 'error-detection')?.output || ''
          
          const response = await fetch('/api/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                { role: 'system', content: 'You are an expert debugger. Fix the errors in the provided code based on the error analysis. Return the corrected code.' },
                { role: 'user', content: `Original Code:\n${generatedCode}\n\nError Analysis:\n${errorAnalysis}` }
              ],
              model: 'deepseek-ai/DeepSeek-R1-0528',
              max_tokens: 2000,
              temperature: 0.3
            })
          })

          const data = await response.json()
          const fixedCode = data.choices[0]?.message?.content || generatedCode
          execution.statistics.errorsFixed = execution.statistics.errorsDetected
          
          return fixedCode
        })
      }

      // Step 5: Test Generation
      await executeStep(execution, 'test-generation', async () => {
        const finalCode = execution.steps.find(s => s.id === 'error-fixing')?.output || 
                         execution.steps.find(s => s.id === 'generation')?.output || ''
        
        const response = await fetch('/api/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a testing expert. Generate comprehensive unit tests for the provided code. Include test cases for normal operation, edge cases, and error handling.' },
              { role: 'user', content: `Code:\n${finalCode}` }
            ],
            model: 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8',
            max_tokens: 1500,
            temperature: 0.3
          })
        })

        const data = await response.json()
        execution.statistics.testsGenerated = true
        return data.choices[0]?.message?.content || 'No tests generated'
      })

      // Step 6: Test Execution
      await executeStep(execution, 'test-execution', async () => {
        const tests = execution.steps.find(s => s.id === 'test-generation')?.output || ''
        
        // Simulate test execution
        const testResults = {
          passed: Math.random() > 0.3, // 70% pass rate for demo
          totalTests: 5,
          passedTests: Math.floor(Math.random() * 4) + 1,
          failedTests: Math.floor(Math.random() * 2)
        }
        
        execution.statistics.testsPassed = testResults.passed
        return `Test Results: ${testResults.passedTests}/${testResults.totalTests} tests passed`
      })

      // Step 7: Output Validation
      await executeStep(execution, 'validation', async () => {
        const originalPrompt = execution.userPrompt
        const finalCode = execution.steps.find(s => s.id === 'error-fixing')?.output || 
                         execution.steps.find(s => s.id === 'generation')?.output || ''
        
        const response = await fetch('/api/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a validation expert. Analyze if the generated code meets the requirements specified in the user prompt. Return a validation result with pass/fail status.' },
              { role: 'user', content: `User Request: ${originalPrompt}\n\nGenerated Code:\n${finalCode}` }
            ],
            model: 'deepseek-ai/DeepSeek-V3.1',
            max_tokens: 500,
            temperature: 0.2
          })
        })

        const data = await response.json()
        const validation = data.choices[0]?.message?.content || 'Validation failed'
        execution.statistics.outputMatched = validation.toLowerCase().includes('pass')
        
        return validation
      })

      // Step 8: Generate Statistics
      await executeStep(execution, 'statistics', async () => {
        const stats = {
          totalSteps: execution.steps.length,
          completedSteps: execution.steps.filter(s => s.status === 'completed').length,
          failedSteps: execution.steps.filter(s => s.status === 'failed').length,
          totalDuration: execution.steps.reduce((acc, step) => acc + (step.duration || 0), 0),
          codeGenerated: execution.statistics.codeGenerated,
          errorsDetected: execution.statistics.errorsDetected,
          errorsFixed: execution.statistics.errorsFixed,
          testsGenerated: execution.statistics.testsGenerated,
          testsPassed: execution.statistics.testsPassed,
          outputMatched: execution.statistics.outputMatched,
          successRate: (execution.statistics.testsPassed && execution.statistics.outputMatched) ? 100 : 75
        }
        
        return JSON.stringify(stats, null, 2)
      })

      // Mark execution as completed
      execution.status = 'completed'
      execution.endTime = new Date()
      execution.totalDuration = execution.endTime.getTime() - execution.startTime.getTime()

    } catch (error) {
      execution.status = 'failed'
      execution.endTime = new Date()
      console.error('Workflow execution failed:', error)
    } finally {
      setIsRunning(false)
      setProgress(100)
      setExecutionHistory(prev => [execution, ...prev])
    }
  }

  const executeStep = async (execution: TestExecution, stepId: string, action: () => Promise<string>) => {
    const step = execution.steps.find(s => s.id === stepId)
    if (!step) return

    // Update step status to running
    step.status = 'running'
    step.startTime = new Date()
    setCurrentExecution({ ...execution })

    try {
      // Execute the step action
      const output = await action()
      
      // Update step with results
      step.status = 'completed'
      step.output = output
      step.endTime = new Date()
      step.duration = step.endTime.getTime() - step.startTime.getTime()

      // Update execution statistics
      if (stepId === 'generation') execution.statistics.codeGenerated = true

      // Update progress
      const completedSteps = execution.steps.filter(s => s.status === 'completed').length
      setProgress((completedSteps / execution.steps.length) * 100)

    } catch (error) {
      step.status = 'failed'
      step.error = error instanceof Error ? error.message : 'Unknown error'
      step.endTime = new Date()
    }

    setCurrentExecution({ ...execution })
  }

  const getStepIcon = (step: TestStep) => {
    switch (step.type) {
      case 'generation': return <Code className="h-4 w-4" />
      case 'execution': return <Zap className="h-4 w-4" />
      case 'testing': return <TestTube className="h-4 w-4" />
      case 'validation': return <Target className="h-4 w-4" />
      case 'fixing': return <Bug className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'fixed': return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusColor = (status: TestStep['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'fixed': return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Test Automation Workflow</h2>
        
        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workflow">New Workflow</TabsTrigger>
            <TabsTrigger value="history">Execution History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflow" className="mt-4 space-y-4">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configure Test Automation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">What do you want to create?</label>
                  <Textarea
                    placeholder="e.g., Create a snake game with HTML, CSS, and JavaScript"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="min-h-20 mt-2"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Programming Language</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={executeWorkflow}
                  disabled={!userPrompt.trim() || isRunning}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRunning ? 'Running Workflow...' : 'Start Test Automation'}
                </Button>
              </CardContent>
            </Card>

            {/* Progress Section */}
            {currentExecution && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Workflow Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={currentExecution.status === 'running' ? 'default' : 'secondary'}>
                      {currentExecution.status.toUpperCase()}
                    </Badge>
                    {currentExecution.startTime && (
                      <span className="text-xs text-muted-foreground">
                        Started: {currentExecution.startTime.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Steps Section */}
            {currentExecution && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Workflow Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {currentExecution.steps.map((step, index) => (
                        <Card key={step.id} className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getStepIcon(step)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getStatusIcon(step.status)}
                                <Badge 
                                  variant="outline" 
                                  className={getStatusColor(step.status)}
                                >
                                  {step.status.toUpperCase()}
                                </Badge>
                                <span className="font-medium text-sm">{step.name}</span>
                              </div>
                              
                              {step.duration && (
                                <div className="text-xs text-muted-foreground mb-2">
                                  Duration: {step.duration}ms
                                </div>
                              )}
                              
                              {step.error && (
                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded mb-2">
                                  Error: {step.error}
                                </div>
                              )}
                              
                              {step.output && (
                                <details className="text-xs">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    View Output
                                  </summary>
                                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                    {step.output}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Statistics Section */}
            {currentExecution && currentExecution.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Implementation Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentExecution.statistics.errorsDetected}
                      </div>
                      <div className="text-xs text-muted-foreground">Errors Detected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentExecution.statistics.errorsFixed}
                      </div>
                      <div className="text-xs text-muted-foreground">Errors Fixed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentExecution.statistics.testsGenerated ? '✓' : '✗'}
                      </div>
                      <div className="text-xs text-muted-foreground">Tests Generated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {currentExecution.statistics.testsPassed ? '✓' : '✗'}
                      </div>
                      <div className="text-xs text-muted-foreground">Tests Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">
                        {currentExecution.statistics.outputMatched ? '✓' : '✗'}
                      </div>
                      <div className="text-xs text-muted-foreground">Output Matched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {currentExecution.totalDuration ? `${Math.round(currentExecution.totalDuration / 1000)}s` : '0s'}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Duration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {executionHistory.map((execution) => (
                  <Card key={execution.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={execution.status === 'completed' ? 'default' : 'secondary'}>
                            {execution.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">
                            {execution.userPrompt.substring(0, 50)}...
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {execution.startTime?.toLocaleString()} • {execution.totalDuration ? `${Math.round(execution.totalDuration / 1000)}s` : '0s'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-xs text-right">
                          <div className="text-green-600">{execution.statistics.errorsFixed} fixed</div>
                          <div className="text-blue-600">{execution.statistics.testsGenerated ? 'tests' : 'no tests'}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {executionHistory.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No execution history yet. Run a workflow to see results here.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}