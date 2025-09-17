#!/usr/bin/env node

// Models to test from the user's list
const MODELS_TO_TEST = [
  'deepseek-ai/DeepSeek-V3.1',
  'meituan-longcat/LongCat-Flash-Chat-FP8',
  'Qwen/Qwen3-235B-A22B-Thinking-2507',
  'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8',
  'Qwen/Qwen3-Next-80B-A3B-Thinking',
  'LLM360/K2-Think',
  'zai-org/GLM-4.5-FP8',
  'openai/gpt-oss-120b',
  'NousResearch/Hermes-4-405B-FP8',
  'deepseek-ai/DeepSeek-R1-0528',
  'moonshotai/Kimi-K2-Instruct-0905',
  'all-hands/openhands-lm-32b-v0.1-ep3',
  'Tesslate/UIGEN-X-32B-0727'
];

// Test configuration
const CHUTES_API_KEY = process.env.CHUTES_API_TOKEN || process.env.CHUTES_API_KEY;
const CHUTES_API_URL = 'https://llm.chutes.ai/v1';

async function testModelsEndpoint() {
  console.log('🔍 Testing Models Endpoint');
  console.log('========================\n');

  try {
    const response = await fetch(`${CHUTES_API_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHUTES_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Models endpoint accessible');
      console.log(`Total models available: ${data.data?.length || 0}`);
      
      if (data.data && data.data.length > 0) {
        console.log('\nAvailable models:');
        data.data.forEach((model, index) => {
          console.log(`${index + 1}. ${model.id} - ${model.owned_by || 'Unknown'}`);
        });
        
        // Check if our test models are available
        console.log('\n🔍 Checking for requested models:');
        MODELS_TO_TEST.forEach(modelName => {
          const found = data.data.some(model => 
            model.id === modelName || 
            model.id.includes(modelName.split('/')[1]) ||
            modelName.includes(model.id)
          );
          console.log(`${found ? '✅' : '❌'} ${modelName}`);
        });
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Models endpoint failed');
      console.log(`Error: ${errorData}`);
    }
  } catch (error) {
    console.log('❌ Error testing models endpoint');
    console.log(`Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
}

async function testChatCompletion(modelName) {
  console.log(`💬 Testing Chat Completion with: ${modelName}`);
  console.log('==============================================\n');

  const requestBody = {
    model: modelName,
    messages: [
      {
        role: 'user',
        content: 'Tell me a 50 word story about a robot learning to paint.'
      }
    ],
    stream: false,
    max_tokens: 150,
    temperature: 0.7
  };

  try {
    console.log('Request payload:');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('');

    const response = await fetch(`${CHUTES_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHUTES_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chat completion successful');
      console.log('Response:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.choices && data.choices[0]) {
        const content = data.choices[0].message?.content || 'No content';
        console.log(`\n📝 Generated content (${content.length} chars):`);
        console.log(content.substring(0, 200) + (content.length > 200 ? '...' : ''));
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Chat completion failed');
      console.log(`Error: ${errorData}`);
    }
  } catch (error) {
    console.log('❌ Error testing chat completion');
    console.log(`Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
}

async function testStreamingChatCompletion() {
  console.log('🌊 Testing Streaming Chat Completion');
  console.log('===================================\n');

  const requestBody = {
    model: 'deepseek-ai/DeepSeek-R1-0528',
    messages: [
      {
        role: 'user',
        content: 'Count from 1 to 5 slowly.'
      }
    ],
    stream: true,
    max_tokens: 100,
    temperature: 0.7
  };

  try {
    console.log('Request payload (streaming):');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('');

    const response = await fetch(`${CHUTES_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHUTES_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      console.log('✅ Streaming chat completion initiated');
      console.log('Streaming response:');
      
      let fullContent = '';
      for await (const chunk of response.body) {
        const chunkText = chunk.toString();
        const lines = chunkText.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('🏁 Stream completed');
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                process.stdout.write(content);
                fullContent += content;
              }
            } catch (e) {
              // Ignore parsing errors for streaming data
            }
          }
        }
      }
      
      console.log(`\n\n📝 Total streamed content (${fullContent.length} chars)`);
    } else {
      const errorData = await response.text();
      console.log('❌ Streaming chat completion failed');
      console.log(`Error: ${errorData}`);
    }
  } catch (error) {
    console.log('❌ Error testing streaming chat completion');
    console.log(`Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
}

async function main() {
  console.log('🧪 Chutes AI Models and API Format Test');
  console.log('=======================================\n');

  if (!CHUTES_API_KEY) {
    console.log('❌ No API key found!');
    console.log('Please set CHUTES_API_TOKEN or CHUTES_API_KEY environment variable');
    process.exit(1);
  }

  console.log(`🔑 Using API key: ${CHUTES_API_KEY.substring(0, 20)}...`);
  console.log(`🌐 API URL: ${CHUTES_API_URL}\n`);

  // Test 1: Check models endpoint
  await testModelsEndpoint();

  // Test 2: Test chat completion with a few models
  const modelsToTest = [
    'deepseek-ai/DeepSeek-R1-0528',
    'deepseek-ai/DeepSeek-V3.1',
    'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8'
  ];

  for (const model of modelsToTest) {
    await testChatCompletion(model);
  }

  // Test 3: Test streaming chat completion
  await testStreamingChatCompletion();

  console.log('🎉 All tests completed!');
}

// Run the tests
main().catch(console.error);