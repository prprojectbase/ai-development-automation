import { Server } from 'socket.io';

interface User {
  id: string;
  name: string;
  avatar?: string;
  currentProject?: string;
  currentRoom?: string;
}

interface CollaborationMessage {
  type: 'chat' | 'file' | 'sandbox' | 'agent' | 'workflow' | 'project' | 'user';
  action: 'create' | 'update' | 'delete' | 'execute' | 'join' | 'leave';
  data: any;
  projectId?: string;
  userId: string;
  timestamp: Date;
}

// Store active users and rooms
const activeUsers = new Map<string, User>();
const projectRooms = new Map<string, Set<string>>();

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', (user: User) => {
      activeUsers.set(socket.id, { ...user, id: socket.id });
      socket.emit('authenticated', { success: true, user: { ...user, id: socket.id } });
      
      // Broadcast user joined
      io.emit('user_joined', {
        user: { ...user, id: socket.id },
        timestamp: new Date()
      });
    });

    // Join project room
    socket.on('join_project', (projectId: string) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      // Leave previous project room
      if (user.currentProject) {
        socket.leave(`project:${user.currentProject}`);
        const prevRoom = projectRooms.get(user.currentProject);
        if (prevRoom) {
          prevRoom.delete(socket.id);
          if (prevRoom.size === 0) {
            projectRooms.delete(user.currentProject);
          }
        }
      }

      // Join new project room
      socket.join(`project:${projectId}`);
      user.currentProject = projectId;
      activeUsers.set(socket.id, user);

      // Add to project room
      if (!projectRooms.has(projectId)) {
        projectRooms.set(projectId, new Set());
      }
      projectRooms.get(projectId)!.add(socket.id);

      // Notify room members
      socket.to(`project:${projectId}`).emit('user_joined_project', {
        user,
        projectId,
        timestamp: new Date()
      });

      // Send current room users
      const roomUsers = Array.from(projectRooms.get(projectId) || [])
        .map(id => activeUsers.get(id))
        .filter(Boolean);
      socket.emit('project_users', { projectId, users: roomUsers });
    });

    // Leave project room
    socket.on('leave_project', () => {
      const user = activeUsers.get(socket.id);
      if (!user || !user.currentProject) return;

      socket.leave(`project:${user.currentProject}`);
      const room = projectRooms.get(user.currentProject);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
          projectRooms.delete(user.currentProject);
        }
      }

      // Notify room members
      socket.to(`project:${user.currentProject}`).emit('user_left_project', {
        user,
        projectId: user.currentProject,
        timestamp: new Date()
      });

      user.currentProject = undefined;
      activeUsers.set(socket.id, user);
    });

    // Handle collaboration messages
    socket.on('collaboration', (message: CollaborationMessage) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const enhancedMessage: CollaborationMessage = {
        ...message,
        userId: socket.id,
        timestamp: new Date()
      };

      // Broadcast to project room if specified
      if (message.projectId) {
        socket.to(`project:${message.projectId}`).emit('collaboration', enhancedMessage);
      } else {
        // Broadcast to all clients
        socket.broadcast.emit('collaboration', enhancedMessage);
      }

      // Echo back to sender
      socket.emit('collaboration_ack', {
        messageId: `${socket.id}_${Date.now()}`,
        timestamp: new Date()
      });
    });

    // Real-time chat messages
    socket.on('chat_message', (data: { chatId: string; message: string; projectId?: string }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        chatId: data.chatId,
        message: data.message,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        timestamp: new Date()
      };

      // Broadcast to project room or specific chat
      if (data.projectId) {
        io.to(`project:${data.projectId}`).emit('chat_message', messageData);
      } else {
        io.emit('chat_message', messageData);
      }
    });

    // File collaboration events
    socket.on('file_change', (data: { projectId: string; filePath: string; content: string; action: 'create' | 'update' | 'delete' }) => {
      const user = activeUsers.get(socket.id);
      if (!user || !data.projectId) return;

      const fileData = {
        ...data,
        user: {
          id: user.id,
          name: user.name
        },
        timestamp: new Date()
      };

      socket.to(`project:${data.projectId}`).emit('file_change', fileData);
    });

    // Sandbox execution updates
    socket.on('sandbox_execution', (data: { sandboxId: string; status: string; output?: string; error?: string }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const executionData = {
        ...data,
        user: {
          id: user.id,
          name: user.name
        },
        timestamp: new Date()
      };

      // Broadcast to all clients interested in sandbox updates
      io.emit('sandbox_execution', executionData);
    });

    // Agent execution updates
    socket.on('agent_execution', (data: { agentId: string; status: string; output?: string; error?: string }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const executionData = {
        ...data,
        user: {
          id: user.id,
          name: user.name
        },
        timestamp: new Date()
      };

      // Broadcast to all clients interested in agent updates
      io.emit('agent_execution', executionData);
    });

    // Workflow execution updates
    socket.on('workflow_execution', (data: { workflowId: string; status: string; currentStep?: string; results?: any }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const executionData = {
        ...data,
        user: {
          id: user.id,
          name: user.name
        },
        timestamp: new Date()
      };

      // Broadcast to all clients interested in workflow updates
      io.emit('workflow_execution', executionData);
    });

    // Project updates
    socket.on('project_update', (data: { projectId: string; action: string; data: any }) => {
      const user = activeUsers.get(socket.id);
      if (!user || !data.projectId) return;

      const projectData = {
        ...data,
        user: {
          id: user.id,
          name: user.name
        },
        timestamp: new Date()
      };

      socket.to(`project:${data.projectId}`).emit('project_update', projectData);
    });

    // Request active users for a project
    socket.on('get_project_users', (projectId: string) => {
      const roomUsers = Array.from(projectRooms.get(projectId) || [])
        .map(id => activeUsers.get(id))
        .filter(Boolean);
      
      socket.emit('project_users', { projectId, users: roomUsers });
    });

    // Handle typing indicators
    socket.on('typing', (data: { chatId: string; isTyping: boolean; projectId?: string }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const typingData = {
        chatId: data.chatId,
        user: {
          id: user.id,
          name: user.name
        },
        isTyping: data.isTyping,
        timestamp: new Date()
      };

      if (data.projectId) {
        socket.to(`project:${data.projectId}`).emit('typing', typingData);
      } else {
        socket.broadcast.emit('typing', typingData);
      }
    });

    // Handle cursor position for collaborative editing
    socket.on('cursor_update', (data: { fileId: string; position: number; selection?: any; projectId?: string }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const cursorData = {
        ...data,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        timestamp: new Date()
      };

      if (data.projectId) {
        socket.to(`project:${data.projectId}`).emit('cursor_update', cursorData);
      } else {
        socket.broadcast.emit('cursor_update', cursorData);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      const user = activeUsers.get(socket.id);
      if (user) {
        // Remove from project rooms
        if (user.currentProject) {
          const room = projectRooms.get(user.currentProject);
          if (room) {
            room.delete(socket.id);
            if (room.size === 0) {
              projectRooms.delete(user.currentProject);
            }
          }

          // Notify room members
          socket.to(`project:${user.currentProject}`).emit('user_left_project', {
            user,
            projectId: user.currentProject,
            timestamp: new Date()
          });
        }

        // Remove from active users
        activeUsers.delete(socket.id);

        // Broadcast user left
        io.emit('user_left', {
          user,
          timestamp: new Date()
        });
      }
    });

    // Send initial connection message
    socket.emit('connected', {
      socketId: socket.id,
      timestamp: new Date(),
      message: 'Connected to collaboration server'
    });
  });
};