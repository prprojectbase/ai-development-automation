'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface User {
  id: string
  name: string
  avatar?: string
  currentProject?: string
}

interface SocketMessage {
  type: string
  data: any
  timestamp: Date
}

export function useSocket(url: string = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001') {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [projectUsers, setProjectUsers] = useState<{ projectId: string; users: User[] } | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (socketRef.current) return

    const socket = io(url, {
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to socket server')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from socket server')
    })

    // Authentication events
    socket.on('authenticated', (data) => {
      if (data.success) {
        setUser(data.user)
      }
    })

    // User management events
    socket.on('user_joined', (data) => {
      setActiveUsers(prev => [...prev, data.user])
    })

    socket.on('user_left', (data) => {
      setActiveUsers(prev => prev.filter(u => u.id !== data.user.id))
    })

    // Project collaboration events
    socket.on('user_joined_project', (data) => {
      // Update project users if we're in the same project
      if (projectUsers && projectUsers.projectId === data.projectId) {
        setProjectUsers({
          projectId: data.projectId,
          users: [...projectUsers.users, data.user]
        })
      }
    })

    socket.on('user_left_project', (data) => {
      // Update project users if we're in the same project
      if (projectUsers && projectUsers.projectId === data.projectId) {
        setProjectUsers({
          projectId: data.projectId,
          users: projectUsers.users.filter(u => u.id !== data.user.id)
        })
      }
    })

    socket.on('project_users', (data) => {
      setProjectUsers(data)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [url])

  // Authentication
  const authenticate = (userData: Omit<User, 'id'>) => {
    if (socketRef.current) {
      socketRef.current.emit('authenticate', userData)
    }
  }

  // Project room management
  const joinProject = (projectId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_project', projectId)
    }
  }

  const leaveProject = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_project')
    }
    setProjectUsers(null)
  }

  const getProjectUsers = (projectId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('get_project_users', projectId)
    }
  }

  // Collaboration events
  const sendCollaboration = (message: {
    type: 'chat' | 'file' | 'sandbox' | 'agent' | 'workflow' | 'project' | 'user'
    action: 'create' | 'update' | 'delete' | 'execute' | 'join' | 'leave'
    data: any
    projectId?: string
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('collaboration', message)
    }
  }

  // Chat functionality
  const sendChatMessage = (data: {
    chatId: string
    message: string
    projectId?: string
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('chat_message', data)
    }
  }

  const sendTyping = (data: {
    chatId: string
    isTyping: boolean
    projectId?: string
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', data)
    }
  }

  // File collaboration
  const sendFileChange = (data: {
    projectId: string
    filePath: string
    content: string
    action: 'create' | 'update' | 'delete'
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('file_change', data)
    }
  }

  const sendCursorUpdate = (data: {
    fileId: string
    position: number
    selection?: any
    projectId?: string
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('cursor_update', data)
    }
  }

  // Execution updates
  const sendSandboxExecution = (data: {
    sandboxId: string
    status: string
    output?: string
    error?: string
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('sandbox_execution', data)
    }
  }

  const sendAgentExecution = (data: {
    agentId: string
    status: string
    output?: string
    error?: string
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('agent_execution', data)
    }
  }

  const sendWorkflowExecution = (data: {
    workflowId: string
    status: string
    currentStep?: string
    results?: any
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('workflow_execution', data)
    }
  }

  // Project updates
  const sendProjectUpdate = (data: {
    projectId: string
    action: string
    data: any
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('project_update', data)
    }
  }

  // Event listeners for components
  const onCollaboration = (callback: (message: SocketMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on('collaboration', (message) => {
        callback({
          type: message.type,
          data: message.data,
          timestamp: new Date(message.timestamp)
        })
      })
    }
  }

  const onChatMessage = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('chat_message', callback)
    }
  }

  const onTyping = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('typing', callback)
    }
  }

  const onFileChange = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('file_change', callback)
    }
  }

  const onCursorUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('cursor_update', callback)
    }
  }

  const onSandboxExecution = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('sandbox_execution', callback)
    }
  }

  const onAgentExecution = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('agent_execution', callback)
    }
  }

  const onWorkflowExecution = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('workflow_execution', callback)
    }
  }

  const onProjectUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('project_update', callback)
    }
  }

  // Remove event listeners
  const offCollaboration = () => {
    if (socketRef.current) {
      socketRef.current.off('collaboration')
    }
  }

  const offChatMessage = () => {
    if (socketRef.current) {
      socketRef.current.off('chat_message')
    }
  }

  const offTyping = () => {
    if (socketRef.current) {
      socketRef.current.off('typing')
    }
  }

  const offFileChange = () => {
    if (socketRef.current) {
      socketRef.current.off('file_change')
    }
  }

  const offCursorUpdate = () => {
    if (socketRef.current) {
      socketRef.current.off('cursor_update')
    }
  }

  const offSandboxExecution = () => {
    if (socketRef.current) {
      socketRef.current.off('sandbox_execution')
    }
  }

  const offAgentExecution = () => {
    if (socketRef.current) {
      socketRef.current.off('agent_execution')
    }
  }

  const offWorkflowExecution = () => {
    if (socketRef.current) {
      socketRef.current.off('workflow_execution')
    }
  }

  const offProjectUpdate = () => {
    if (socketRef.current) {
      socketRef.current.off('project_update')
    }
  }

  return {
    isConnected,
    user,
    activeUsers,
    projectUsers,
    authenticate,
    joinProject,
    leaveProject,
    getProjectUsers,
    sendCollaboration,
    sendChatMessage,
    sendTyping,
    sendFileChange,
    sendCursorUpdate,
    sendSandboxExecution,
    sendAgentExecution,
    sendWorkflowExecution,
    sendProjectUpdate,
    onCollaboration,
    onChatMessage,
    onTyping,
    onFileChange,
    onCursorUpdate,
    onSandboxExecution,
    onAgentExecution,
    onWorkflowExecution,
    onProjectUpdate,
    offCollaboration,
    offChatMessage,
    offTyping,
    offFileChange,
    offCursorUpdate,
    offSandboxExecution,
    offAgentExecution,
    offWorkflowExecution,
    offProjectUpdate
  }
}