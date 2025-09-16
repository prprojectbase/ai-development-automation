// Test script for Chutes AI API integration
// This script tests various software development scenarios

const testScenarios = [
  {
    name: 'Simple React Component',
    description: 'Create a basic React component',
    prompt: `Create a React component for a user profile card that displays:
- User avatar
- User name
- User email
- User bio
- Edit button

The component should be responsive and use TypeScript. Include proper props interface and default props.`,
    expectedOutput: 'React component code with TypeScript',
    complexity: 'low'
  },
  {
    name: 'REST API Endpoint',
    description: 'Create a Node.js Express API endpoint',
    prompt: `Create a Node.js Express API endpoint for user management with the following features:
- GET /api/users - List all users with pagination
- GET /api/users/:id - Get user by ID
- POST /api/users - Create new user
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

Include proper error handling, validation, and TypeScript types. Use Express.js and add basic authentication middleware.`,
    expectedOutput: 'Express API endpoints with TypeScript',
    complexity: 'medium'
  },
  {
    name: 'Database Schema Design',
    description: 'Design a database schema for an e-commerce platform',
    prompt: `Design a comprehensive database schema for an e-commerce platform with the following entities:
- Users (customers and admins)
- Products with categories and variants
- Orders and order items
- Payments and transactions
- Inventory management
- Reviews and ratings

Include proper relationships, indexes, and constraints. Provide SQL schema for PostgreSQL.`,
    expectedOutput: 'Database schema with SQL',
    complexity: 'medium'
  },
  {
    name: 'Full Stack Application',
    description: 'Create a full-stack TODO application',
    prompt: `Create a full-stack TODO application with:
Frontend (React/Next.js):
- Task list with CRUD operations
- Drag and drop reordering
- Categories and filters
- Local storage persistence
- Responsive design

Backend (Node.js/Express):
- REST API for tasks
- User authentication
- Data validation
- Error handling

Include setup instructions and deployment considerations. Use TypeScript throughout.`,
    expectedOutput: 'Full-stack application code',
    complexity: 'high'
  },
  {
    name: 'Microservices Architecture',
    description: 'Design a microservices architecture for a social media platform',
    prompt: `Design a microservices architecture for a social media platform with the following services:
- User service (authentication, profiles)
- Post service (content creation, feeds)
- Media service (image/video upload, processing)
- Notification service (real-time notifications)
- Analytics service (user behavior, metrics)
- Search service (content search)

Include:
- Service communication patterns (REST, gRPC, message queues)
- Database design per service
- API Gateway configuration
- Containerization with Docker
- Scaling and monitoring strategies
- Security considerations

Provide architecture diagram and implementation guidelines.`,
    expectedOutput: 'Microservices architecture design',
    complexity: 'high'
  },
  {
    name: 'Machine Learning Pipeline',
    description: 'Create a ML pipeline for sentiment analysis',
    prompt: `Create a machine learning pipeline for sentiment analysis with the following components:
1. Data collection and preprocessing
2. Feature extraction and engineering
3. Model training and evaluation
4. API deployment for real-time predictions
5. Monitoring and retraining pipeline

Include:
- Python code using scikit-learn/TensorFlow
- Data preprocessing steps
- Model evaluation metrics
- FastAPI endpoint for predictions
- Docker containerization
- CI/CD pipeline setup

Provide complete implementation with best practices.`,
    expectedOutput: 'ML pipeline implementation',
    complexity: 'high'
  }
]

