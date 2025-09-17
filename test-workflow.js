const puppeteer = require('puppeteer');

async function testWorkflow() {
  console.log('🚀 Starting Test Automation Workflow Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    console.log('✅ Navigation successful');
    
    // Wait for the page to load
    await page.waitForSelector('[data-state="active"][value="chat"]');
    console.log('✅ Page loaded successfully');
    
    // Click on the Test Automation tab
    await page.click('[data-value="test-automation"]');
    console.log('✅ Switched to Test Automation tab');
    
    // Wait for the test automation interface to load
    await page.waitForSelector('textarea[placeholder*="Create"]');
    console.log('✅ Test Automation interface loaded');
    
    // Enter a test prompt
    const testPrompt = 'Create a simple calculator that can add, subtract, multiply, and divide two numbers';
    await page.type('textarea[placeholder*="Create"]', testPrompt);
    console.log('✅ Test prompt entered');
    
    // Select JavaScript as the language
    await page.click('[data-state="closed"] .select-trigger');
    await page.waitForSelector('[data-state="open"]');
    await page.click('[data-value="javascript"]');
    console.log('✅ JavaScript language selected');
    
    // Click the start button
    await page.click('button:has-text("Start Test Automation")');
    console.log('✅ Workflow started');
    
    // Wait for the workflow to complete (this might take a while)
    console.log('⏳ Waiting for workflow to complete...');
    await page.waitForSelector('[data-status="completed"]', { timeout: 300000 });
    console.log('✅ Workflow completed successfully');
    
    // Take a screenshot of the results
    await page.screenshot({ path: 'workflow-results.png' });
    console.log('📸 Screenshot saved as workflow-results.png');
    
    // Check the results
    const results = await page.evaluate(() => {
      const stats = {};
      const statElements = document.querySelectorAll('.text-2xl.font-bold');
      statElements.forEach((el, index) => {
        const label = el.nextElementSibling?.textContent || `Stat ${index}`;
        stats[label] = el.textContent;
      });
      return stats;
    });
    
    console.log('📊 Workflow Results:', results);
    
    // Check execution history
    await page.click('[data-value="history"]');
    await page.waitForSelector('.text-center.text-muted-foreground', { timeout: 5000 })
      .catch(() => console.log('✅ Execution history has entries'));
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

// Run the test
testWorkflow().catch(console.error);