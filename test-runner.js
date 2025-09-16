#!/usr/bin/env node

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

// Test scenarios for quick validation
const quickTests = [
  {
    name: 'Basic Hello World',
    prompt: 'Create a simple "Hello World" program in JavaScript',
    expected: 'Should return JavaScript code'
  },
  {
    name: 'React Component',
    prompt: 'Create a simple React button component with TypeScript',
    expected: 'Should return React component code'
  },
  {
    name: 'API Endpoint',
    prompt: 'Create a simple Express.js GET endpoint',
    expected: 'Should return Express.js code'
  }
]

async function runQuickTest() {
  console.log('🚀 Quick Chutes AI Integration Test')
  console.log('==================================\n')

  for (const test of quickTests) {
    console.log(`Testing: ${test.name}`)
    console.log(`Prompt: ${test.prompt}`)
    
    try {
      const startTime = Date.now()
      
      // Make API call
      const response = await fetch('http://localhost:3000/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: test.prompt }
          ],
          model: 'gpt-4',
          temperature: 0.7,
          max_tokens: 500
        })
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      if (response.ok) {
        const data = await response.json()
        const content = data.choices[0]?.message?.content || ''
        
        console.log('✅ SUCCESS')
        console.log(`   Response time: ${duration}ms`)
        console.log(`   Content: ${content.substring(0, 100)}...`)
      } else {
        console.log('❌ FAILED')
        console.log(`   Status: ${response.status}`)
      }
    } catch (error) {
      console.log('❌ ERROR')
      console.log(`   Error: ${error.message}`)
    }
    
    console.log('---\n')
  }
}

// Function to check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health')
    return response.ok
  } catch (error) {
    return false
  }
}

// Main test function
async function main() {
  console.log('🧪 Chutes AI Integration Test Suite')
  console.log('==================================\n')

  // Check if server is running
  console.log('Checking if development server is running...')
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    console.log('❌ Development server is not running on http://localhost:3000')
    console.log('Please start the server with: npm run dev')
    process.exit(1)
  }
  
  console.log('✅ Development server is running\n')

  // Run quick tests
  await runQuickTest()

  console.log('🎉 Quick tests completed!')
  console.log('\nFor comprehensive testing, run:')
  console.log('node test-chutes-ai.ts (requires TypeScript execution)')
}

// Add fetch to Node.js environment
if (!global.fetch) {
  global.fetch = require('node-fetch')
}

main().catch(console.error)