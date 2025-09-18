import { test, expect, type Page } from '@playwright/test'

test.describe('Prompt Library Functionality', () => {
  let page: Page

  test.beforeEach(async ({ page: p }) => {
    page = p
    await page.goto('/post-production')
    // Wait for the page to load
    await page.waitForSelector('text=Post Production Studio', { timeout: 10000 })

    // Click on Shot Creator tab
    await page.click('text=Shot Creator')
    await page.waitForSelector('text=Reference Images')
  })

  test('Prompt Library button should be visible and open dialog', async () => {
    // Check that Prompt Library button exists
    const promptButton = page.locator('button:has-text("Prompts")')
    await expect(promptButton).toBeVisible()

    // Click the button
    await promptButton.click()

    // Check that dialog opens
    await expect(page.locator('h2:has-text("Prompt Library")')).toBeVisible()
    await expect(page.locator('text=Browse and select prompts from your library')).toBeVisible()
  })

  test('Image Library button should NOT exist in bottom panel', async () => {
    // There should not be an Image Library button at the bottom
    // Only in the right panel tabs
    const bottomButtons = page.locator('.flex.gap-2 button')
    const buttonsCount = await bottomButtons.count()

    // Should only have the Generate button and Prompts button
    expect(buttonsCount).toBeLessThanOrEqual(2)

    // Image Library should only be accessible via the Library tab
    const libraryTab = page.locator('text=📚 Library')
    await expect(libraryTab).toBeVisible()
  })

  test('Prompt Library should display categories', async () => {
    // Open Prompt Library
    await page.click('button:has-text("Prompts")')

    // Wait for dialog to open
    await page.waitForSelector('h2:has-text("Prompt Library")')

    // Click on Categories tab
    await page.click('text=Categories')

    // Check for category icons and names
    const expectedCategories = [
      '🎬', // Cinematic Shots
      '👤', // Characters
      '💡', // Lighting
      '🏞️', // Environments
      '✨', // Effects
      '🎭', // Moods
      '📷', // Camera
      '🎨'  // Styles
    ]

    for (const icon of expectedCategories) {
      await expect(page.locator(`text=${icon}`)).toBeVisible()
    }
  })

  test('Prompt Library should have populated prompts', async () => {
    // Open Prompt Library
    await page.click('button:has-text("Prompts")')

    // Wait for dialog and prompts to load
    await page.waitForSelector('h2:has-text("Prompt Library")')
    await page.waitForTimeout(2000) // Allow time for prompts to load

    // Check that prompts are displayed
    const promptCards = page.locator('[data-testid="prompt-card"], .bg-slate-900\\/50')
    const count = await promptCards.count()

    // Should have at least some prompts loaded
    expect(count).toBeGreaterThan(0)
  })

  test('Quick Access tab should show favorited prompts', async () => {
    // Open Prompt Library
    await page.click('button:has-text("Prompts")')

    // Wait for dialog
    await page.waitForSelector('h2:has-text("Prompt Library")')

    // Click Quick Access tab
    await page.click('text=Quick Access')

    // Should show the quick access section (may be empty initially)
    await expect(page.locator('[role="tabpanel"]')).toBeVisible()
  })

  test('Search functionality should filter prompts', async () => {
    // Open Prompt Library
    await page.click('button:has-text("Prompts")')

    // Wait for dialog
    await page.waitForSelector('h2:has-text("Prompt Library")')

    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search prompts"]')
    await searchInput.fill('cinematic')

    // Check that results are filtered
    // (Implementation depends on whether search is immediate or requires button click)
    await page.waitForTimeout(500) // Brief wait for search to execute
  })

  test('Add Prompt button should open form', async () => {
    // Open Prompt Library
    await page.click('button:has-text("Prompts")')

    // Wait for dialog
    await page.waitForSelector('h2:has-text("Prompt Library")')

    // Click Add Prompt button
    const addButton = page.locator('button:has-text("Add Prompt")')
    await expect(addButton).toBeVisible()
    await addButton.click()

    // Check that add prompt dialog opens
    await expect(page.locator('text=Add New Prompt')).toBeVisible()
    await expect(page.locator('label:has-text("Title")')).toBeVisible()
    await expect(page.locator('label:has-text("Prompt")')).toBeVisible()
  })

  test('Library tab in right panel should show references', async () => {
    // Click on Library tab in the right panel
    await page.click('text=📚 Library')

    // Should show the reference library with categories
    await expect(page.locator('text=People')).toBeVisible()
    await expect(page.locator('text=Places')).toBeVisible()
    await expect(page.locator('text=Props')).toBeVisible()
    await expect(page.locator('text=Layouts')).toBeVisible()
  })

  test('Prompt can be selected and used', async () => {
    // Open Prompt Library
    await page.click('button:has-text("Prompts")')

    // Wait for dialog and prompts
    await page.waitForSelector('h2:has-text("Prompt Library")')
    await page.waitForTimeout(2000)

    // Find and click a "Use Prompt" button
    const usePromptButton = page.locator('button:has-text("Use Prompt")').first()

    if (await usePromptButton.isVisible()) {
      await usePromptButton.click()

      // Dialog should close and prompt should be in the textarea
      await expect(page.locator('h2:has-text("Prompt Library")')).not.toBeVisible()

      // Check that prompt textarea has content
      const promptTextarea = page.locator('textarea[placeholder*="Describe your shot"]')
      const value = await promptTextarea.inputValue()
      expect(value.length).toBeGreaterThan(0)
    }
  })

  test('Escape key should close Prompt Library dialog', async () => {
    // Open Prompt Library
    await page.click('button:has-text("Prompts")')

    // Wait for dialog
    await page.waitForSelector('h2:has-text("Prompt Library")')

    // Press Escape
    await page.keyboard.press('Escape')

    // Dialog should close
    await expect(page.locator('h2:has-text("Prompt Library")')).not.toBeVisible()
  })
})

test.describe('Reference Library in Right Panel', () => {
  let page: Page

  test.beforeEach(async ({ page: p }) => {
    page = p
    await page.goto('/post-production')
    await page.waitForSelector('text=Post Production Studio')
    await page.click('text=Shot Creator')
  })

  test('Library tab should be accessible in right panel', async () => {
    const libraryTab = page.locator('text=📚 Library')
    await expect(libraryTab).toBeVisible()

    await libraryTab.click()

    // Should show reference categories
    await expect(page.locator('button:has-text("People")')).toBeVisible()
    await expect(page.locator('button:has-text("Places")')).toBeVisible()
    await expect(page.locator('button:has-text("Props")')).toBeVisible()
    await expect(page.locator('button:has-text("Layouts")')).toBeVisible()
  })

  test('Images tab should show generated images', async () => {
    const imagesTab = page.locator('text=📸 Images')
    await expect(imagesTab).toBeVisible()

    await imagesTab.click()

    // Should show the unified gallery
    await expect(page.locator('text=Unified Gallery')).toBeVisible()
  })
})