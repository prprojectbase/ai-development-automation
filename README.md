# AI Development Automation Platform

A comprehensive web application for automating software development tasks using AI. Built with Next.js, TypeScript, and integrated with Chutes AI API.

## Features

### 🤖 AI-Powered Development
- **Chat Interface**: Conversational AI assistant with multiple model support
- **Code Generation**: Generate code snippets, components, and full applications
- **Code Review**: Automated code analysis and improvement suggestions
- **Documentation**: Generate comprehensive documentation automatically

### 📁 File Management
- **File Explorer**: Tree-view file browser with CRUD operations
- **Real-time Updates**: Live file synchronization
- **Multi-format Support**: Handle various file types and formats
- **Search & Filter**: Quick file search and filtering capabilities

### 🧪 Sandbox Environment
- **Isolated Environments**: Create and manage development sandboxes
- **Multiple Runtimes**: Support for Node.js, Python, Bash, and Docker
- **Code Execution**: Run and test code in safe environments
- **Resource Management**: Monitor and control sandbox resources

### 🤖 AI Agents
- **Specialized Agents**: Pre-configured agents for specific tasks
- **Tool Integration**: Agents with access to various development tools
- **Custom Agents**: Create and configure custom AI agents
- **Execution History**: Track agent performance and results

### ⚡ Automation Workflows
- **Visual Workflow Builder**: Drag-and-drop workflow creation
- **Pre-built Templates**: Ready-to-use automation templates
- **Trigger System**: Manual, scheduled, and event-based triggers
- **Monitoring**: Real-time workflow execution monitoring

### 📊 Preview & Testing
- **Live Preview**: Real-time output preview
- **Terminal Integration**: Built-in terminal for command execution
- **Testing Framework**: Automated testing and validation
- **Deployment Options**: One-click deployment to various platforms

## Technology Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **Zustand** for state management

### Backend
- **Next.js API Routes** for serverless functions
- **Prisma ORM** with SQLite database
- **Socket.IO** for real-time communication
- **Chutes AI API** for AI capabilities

### Development Tools
- **ESLint** for code quality
- **Prettier** for code formatting
- **Husky** for git hooks
- **GitHub Actions** for CI/CD

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prprojectbase/ai-development-automation.git
   cd ai-development-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Chutes AI API key:
   ```env
   CHUTES_API_KEY=your_api_key_here
   DATABASE_URL="file:./dev.db"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available AI Models

The platform supports multiple AI models through Chutes AI:

- **DeepSeek V3.1** - Advanced reasoning and coding
- **LongCat Flash** - Fast and efficient general tasks
- **Qwen3 235B** - Large model with thinking capabilities
- **Qwen3 Coder 480B** - Specialized for programming
- **Qwen3 Next 80B** - Advanced thinking model
- **K2 Think** - Optimized for complex reasoning
- **GLM 4.5** - General language model
- **GPT OSS 120B** - Open source GPT variant
- **Hermes 4 405B** - Instruction following
- **DeepSeek R1** - Reasoning optimized
- **Kimi K2** - Strong instruction performance
- **OpenHands LM 32B** - Agent task optimization
- **UIGEN X 32B** - UI generation specialized

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # Chat completions
│   │   ├── models/        # Model management
│   │   ├── sandbox/       # Sandbox operations
│   │   └── tools/         # Tool execution
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── agent-manager.tsx  # AI agent management
│   ├── automation-manager.tsx # Workflow automation
│   ├── chat-interface.tsx # Chat interface
│   ├── file-explorer.tsx  # File browser
│   ├── preview-panel.tsx  # Output preview
│   └── sandbox-manager.tsx # Sandbox management
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── db.ts            # Database client
│   ├── socket.ts        # WebSocket setup
│   └── utils.ts         # Helper functions
└── prisma/               # Database schema
```

## API Endpoints

### Chat Completions
```
POST /api/chat/completions
```
OpenAI-compatible chat completions endpoint with Chutes AI integration.

### Models
```
GET /api/models
```
List available AI models.

### Sandbox Management
```
POST /api/sandbox          # Create sandbox
GET /api/sandbox           # List sandboxes
PUT /api/sandbox/[id]      # Update sandbox
DELETE /api/sandbox/[id]   # Delete sandbox
POST /api/sandbox/[id]/execute  # Execute code in sandbox
```

### Tools
```
POST /api/tools            # Execute tools
GET /api/tools             # List available tools
```

## Testing

### Quick Test
```bash
node test-chutes-comprehensive.js --quick
```

### Comprehensive Test
```bash
node test-chutes-comprehensive.js
```

### Development Scenarios
```bash
node test-software-development.js
```

## Usage Examples

### Basic Chat
```javascript
const response = await fetch('/api/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Create a React component for a button' }
    ],
    model: 'qwen3-coder-480b',
    temperature: 0.7
  })
})
```

### Create Sandbox
```javascript
const sandbox = await fetch('/api/sandbox', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Development Sandbox',
    type: 'node'
  })
})
```

### Execute Code
```javascript
const result = await fetch(`/api/sandbox/${sandboxId}/execute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'console.log("Hello, World!")',
    language: 'javascript'
  })
})
```

## Configuration

### Environment Variables
- `CHUTES_API_KEY` - Chutes AI API key
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - NextAuth secret (for authentication)
- `NEXTAUTH_URL` - NextAuth URL

### Customization
- Edit `prisma/schema.prisma` to modify database structure
- Update `src/components/ui/` to customize UI components
- Modify `src/lib/` to add utility functions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- **Chutes AI** for providing the AI API
- **Next.js** team for the excellent framework
- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework

---

Built with ❤️ using AI and modern web technologies.