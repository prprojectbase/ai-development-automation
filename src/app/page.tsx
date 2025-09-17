'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { FileExplorer } from "@/components/file-explorer"
import { ChatInterface } from "@/components/chat-interface"
import { PreviewPanel } from "@/components/preview-panel"
import { AgentManager } from "@/components/agent-manager"
import { AutomationManager } from "@/components/automation-manager"
import { TestAutomationWorkflow } from "@/components/test-automation-workflow"
import { SandboxManager } from "@/components/sandbox-manager"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [files, setFiles] = useState([
    {
      id: "1",
      name: "src",
      type: "folder",
      children: [
        { id: "2", name: "app", type: "folder", children: [] },
        { id: "3", name: "components", type: "folder", children: [] },
        { id: "4", name: "lib", type: "folder", children: [] },
      ]
    },
    {
      id: "5",
      name: "package.json",
      type: "file",
      content: "{}"
    },
    {
      id: "6",
      name: "README.md",
      type: "file",
      content: "# Project"
    }
  ])

  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI development assistant. How can I help you automate your software development today?"
    }
  ])

  const [previewContent, setPreviewContent] = useState("Welcome to the preview panel")

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* File Explorer Panel */}
        <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
          <FileExplorer files={files} onFilesChange={setFiles} />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Main Content Panel */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold">AI Development Automation Platform</h1>
              <p className="text-sm text-muted-foreground">Automated software development with AI agents and workflows</p>
            </div>
            
            <div className="flex-1 p-4">
              <Tabs defaultValue="chat" className="h-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="test-automation">Test Automation</TabsTrigger>
                  <TabsTrigger value="agents">AI Agents</TabsTrigger>
                  <TabsTrigger value="workflows">Workflows</TabsTrigger>
                  <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="mt-4 h-[calc(100%-3rem)]">
                  <ChatInterface 
                    messages={messages} 
                    onMessagesChange={setMessages}
                    onPreviewUpdate={setPreviewContent}
                  />
                </TabsContent>
                
                <TabsContent value="test-automation" className="mt-4 h-[calc(100%-3rem)]">
                  <TestAutomationWorkflow />
                </TabsContent>
                
                <TabsContent value="agents" className="mt-4 h-[calc(100%-3rem)]">
                  <AgentManager />
                </TabsContent>
                
                <TabsContent value="workflows" className="mt-4 h-[calc(100%-3rem)]">
                  <AutomationManager />
                </TabsContent>
                
                <TabsContent value="sandbox" className="mt-4 h-[calc(100%-3rem)]">
                  <SandboxManager />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Preview Panel */}
        <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>
          <PreviewPanel content={previewContent} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}