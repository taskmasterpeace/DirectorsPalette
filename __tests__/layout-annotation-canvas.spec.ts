import { test, expect } from '@playwright/test'

test.describe('Layout & Annotation Canvas', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to post-production page
    await page.goto('/post-production')
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="post-production-tabs"]', { timeout: 10000 })
  })

  test('should navigate to Layout & Annotation tab', async ({ page }) => {
    // Click on Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    
    // Wait for canvas to load
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Verify canvas is visible
    const canvas = await page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // Verify main components are present
    await expect(page.locator('text=Layout & Annotation Canvas')).toBeVisible()
    await expect(page.locator('text=Drawing Tools')).toBeVisible()
    await expect(page.locator('text=Layers')).toBeVisible()
    await expect(page.locator('text=Export & Share')).toBeVisible()
  })

  test('should have all drawing tools available', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Check for all drawing tool buttons
    const expectedTools = [
      'Select',
      'Brush', 
      'Rectangle',
      'Circle',
      'Line',
      'Arrow',
      'Text',
      'Eraser'
    ]
    
    for (const tool of expectedTools) {
      await expect(page.locator(`button:has-text("${tool}")`)).toBeVisible()
    }
  })

  test('should change tools when clicked', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Click on brush tool
    await page.click('button:has-text("Brush")')
    
    // Verify tool changed
    await expect(page.locator('text=Active Tool: Brush')).toBeVisible()
    await expect(page.locator('text=Click and drag to draw freehand')).toBeVisible()
    
    // Click on rectangle tool
    await page.click('button:has-text("Rectangle")')
    
    // Verify tool changed
    await expect(page.locator('text=Active Tool: Rectangle')).toBeVisible()
    await expect(page.locator('text=Click and drag to draw rectangle')).toBeVisible()
  })

  test('should have color picker functionality', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Check that color picker is present
    await expect(page.locator('input[type="color"]')).toBeVisible()
    
    // Check that preset colors are available
    const colorButtons = await page.locator('[title="#FF0000"]')
    await expect(colorButtons.first()).toBeVisible()
    
    // Click on a preset color
    await colorButtons.first().click()
    
    // Verify color input shows the selected color
    const colorInput = await page.locator('input[value="#FF0000"]')
    await expect(colorInput).toBeVisible()
  })

  test('should have brush size controls', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Check for brush size slider
    await expect(page.locator('text=Brush Size:')).toBeVisible()
    
    // Check slider is present and functional
    const slider = await page.locator('[role="slider"]').first()
    await expect(slider).toBeVisible()
    
    // Verify brush size display updates
    await expect(page.locator('text=Brush Size: 5px')).toBeVisible()
  })

  test('should have layer management', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Check layer manager is present
    await expect(page.locator('text=Layers (2)')).toBeVisible()
    
    // Check for default layers
    await expect(page.locator('text=Background')).toBeVisible()
    await expect(page.locator('text=Annotations')).toBeVisible()
    
    // Check for layer controls (eye and lock icons)
    const eyeIcons = await page.locator('[title*="layer"]')
    await expect(eyeIcons.first()).toBeVisible()
  })

  test('should have zoom controls', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Check for zoom controls
    await expect(page.locator('button:has([data-testid="zoom-out"])')).toBeVisible()
    await expect(page.locator('button:has([data-testid="zoom-in"])')).toBeVisible()
    await expect(page.locator('button:has([data-testid="fit-screen"])')).toBeVisible()
    
    // Check zoom percentage display
    await expect(page.locator('text=100% zoom')).toBeVisible()
  })

  test('should have export functionality', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Check export panel
    await expect(page.locator('text=Export & Share')).toBeVisible()
    
    // Check export format selector
    await expect(page.locator('text=Export Format')).toBeVisible()
    
    // Check export buttons
    await expect(page.locator('button:has-text("Download Canvas")')).toBeVisible()
    await expect(page.locator('button:has-text("Copy to Clipboard")')).toBeVisible()
    await expect(page.locator('button:has-text("Save to Gallery")')).toBeVisible()
  })

  test('should handle file upload', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Check import button is present
    await expect(page.locator('button:has-text("Import Image")')).toBeVisible()
    
    // Click import button should trigger file input
    await page.click('button:has-text("Import Image")')
    
    // File input should be present (though hidden)
    await expect(page.locator('input[type="file"][accept="image/*"]')).toBePresent()
  })

  test('should have undo/redo functionality', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Check for undo button
    await expect(page.locator('button:has-text("Undo")')).toBeVisible()
    
    // Initially undo should be disabled
    const undoButton = await page.locator('button:has-text("Undo")')
    await expect(undoButton).toBeDisabled()
  })

  test('should receive images from gallery', async ({ page }) => {
    // First, go to a tab that has images (like Shot Creator)
    await page.click('button:has-text("Shot Creator")')
    await page.waitForSelector('.unified-image-gallery', { timeout: 10000 })
    
    // Look for "Send to Layout & Annotation" button in gallery
    const sendToLayoutButton = await page.locator('button[title="Send to Layout & Annotation"]')
    
    // If an image exists, click the send button
    if (await sendToLayoutButton.count() > 0) {
      await sendToLayoutButton.first().click()
      
      // Should switch to Layout & Annotation tab
      await page.waitForSelector('canvas', { timeout: 15000 })
      
      // Should show toast notification
      await expect(page.locator('text=Image Received')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Test keyboard shortcuts for tools
    await page.keyboard.press('v')
    await expect(page.locator('text=Active Tool: Select')).toBeVisible()
    
    await page.keyboard.press('b')
    await expect(page.locator('text=Active Tool: Brush')).toBeVisible()
    
    await page.keyboard.press('r')
    await expect(page.locator('text=Active Tool: Rectangle')).toBeVisible()
    
    await page.keyboard.press('t')
    await expect(page.locator('text=Active Tool: Text')).toBeVisible()
  })

  test('should display canvas info correctly', async ({ page }) => {
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Check status information
    await expect(page.locator('text=Zoom: 100%')).toBeVisible()
    await expect(page.locator('text=Tool: select')).toBeVisible()
    await expect(page.locator('text=Layers: 2/2')).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    // Test on different screen sizes
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    // Navigate to Layout & Annotation tab
    await page.click('button:has-text("Layout & Annotation")')
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // All panels should be visible on large screen
    await expect(page.locator('text=Drawing Tools')).toBeVisible()
    await expect(page.locator('text=Layers')).toBeVisible()
    await expect(page.locator('text=Export & Share')).toBeVisible()
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Canvas should still be functional
    await expect(page.locator('canvas')).toBeVisible()
  })
})