#!/usr/bin/env node

// Comprehensive test script for Chutes AI integration
// Tests multiple models and various software development scenarios

const models = [
  'deepseek-ai/DeepSeek-V3.1',
  'meituan-longcat/LongCat-Flash-Chat-FP8',
  'Qwen/Qwen3-235B-A22B-Thinking-2507',
  'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8',
  'Qwen/Qwen3-Next-80B-A3B-Thinking',
  'zai-org/GLM-4.5-FP8',
  'openai/gpt-oss-120b',
  'NousResearch/Hermes-4-405B-FP8',
  'deepseek-ai/DeepSeek-R1-0528',
  'moonshotai/Kimi-K2-Instruct-0905',
  'all-hands/openhands-lm-32b-v0.1-ep3',
  'Tesslate/UIGEN-X-32B-0727'
]

const testScenarios = [
  {
    category: 'Small Scale',
    scenarios: [
      {
        name: 'Hello World',
        prompt: 'Create a simple "Hello World" program in JavaScript',
        complexity: 'low',
        expectedTokens: 200
      },
      {
        name: 'React Component',
        prompt: 'Create a React button component with TypeScript that handles click events',
        complexity: 'low',
        expectedTokens: 400
      },
      {
        name: 'API Endpoint',
        prompt: 'Create a simple Express.js GET endpoint that returns a JSON response',
        complexity: 'low',
        expectedTokens: 300
      }
    ]
  },
  {
    category: 'Medium Scale',
    scenarios: [
      {
        name: 'CRUD Application',
        prompt: 'Create a basic CRUD API for managing tasks with Express.js and include input validation',
        complexity: 'medium',
        expectedTokens: 800
      },
      {
        name: 'Database Schema',
        prompt: 'Design a database schema for a blog platform with users, posts, and comments',
        complexity: 'medium',
        expectedTokens: 600
      },
      {
        name: 'Authentication System',
        prompt: 'Implement JWT-based authentication for a Node.js application with middleware',
        complexity: 'medium',
        expectedTokens: 700
      }
    ]
  },
  {
    category: 'Large Scale',
    scenarios: [
      {
        name: 'Microservices Architecture',
        prompt: 'Design a microservices architecture for an e-commerce platform with service communication patterns',
        complexity: 'high',
        expectedTokens: 1500
      },
      {
        name: 'CI/CD Pipeline',
        prompt: 'Create a comprehensive CI/CD pipeline using GitHub Actions for a containerized application',
        complexity: 'high',
        expectedTokens: 1200
      },
      {
        name: 'Machine Learning Pipeline',
        prompt: 'Design an end-to-end machine learning pipeline for data preprocessing and model deployment',
        complexity: 'high',
        expectedTokens: 1400
      }
    ]
  }
]

class ChutesAITester {
  constructor() {
    this.baseUrl = 'http://localhost:3000'
    this.results = []
    this.totalTests = 0
    this.successfulTests = 0
    this.failedTests = 0
  }

