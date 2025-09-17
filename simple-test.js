#!/usr/bin/env node

// Simple test script for Chutes AI integration
// Tests one model with one scenario

async function testChutesAI() {
  console.log('🚀 Simple Chutes AI Test')
  console.log('========================\n')

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
            content: 'You are an expert software development assistant. Provide comprehensive, well-structured code and explanations.' 
          },
          { role: 'user', content: 'Create a simple React component for a button with TypeScript that handles click events.' }
        ],
        model: 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8',
        temperature: 0.7,
        max_tokens: 30000
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
      const hasCode = content.includes('```') || content.includes('function') || content.includes('interface')
      const hasExplanation = content.length > 500
      const isStructured = content.includes('\n\n') || content.includes('#') || content.includes('##')
      
      console.log(`   Quality checks:`)
      console.log(`   - Contains code: ${hasCode ? '✅' : '❌'}`)
      console.log(`   - Has explanation: ${hasExplanation ? '✅' : '❌'}`)
      console.log(`   - Well structured: ${isStructured ? '✅' : '❌'}`)
      
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${errorData.error?.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ ERROR')
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  console.log('\n🎉 Test completed!')
}

// Add fetch to Node.js environment
if (!global.fetch) {
  global.fetch = require('node-fetch')
}

// Run the test
testChutesAI().catch(console.error)