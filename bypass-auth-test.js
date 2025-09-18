const { chromium } = require('playwright');

async function testPostProductionWithAuth() {
  console.log('🚀 Starting Post Production Mobile UX Testing with Auth...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down for visual inspection
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X dimensions
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  try {
    console.log('📱 Loading page in iPhone X viewport...');
    await page.goto('http://localhost:3000/post-production', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Test 1: Take screenshot of auth screen
    console.log('📸 Taking auth screen screenshot...');
    await page.screenshot({ path: 'auth-screen.png', fullPage: true });

    // Test 2: Check mobile auth UI elements
    console.log('🔐 Testing auth screen mobile UI...');

    // Check if Google button is visible and properly sized
    const googleButton = page.locator('text="Continue with Google"');
    const googleButtonVisible = await googleButton.isVisible();
    console.log(`Google button visible: ${googleButtonVisible}`);

    if (googleButtonVisible) {
      const googleBtnBox = await googleButton.boundingBox();
      console.log(`Google button size: ${googleBtnBox?.width}x${googleBtnBox?.height}`);

      // Check if button meets minimum touch target size (44px)
      const meetsTouchTarget = googleBtnBox && googleBtnBox.height >= 44;
      console.log(`Meets touch target size: ${meetsTouchTarget}`);
    }

    // Test 3: Check email input
    const emailInput = page.locator('input[type="email"]');
    const emailInputVisible = await emailInput.isVisible();
    console.log(`Email input visible: ${emailInputVisible}`);

    if (emailInputVisible) {
      const emailBox = await emailInput.boundingBox();
      console.log(`Email input size: ${emailBox?.width}x${emailBox?.height}`);
    }

    // Test 4: Check overall mobile layout
    const title = page.locator('text="Director\'s Palette"');
    const titleVisible = await title.isVisible();
    console.log(`Title visible: ${titleVisible}`);

    // Test 5: Let's try to navigate to home page (public route)
    console.log('🏠 Testing navigation to home page...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'home-page.png', fullPage: true });

    console.log('✅ Auth and navigation tests completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser left open for manual inspection. Close manually when done.');
    // await browser.close();
  }
}

testPostProductionWithAuth().catch(console.error);