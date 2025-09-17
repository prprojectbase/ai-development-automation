// Shared sandbox storage for the application
export const sandboxes = new Map<string, any>()

// Sandbox interface
export interface Sandbox {
  id: string
  name: string
  type: 'node' | 'python' | 'bash' | 'docker'
  status: 'creating' | 'running' | 'stopped' | 'error'
  created: Date
  lastAccessed: Date
  files: { path: string; content: string }[]
  environment: Record<string, string>
  port?: number
}