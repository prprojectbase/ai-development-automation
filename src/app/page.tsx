'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { FileExplorer } from "@/components/file-explorer"
import { ChatInterface } from "@/components/chat-interface"
import { PreviewPanel } from "@/components/preview-panel"
import { useState } from "react"

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
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <FileExplorer files={files} onFilesChange={setFiles} />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Chat Interface Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <ChatInterface 
            messages={messages} 
            onMessagesChange={setMessages}
            onPreviewUpdate={setPreviewContent}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Preview Panel */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <PreviewPanel content={previewContent} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}