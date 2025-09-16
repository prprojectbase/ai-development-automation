#!/usr/bin/env node

// Comprehensive Software Development Automation Test
// This script tests the platform's capabilities across various development scenarios

const testScenarios = [
  {
    name: 'Simple Utility Function',
    category: 'Small Scale',
    prompt: 'Create a TypeScript utility function that validates email addresses with comprehensive regex patterns and returns detailed validation results.',
    expected: 'TypeScript function with email validation'
  },
  {
    name: 'React Component',
    category: 'Small Scale', 
    prompt: 'Create a responsive React component for a user profile card that displays avatar, name, email, bio, and edit button. Use TypeScript and Tailwind CSS.',
    expected: 'React component with TypeScript'
  },
  {
    name: 'API Endpoint',
    category: 'Small Scale',
    prompt: 'Create a Node.js Express endpoint for user registration with input validation, password hashing, and proper error responses. Use TypeScript.',
    expected: 'Express API endpoint with TypeScript'
  },
  {
    name: 'CRUD Application',
    category: 'Medium Scale',
    prompt: 'Create a full-stack CRUD application for task management with React frontend, Express backend, and SQLite database. Include user authentication and task categories.',
    expected: 'Full-stack CRUD application'
  },
  {
    name: 'E-commerce Product Catalog',
    category: 'Medium Scale',
    prompt: 'Design and implement a product catalog system for an e-commerce platform with product search, filtering, pagination, and category management.',
    expected: 'E-commerce product catalog system'
  },
  {
    name: 'Real-time Chat Application',
    category: 'Medium Scale',
    prompt: 'Create a real-time chat application using Socket.IO, React, and Node.js with private messaging, online status, and message history.',
    expected: 'Real-time chat application'
  },
  {
    name: 'Microservices Architecture',
    category: 'Large Scale',
    prompt: 'Design a microservices architecture for a social media platform including user service, post service, notification service, and API gateway with service discovery and load balancing.',
    expected: 'Microservices architecture design'
  },
  {
    name: 'CI/CD Pipeline',
    category: 'Large Scale',
    prompt: 'Create a comprehensive CI/CD pipeline for a multi-container application using GitHub Actions, Docker, and Kubernetes with automated testing and deployment strategies.',
    expected: 'CI/CD pipeline configuration'
  },
  {
    name: 'Machine Learning Pipeline',
    category: 'Large Scale',
    prompt: 'Implement an end-to-end machine learning pipeline for customer churn prediction including data preprocessing, feature engineering, model training, and API deployment.',
    expected: 'Machine learning pipeline implementation'
  }
]