async function testChutesAI() {
  console.log('🚀 Testing Chutes AI API Integration')
  console.log('=====================================\n')

  const results = []

  for (const scenario of testScenarios) {
    console.log(`📋 Testing: ${scenario.name}`)
    console.log(`   Description: ${scenario.description}`)
    console.log(`   Complexity: ${scenario.complexity}`)
    console.log(`   Expected: ${scenario.expectedOutput}`)
    console.log('   Prompt:')
    console.log(`   ${scenario.prompt.substring(0, 100)}...`)
    console.log()

    try {
      const startTime = Date.now()
      
      const response = await fetch('http://localhost:3000/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert software development assistant. Provide comprehensive, well-structured code and explanations. Include best practices, error handling, and production-ready solutions.' 
            },
            { role: 'user', content: scenario.prompt }
          ],
          model: 'gpt-4',
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      if (response.ok) {
        const data = await response.json()
        const content = data.choices[0]?.message?.content || ''
        
        console.log('✅ SUCCESS')
        console.log(`   Response time: ${duration}ms`)
        console.log(`   Tokens used: ${data.usage?.total_tokens || 'N/A'}`)
        console.log(`   Content length: ${content.length} characters`)
        console.log(`   Preview: ${content.substring(0, 200)}...`)
        
        // Basic quality checks
        const hasCode = content.includes('```') || content.includes('function') || content.includes('class')
        const hasExplanation = content.length > 500
        const isStructured = content.includes('\n\n') || content.includes('#') || content.includes('##')
        
        console.log(`   Quality checks:`)
        console.log(`   - Contains code: ${hasCode ? '✅' : '❌'}`)
        console.log(`   - Has explanation: ${hasExplanation ? '✅' : '❌'}`)
        console.log(`   - Well structured: ${isStructured ? '✅' : '❌'}`)
        
        results.push({
          scenario: scenario.name,
          status: 'success',
          duration,
          tokens: data.usage?.total_tokens || 0,
          contentLength: content.length,
          quality: { hasCode, hasExplanation, isStructured }
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log('❌ FAILED')
        console.log(`   Status: ${response.status}`)
        console.log(`   Error: ${errorData.error?.message || 'Unknown error'}`)
        
        results.push({
          scenario: scenario.name,
          status: 'failed',
          error: errorData.error?.message || 'Unknown error',
          duration
        })
      }
    } catch (error) {
      console.log('❌ ERROR')
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      results.push({
        scenario: scenario.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    console.log('---\n')
  }

  // Summary
  console.log('📊 Test Summary')
  console.log('===============')
  
  const successful = results.filter(r => r.status === 'success')
  const failed = results.filter(r => r.status === 'failed' || r.status === 'error')
  
  console.log(`Total tests: ${results.length}`)
  console.log(`Successful: ${successful.length}`)
  console.log(`Failed: ${failed.length}`)
  console.log()
  
  if (successful.length > 0) {
    console.log('✅ Successful Tests:')
    successful.forEach(result => {
      console.log(`   - ${result.scenario} (${result.duration}ms, ${result.tokens} tokens)`)
    })
    console.log()
  }
  
  if (failed.length > 0) {
    console.log('❌ Failed Tests:')
    failed.forEach(result => {
      console.log(`   - ${result.scenario}: ${result.error || 'Unknown error'}`)
    })
    console.log()
  }
  
  // Performance analysis
  if (successful.length > 0) {
    const avgDuration = successful.reduce((sum, r) => sum + (r.duration || 0), 0) / successful.length
    const avgTokens = successful.reduce((sum, r) => sum + (r.tokens || 0), 0) / successful.length
    
    console.log('📈 Performance Metrics:')
    console.log(`   Average response time: ${avgDuration.toFixed(0)}ms`)
    console.log(`   Average tokens used: ${avgTokens.toFixed(0)}`)
    console.log()
  }
  
  // Quality analysis
  if (successful.length > 0) {
    const qualityScores = successful.map(r => r.quality || {})
    const codeQuality = qualityScores.filter(q => q.hasCode).length / successful.length * 100
    const explanationQuality = qualityScores.filter(q => q.hasExplanation).length / successful.length * 100
    const structureQuality = qualityScores.filter(q => q.isStructured).length / successful.length * 100
    
    console.log('🎯 Quality Analysis:')
    console.log(`   Code quality: ${codeQuality.toFixed(0)}%`)
    console.log(`   Explanation quality: ${explanationQuality.toFixed(0)}%`)
    console.log(`   Structure quality: ${structureQuality.toFixed(0)}%`)
    console.log()
  }
  
  console.log('🎉 Test completed!')
}

// Run the test
testChutesAI().catch(console.error)