  async makeRequest(messages, model = 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8', maxTokens = 1000) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model,
          temperature: 0.7,
          max_tokens: maxTokens
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`)
    }
  }

  async testModel(model, scenario) {
    const startTime = Date.now()
    
    try {
      const messages = [
        { 
          role: 'system', 
          content: 'You are an expert software development assistant. Provide comprehensive, well-structured code and explanations.' 
        },
        { role: 'user', content: scenario.prompt }
      ]

      const data = await this.makeRequest(messages, model, scenario.expectedTokens)
      const endTime = Date.now()
      const duration = endTime - startTime

      const content = data.choices[0]?.message?.content || ''
      const tokensUsed = data.usage?.total_tokens || 0

      // Quality assessment
      const hasCode = this.containsCode(content)
      const hasExplanation = content.length > 200
      const isStructured = this.isWellStructured(content)

      return {
        model,
        scenario: scenario.name,
        category: scenario.category,
        complexity: scenario.complexity,
        status: 'success',
        duration,
        tokensUsed,
        contentLength: content.length,
        quality: { hasCode, hasExplanation, isStructured },
        preview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
      }
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime

      return {
        model,
        scenario: scenario.name,
        category: scenario.category,
        complexity: scenario.complexity,
        status: 'failed',
        duration,
        error: error.message
      }
    }
  }

  containsCode(content) {
    const codeIndicators = [
      '```', 'function', 'class', 'const', 'let', 'var', 'import', 'export',
      'def ', 'async ', 'await ', 'try {', 'catch (', 'if (', 'for (', 'while ('
    ]
    return codeIndicators.some(indicator => content.includes(indicator))
  }

  isWellStructured(content) {
    const structureIndicators = [
      '\n\n', '# ', '## ', '### ', '1.', '2.', '3.', '- ', '* ', '```'
    ]
    return structureIndicators.some(indicator => content.includes(indicator))
  }

  async runComprehensiveTests() {
    console.log('🚀 Comprehensive Chutes AI Integration Test')
    console.log('=============================================\n')

    // Test each model with each scenario
    for (const model of models) {
      console.log(`📋 Testing Model: ${model}`)
      console.log(''.padEnd(50, '-'))

      for (const category of testScenarios) {
        console.log(`\n   Category: ${category.category}`)
        
        for (const scenario of category.scenarios) {
          process.stdout.write(`   Testing ${scenario.name}... `)
          
          const result = await this.testModel(model, scenario)
          this.results.push(result)
          this.totalTests++

          if (result.status === 'success') {
            this.successfulTests++
            console.log('✅')
          } else {
            this.failedTests++
            console.log('❌')
          }
        }
      }
      
      console.log('\n' + ''.padEnd(50, '-'))
    }

    // Generate comprehensive report
    this.generateReport()
  }

  generateReport() {
    console.log('\n📊 Comprehensive Test Report')
    console.log('============================\n')

    // Overall statistics
    console.log('📈 Overall Statistics:')
    console.log(`   Total Tests: ${this.totalTests}`)
    console.log(`   Successful: ${this.successfulTests} (${((this.successfulTests / this.totalTests) * 100).toFixed(1)}%)`)
    console.log(`   Failed: ${this.failedTests} (${((this.failedTests / this.totalTests) * 100).toFixed(1)}%)`)
    console.log()

    // Model performance
    console.log('🤖 Model Performance:')
    const modelStats = {}
    
    this.results.forEach(result => {
      if (!modelStats[result.model]) {
        modelStats[result.model] = {
          total: 0,
          successful: 0,
          totalDuration: 0,
          totalTokens: 0
        }
      }
      
      modelStats[result.model].total++
      if (result.status === 'success') {
        modelStats[result.model].successful++
        modelStats[result.model].totalDuration += result.duration
        modelStats[result.model].totalTokens += result.tokensUsed
      }
    })

    Object.entries(modelStats).forEach(([model, stats]) => {
      const successRate = (stats.successful / stats.total * 100).toFixed(1)
      const avgDuration = stats.successful > 0 ? (stats.totalDuration / stats.successful).toFixed(0) : 0
      const avgTokens = stats.successful > 0 ? (stats.totalTokens / stats.successful).toFixed(0) : 0
      
      console.log(`   ${model}:`)
      console.log(`     Success Rate: ${successRate}% (${stats.successful}/${stats.total})`)
      console.log(`     Avg Duration: ${avgDuration}ms`)
      console.log(`     Avg Tokens: ${avgTokens}`)
      console.log()
    })

    // Category performance
    console.log('📂 Category Performance:')
    const categoryStats = {}
    
    this.results.forEach(result => {
      if (!categoryStats[result.category]) {
        categoryStats[result.category] = { total: 0, successful: 0 }
      }
      
      categoryStats[result.category].total++
      if (result.status === 'success') {
        categoryStats[result.category].successful++
      }
    })

    Object.entries(categoryStats).forEach(([category, stats]) => {
      const successRate = (stats.successful / stats.total * 100).toFixed(1)
      console.log(`   ${category}: ${successRate}% (${stats.successful}/${stats.total})`)
    })
    console.log()

    // Complexity analysis
    console.log('🎯 Complexity Analysis:')
    const complexityStats = { low: { total: 0, successful: 0 }, medium: { total: 0, successful: 0 }, high: { total: 0, successful: 0 } }
    
    this.results.forEach(result => {
      if (complexityStats[result.complexity]) {
        complexityStats[result.complexity].total++
        if (result.status === 'success') {
          complexityStats[result.complexity].successful++
        }
      }
    })

    Object.entries(complexityStats).forEach(([complexity, stats]) => {
      const successRate = (stats.successful / stats.total * 100).toFixed(1)
      console.log(`   ${complexity.toUpperCase()}: ${successRate}% (${stats.successful}/${stats.total})`)
    })
    console.log()

    // Quality analysis
    console.log('🎨 Quality Analysis (Successful Tests Only):')
    const successfulResults = this.results.filter(r => r.status === 'success')
    
    if (successfulResults.length > 0) {
      const codeQuality = successfulResults.filter(r => r.quality.hasCode).length / successfulResults.length * 100
      const explanationQuality = successfulResults.filter(r => r.quality.hasExplanation).length / successfulResults.length * 100
      const structureQuality = successfulResults.filter(r => r.quality.isStructured).length / successfulResults.length * 100
      
      console.log(`   Contains Code: ${codeQuality.toFixed(1)}%`)
      console.log(`   Has Explanation: ${explanationQuality.toFixed(1)}%`)
      console.log(`   Well Structured: ${structureQuality.toFixed(1)}%`)
    }
    console.log()

    // Top performing models
    console.log('🏆 Top Performing Models:')
    const sortedModels = Object.entries(modelStats)
      .filter(([_, stats]) => stats.total > 0)
      .sort((a, b) => (b[1].successful / b[1].total) - (a[1].successful / a[1].total))
      .slice(0, 5)

    sortedModels.forEach(([model, stats], index) => {
      const successRate = (stats.successful / stats.total * 100).toFixed(1)
      console.log(`   ${index + 1}. ${model}: ${successRate}% success rate`)
    })
    console.log()

    // Failed tests summary
    if (this.failedTests > 0) {
      console.log('❌ Failed Tests Summary:')
      const failedResults = this.results.filter(r => r.status === 'failed')
      failedResults.forEach(result => {
        console.log(`   ${result.model} - ${result.scenario}: ${result.error}`)
      })
      console.log()
    }

    // Recommendations
    console.log('💡 Recommendations:')
    console.log('   1. Use models with >90% success rate for production')
    console.log('   2. Consider response time and token usage for cost optimization')
    console.log('   3. Test with your specific use cases before deployment')
    console.log('   4. Monitor quality metrics for generated content')
    console.log('   5. Implement fallback mechanisms for failed requests')
    console.log()

    console.log('🎉 Test completed!')
  }

  async quickTest() {
    console.log('⚡ Quick Chutes AI Test')
    console.log('========================\n')

    const quickScenario = {
      name: 'Quick Test',
      prompt: 'Create a simple function that adds two numbers in JavaScript',
      category: 'Quick Test',
      complexity: 'low',
      expectedTokens: 200
    }

    console.log('Testing with default model (Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8)...')
    
    const result = await this.testModel('Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8', quickScenario)
    
    if (result.status === 'success') {
      console.log('✅ Quick test successful!')
      console.log(`   Duration: ${result.duration}ms`)
      console.log(`   Tokens: ${result.tokensUsed}`)
      console.log(`   Preview: ${result.preview}`)
    } else {
      console.log('❌ Quick test failed!')
      console.log(`   Error: ${result.error}`)
    }
  }
}

// Main execution
async function main() {
  const tester = new ChutesAITester()
  
  // Check if server is running
  try {
    const response = await fetch('http://localhost:3000/api/health')
    if (!response.ok) {
      throw new Error('Health check failed')
    }
  } catch (error) {
    console.log('❌ Development server is not running on http://localhost:3000')
    console.log('Please start the server with: npm run dev')
    process.exit(1)
  }

  console.log('✅ Development server is running\n')

  const args = process.argv.slice(2)
  
  if (args.includes('--quick')) {
    await tester.quickTest()
  } else {
    await tester.runComprehensiveTests()
  }
}

// Add fetch to Node.js environment
if (!global.fetch) {
  global.fetch = require('node-fetch')
}

main().catch(console.error)