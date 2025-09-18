const { chromium } = require('playwright');

async function testPostProductionManually() {
  console.log('🚀 Starting Manual Post Production Testing...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500 // Very slow for manual intervention
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X dimensions
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  try {
    console.log('📱 Loading post-production page...');
    await page.goto('http://localhost:3000/post-production', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({ path: 'initial-page.png', fullPage: true });

    console.log('⏸️  PAUSED FOR MANUAL AUTH');
    console.log('👆 Please manually authenticate in the browser window...');
    console.log('   1. Click "Continue with Google" or enter email');
    console.log('   2. Complete authentication');
    console.log('   3. Wait for page to load');
    console.log('   4. Come back here and press any key to continue...');

    // Wait for manual intervention
    await new Promise(resolve => {
      process.stdin.once('data', () => {
        console.log('✅ Continuing with test...');
        resolve(null);
      });
    });

    // Wait for page to potentially reload after auth
    await page.waitForTimeout(2000);

    // Test if we're now on the post-production page
    const pageUrl = page.url();
    console.log(`Current URL: ${pageUrl}`);

    if (pageUrl.includes('post-production')) {
      console.log('✅ Successfully authenticated and on post-production page');

      // Test the Shot Creator tab selection
      console.log('🎨 Testing Shot Creator tab...');

      // Take screenshot after auth
      await page.screenshot({ path: 'post-auth-page.png', fullPage: true });

      // Try to find and click Shot Creator
      const shotCreatorSelector = 'text="Shot Creator"';
      const shotCreatorVisible = await page.locator(shotCreatorSelector).isVisible();
      console.log(`Shot Creator visible: ${shotCreatorVisible}`);

      if (shotCreatorVisible) {
        await page.click(shotCreatorSelector);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'shot-creator-active.png', fullPage: true });
      }

      // Test image gallery area
      console.log('🖼️ Testing image gallery area...');
      const galleryArea = page.locator('[role="tabpanel"]');
      const galleryVisible = await galleryArea.isVisible();
      console.log(`Gallery area visible: ${galleryVisible}`);

      // Check for "No images generated yet" placeholder
      const noImagesText = await page.locator('text="No images generated yet"').isVisible();
      console.log(`No images placeholder visible: ${noImagesText}`);

      // Test dropdown for tabs on mobile
      console.log('📱 Testing mobile dropdown navigation...');
      const dropdown = page.locator('select');
      const dropdownVisible = await dropdown.isVisible();
      console.log(`Mobile dropdown visible: ${dropdownVisible}`);

      if (dropdownVisible) {
        // Test switching to different tabs via dropdown
        await dropdown.selectOption('gen4');
        await page.waitForTimeout(1000);
        console.log('Selected Shot Creator via dropdown');
      }

      await page.screenshot({ path: 'final-state.png', fullPage: true });

    } else {
      console.log('❌ Not on post-production page, still on auth');
      await page.screenshot({ path: 'still-auth.png', fullPage: true });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'detailed-error-state.png', fullPage: true });
  }

  console.log('🔍 Test completed. Check screenshots for results.');
  console.log('🖼️  Screenshots: initial-page.png, post-auth-page.png, final-state.png');

  // Keep browser open for inspection
  console.log('Browser left open for manual inspection...');
}

testPostProductionManually().catch(console.error);