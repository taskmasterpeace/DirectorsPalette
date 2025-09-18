const { chromium } = require('playwright');

async function testPostProduction() {
  console.log('🚀 Starting Post Production Gallery Testing...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down for observation
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('📍 Navigating to post-production page...');
    await page.goto('http://localhost:3001/post-production', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Test 1: Initial page load
    console.log('📸 Taking initial page screenshot...');
    await page.screenshot({ path: 'test-1-initial.png', fullPage: true });

    // Test 2: Navigate to Shot Creator tab
    console.log('🎯 Navigating to Shot Creator tab...');
    // Try both mobile and desktop navigation
    const mobileSelect = await page.$('select');
    const desktopTab = await page.$('[value="gen4"]');

    if (mobileSelect) {
      await page.selectOption('select', 'gen4');
    } else if (desktopTab) {
      await desktopTab.click();
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-2-shot-creator.png', fullPage: true });

    // Test 3: Check for existing images in gallery
    console.log('🖼️ Checking gallery for existing images...');
    const galleryImages = await page.$$('img[src*="http"]');
    console.log(`Found ${galleryImages.length} images in gallery`);

    if (galleryImages.length > 0) {
      // Test image display properties
      for (let i = 0; i < Math.min(galleryImages.length, 3); i++) {
        const img = galleryImages[i];
        const boundingBox = await img.boundingBox();
        const src = await img.getAttribute('src');
        const classes = await img.getAttribute('class');
        console.log(`Image ${i + 1}: ${boundingBox?.width}x${boundingBox?.height}`);
        console.log(`  Classes: ${classes}`);
        console.log(`  Source: ${src?.substring(0, 60)}...`);
      }
    }

    // Test 4: Check model badges
    console.log('🏷️ Examining model badges...');
    const badges = await page.$$('.absolute .badge, .absolute [class*="bg-"]');
    console.log(`Found ${badges.length} badges`);

    for (let i = 0; i < Math.min(badges.length, 5); i++) {
      const badge = badges[i];
      const text = await badge.textContent();
      const classes = await badge.getAttribute('class');
      const title = await badge.getAttribute('title');
      console.log(`Badge ${i + 1}: "${text?.trim()}" | Classes: ${classes} | Title: ${title}`);
    }

    // Test 5: Check for placeholders or generating states
    console.log('⏳ Checking for placeholder or generating states...');
    const placeholders = await page.$$('[class*="generating"], [src*="placeholder"]');
    console.log(`Found ${placeholders.length} placeholders/generating items`);

    // Test 6: Test landscape vs portrait display
    console.log('📐 Testing image aspect ratio display...');
    const imageContainers = await page.$$('.grid > div');
    console.log(`Found ${imageContainers.length} image containers`);

    // Take final comprehensive screenshot
    console.log('📸 Taking final state screenshot...');
    await page.screenshot({ path: 'test-5-final.png', fullPage: true });

    // Test 7: Check if any images are cut off
    console.log('✂️ Checking for cut-off images...');
    const images = await page.$$('img[class*="object-cover"]');
    for (let i = 0; i < Math.min(images.length, 3); i++) {
      const img = images[i];
      const naturalDimensions = await img.evaluate(el => ({
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
        displayWidth: el.clientWidth,
        displayHeight: el.clientHeight
      }));
      console.log(`Image ${i + 1} dimensions:`, naturalDimensions);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ Test completed');
  }
}

testPostProduction().catch(console.error);