async function testScenario(scenario) {
  console.log(`🧪 Testing: ${scenario.name}`)
  console.log(`   Category: ${scenario.category}`)
  console.log(`   Prompt: ${scenario.prompt.substring(0, 100)}...`)
  
  const startTime = Date.now()
  
  try {
    const response = await fetch('http://localhost:3000/api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert software development assistant. Provide comprehensive, well-structured code and explanations with best practices and production-ready solutions.' 
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
      console.log(`   Content length: ${content.length} characters`)
      console.log(`   Preview: ${content.substring(0, 150)}...`)
      
      // Quality assessment
      const hasCode = content.includes('```') || content.includes('function') || content.includes('class') || content.includes('interface')
      const hasStructure = content.includes('\n\n') || content.includes('#') || content.includes('##') || content.includes('###')
      const isComprehensive = content.length > 500
      
      console.log(`   Quality Assessment:`)
      console.log(`   - Contains code: ${hasCode ? '✅' : '❌'}`)
      console.log(`   - Well structured: ${hasStructure ? '✅' : '❌'}`)
      console.log(`   - Comprehensive: ${isComprehensive ? '✅' : '❌'}`)
      
      return {
        scenario: scenario.name,
        category: scenario.category,
        status: 'success',
        duration,
        contentLength: content.length,
        quality: { hasCode, hasStructure, isComprehensive }
      }
    } else {
      console.log('❌ FAILED')
      console.log(`   Status: ${response.status}`)
      
      return {
        scenario: scenario.name,
        category: scenario.category,
        status: 'failed',
        duration
      }
    }
  } catch (error) {
    console.log('❌ ERROR')
    console.log(`   Error: ${error.message}`)
    
    return {
      scenario: scenario.name,
      category: scenario.category,
      status: 'error',
      error: error.message,
      duration
    }
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Comprehensive Software Development Automation Test')
  console.log('====================================================')
  console.log(`Testing ${testScenarios.length} scenarios across Small, Medium, and Large scale projects...\n`)
  
  const results = []
  
  // Test all scenarios
  for (const scenario of testScenarios) {
    const result = await testScenario(scenario)
    results.push(result)
    console.log('---\n')
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Generate comprehensive report
  generateReport(results)
}

function generateReport(results) {
  console.log('📊 Test Results Summary')
  console.log('========================')
  
  // Overall statistics
  const total = results.length
  const successful = results.filter(r => r.status === 'success').length
  const failed = results.filter(r => r.status === 'failed' || r.status === 'error').length
  const successRate = (successful / total * 100).toFixed(1)
  
  console.log(`Total Scenarios: ${total}`)
  console.log(`Successful: ${successful} (${successRate}%)`)
  console.log(`Failed: ${failed}`)
  console.log()
  
  // Category breakdown
  const categories = ['Small Scale', 'Medium Scale', 'Large Scale']
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category)
    const categorySuccess = categoryResults.filter(r => r.status === 'success').length
    const categoryTotal = categoryResults.length
    const categoryRate = categoryTotal > 0 ? (categorySuccess / categoryTotal * 100).toFixed(1) : 0
    
    console.log(`${category}:`)
    console.log(`  Total: ${categoryTotal}`)
    console.log(`  Successful: ${categorySuccess} (${categoryRate}%)`)
    console.log()
  })
  
  // Performance analysis
  const successfulResults = results.filter(r => r.status === 'success')
  if (successfulResults.length > 0) {
    const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length
    const avgContentLength = successfulResults.reduce((sum, r) => sum + r.contentLength, 0) / successfulResults.length
    
    console.log('📈 Performance Metrics:')
    console.log(`   Average response time: ${avgDuration.toFixed(0)}ms`)
    console.log(`   Average content length: ${avgContentLength.toFixed(0)} characters`)
    console.log()
  }
  
  // Quality analysis
  if (successfulResults.length > 0) {
    const qualityScores = successfulResults.map(r => r.quality || {})
    const codeQuality = qualityScores.filter(q => q.hasCode).length / successfulResults.length * 100
    const structureQuality = qualityScores.filter(q => q.hasStructure).length / successfulResults.length * 100
    const comprehensiveQuality = qualityScores.filter(q => q.isComprehensive).length / successfulResults.length * 100
    
    console.log('🎯 Quality Analysis:')
    console.log(`   Code quality: ${codeQuality.toFixed(1)}%`)
    console.log(`   Structure quality: ${structureQuality.toFixed(1)}%`)
    console.log(`   Comprehensive quality: ${comprehensiveQuality.toFixed(1)}%`)
    console.log()
    
    // Store for recommendations
    global.codeQuality = codeQuality
    global.structureQuality = structureQuality
    global.comprehensiveQuality = comprehensiveQuality
  }
  
  // Detailed results
  console.log('📋 Detailed Results:')
  console.log('==================')
  
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌'
    const duration = result.duration ? ` (${result.duration}ms)` : ''
    const contentLength = result.contentLength ? ` [${result.contentLength} chars]` : ''
    
    console.log(`${status} ${result.scenario} (${result.category})${duration}${contentLength}`)
    
    if (result.status === 'success' && result.quality) {
      const quality = result.quality
      const indicators = [
        quality.hasCode ? 'Code' : '',
        quality.hasStructure ? 'Structure' : '',
        quality.isComprehensive ? 'Comprehensive' : ''
      ].filter(Boolean).join(', ')
      
      if (indicators) {
        console.log(`    Quality: ${indicators}`)
      }
    }
    
    if (result.error) {
      console.log(`    Error: ${result.error}`)
    }
  })
  
  console.log()
  
  // Assessment and recommendations
  console.log('🎯 Platform Assessment:')
  console.log('=====================')
  
  if (successRate >= 80) {
    console.log('✅ Platform is performing well!')
    console.log('   The system successfully handles most software development scenarios.')
  } else if (successRate >= 60) {
    console.log('⚠️  Platform needs improvement.')
    console.log('   While functional, some scenarios are not being handled optimally.')
  } else {
    console.log('❌ Platform requires significant attention.')
    console.log('   Multiple failures indicate systemic issues that need addressing.')
  }
  
  console.log()
  console.log('🔧 Recommendations:')
  console.log('=================')
  
  const codeQuality = global.codeQuality || 0
  const structureQuality = global.structureQuality || 0
  const comprehensiveQuality = global.comprehensiveQuality || 0
  
  if (codeQuality < 80) {
    console.log('- Improve code generation quality and accuracy')
  }
  
  if (structureQuality < 80) {
    console.log('- Enhance response structure and organization')
  }
  
  if (comprehensiveQuality < 80) {
    console.log('- Provide more comprehensive and detailed solutions')
  }
  
  const avgDuration = successfulResults.length > 0 
    ? successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length
    : 0
  
  if (avgDuration > 5000) {
    console.log('- Optimize response times for better user experience')
  }
  
  console.log()
  console.log('🎉 Test completed! The platform demonstrates software development automation capabilities.')
  console.log('   Continue testing with real-world scenarios to further validate performance.')
}

// Add fetch to Node.js environment
if (!global.fetch) {
  global.fetch = require('node-fetch')
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health')
    return response.ok
  } catch (error) {
    return false
  }
}

// Main execution
async function main() {
  console.log('🧪 Software Development Automation Platform Test')
  console.log('==============================================\n')
  
  // Check if server is running
  console.log('Checking if development server is running...')
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    console.log('❌ Development server is not running on http://localhost:3000')
    console.log('Please start the server with: npm run dev')
    process.exit(1)
  }
  
  console.log('✅ Development server is running\n')
  
  // Run comprehensive test
  await runComprehensiveTest()
}

main().catch(console.error)