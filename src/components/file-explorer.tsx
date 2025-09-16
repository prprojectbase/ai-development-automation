'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Folder, 
  File, 
  Plus, 
  Search, 
  MoreVertical,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FileItem {
  id: string
  name: string
  type: 'folder' | 'file'
  content?: string
  children?: FileItem[]
}

interface FileExplorerProps {
  files: FileItem[]
  onFilesChange: (files: FileItem[]) => void
}

export function FileExplorer({ files, onFilesChange }: FileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const createFile = (parentId?: string) => {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: 'new-file.txt',
      type: 'file',
      content: ''
    }

    if (parentId) {
      const updateFiles = (items: FileItem[]): FileItem[] => 
        items.map(item => 
          item.id === parentId 
            ? { ...item, children: [...(item.children || []), newFile] }
            : item.children 
              ? { ...item, children: updateFiles(item.children) }
              : item
        )
      onFilesChange(updateFiles(files))
    } else {
      onFilesChange([...files, newFile])
    }
  }

  const createFolder = (parentId?: string) => {
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: 'new-folder',
      type: 'folder',
      children: []
    }

    if (parentId) {
      const updateFiles = (items: FileItem[]): FileItem[] => 
        items.map(item => 
          item.id === parentId 
            ? { ...item, children: [...(item.children || []), newFolder] }
            : item.children 
              ? { ...item, children: updateFiles(item.children) }
              : item
        )
      onFilesChange(updateFiles(files))
    } else {
      onFilesChange([...files, newFolder])
    }
  }

  const deleteItem = (itemId: string, parentId?: string) => {
    if (parentId) {
      const updateFiles = (items: FileItem[]): FileItem[] => 
        items.map(item => 
          item.id === parentId 
            ? { ...item, children: (item.children || []).filter(child => child.id !== itemId) }
            : item.children 
              ? { ...item, children: updateFiles(item.children) }
              : item
        )
      onFilesChange(updateFiles(files))
    } else {
      onFilesChange(files.filter(item => item.id !== itemId))
    }
  }

  const filterFiles = (items: FileItem[]): FileItem[] => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const renderFileTree = (items: FileItem[], parentId?: string, level = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <div 
          className={`flex items-center gap-2 p-2 hover:bg-muted cursor-pointer rounded-sm ${
            level > 0 ? 'ml-4' : ''
          }`}
          onClick={() => item.type === 'folder' && toggleFolder(item.id)}
        >
          {item.type === 'folder' && (
            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
              {expandedFolders.has(item.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          
          {item.type === 'folder' ? (
            <Folder className="h-4 w-4 text-blue-500" />
          ) : (
            <File className="h-4 w-4 text-gray-500" />
          )}
          
          <span className="text-sm flex-1">{item.name}</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => createFile(item.id)}>
                <File className="h-3 w-3 mr-2" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => createFolder(item.id)}>
                <Folder className="h-3 w-3 mr-2" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteItem(item.id, parentId)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {item.type === 'folder' && 
         expandedFolders.has(item.id) && 
         item.children && 
         renderFileTree(item.children, item.id, level + 1)}
      </div>
    ))
  }

  const filteredFiles = filterFiles(files)

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">File Explorer</h2>
        
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => createFile()}
            className="flex-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            File
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => createFolder()}
            className="flex-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            Folder
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredFiles.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No files found
            </div>
          ) : (
            renderFileTree(filteredFiles)
          )}
        </div>
      </ScrollArea>
    </div>
  )
}