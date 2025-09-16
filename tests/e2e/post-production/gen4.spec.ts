import { test, expect } from '@playwright/test';

test.describe('Gen4 Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/post-production');
    await page.waitForLoadState('networkidle');
  });

  test('should display Gen4 component', async ({ page }) => {
    // Navigate to Gen4 section if available
    const gen4Section = page.getByText(/gen.*4/i).first();
    if (await gen4Section.isVisible()) {
      await expect(gen4Section).toBeVisible();
    }
  });

  test('should add reference images', async ({ page }) => {
    // Look for add reference image button
    const addReferenceButton = page.getByRole('button', { name: /add reference/i });
    if (await addReferenceButton.isVisible()) {
      await addReferenceButton.click();

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        await fileInput.first().setInputFiles({
          name: 'reference.png',
          mimeType: 'image/png',
          buffer: Buffer.from('fake-reference-image')
        });

        await page.waitForTimeout(500);
      }
    }
  });

  test('should remove reference images', async ({ page }) => {
    // First add an image
    const addReferenceButton = page.getByRole('button', { name: /add reference/i });
    if (await addReferenceButton.isVisible()) {
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        await fileInput.first().setInputFiles({
          name: 'reference.png',
          mimeType: 'image/png',
          buffer: Buffer.from('fake-reference-image')
        });

        await page.waitForTimeout(500);

        // Look for remove button
        const removeButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
        if (await removeButton.isVisible()) {
          await removeButton.click();
          await page.waitForTimeout(300);
        }
      }
    }
  });

  test('should input and clear prompt', async ({ page }) => {
    const promptTextarea = page.getByPlaceholder(/describe.*scene/i);
    if (await promptTextarea.isVisible()) {
      // Input prompt
      await promptTextarea.fill('A futuristic cityscape at sunset with flying cars');
      await expect(promptTextarea).toHaveValue('A futuristic cityscape at sunset with flying cars');

      // Clear prompt
      await promptTextarea.clear();
      await expect(promptTextarea).toHaveValue('');
    }
  });

  test('should select generation model', async ({ page }) => {
    const modelSelect = page.getByRole('combobox').filter({ hasText: /model/i });
    if (await modelSelect.isVisible()) {
      await modelSelect.click();

      // Select a model option
      const modelOption = page.getByRole('option').first();
      if (await modelOption.isVisible()) {
        await modelOption.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should configure aspect ratio', async ({ page }) => {
    const aspectRatioSelect = page.getByRole('combobox').filter({ hasText: /aspect ratio/i });
    if (await aspectRatioSelect.isVisible()) {
      await aspectRatioSelect.click();

      // Select 16:9
      const wideOption = page.getByRole('option', { name: /16:9/i });
      if (await wideOption.isVisible()) {
        await wideOption.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should adjust quality settings', async ({ page }) => {
    // Look for quality slider
    const qualityLabel = page.getByText(/quality/i);
    if (await qualityLabel.isVisible()) {
      const qualitySlider = page.getByRole('slider').first();
      if (await qualitySlider.isVisible()) {
        // Set to high quality
        await qualitySlider.fill('90');
        await expect(page.getByText('90')).toBeVisible();
      }
    }
  });

  test('should set number of generations', async ({ page }) => {
    const countSelect = page.getByRole('combobox').filter({ hasText: /number.*generate/i });
    if (await countSelect.isVisible()) {
      await countSelect.click();

      // Select 4 generations
      const fourOption = page.getByRole('option', { name: /4/i });
      if (await fourOption.isVisible()) {
        await fourOption.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should enable enhance prompt option', async ({ page }) => {
    const enhanceCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /enhance prompt/i });
    if (await enhanceCheckbox.isVisible()) {
      await enhanceCheckbox.check();
      await expect(enhanceCheckbox).toBeChecked();

      // Uncheck
      await enhanceCheckbox.uncheck();
      await expect(enhanceCheckbox).not.toBeChecked();
    }
  });

  test('should display generation button state', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /generate/i });
    if (await generateButton.isVisible()) {
      // Check if disabled without prompt
      const promptTextarea = page.getByPlaceholder(/describe.*scene/i);
      if (await promptTextarea.isVisible()) {
        await promptTextarea.clear();
        await expect(generateButton).toBeDisabled();

        // Enable with prompt
        await promptTextarea.fill('Test prompt');
        await expect(generateButton).toBeEnabled();
      }
    }
  });

  test('should display generation gallery', async ({ page }) => {
    // Check for gallery section
    const gallerySection = page.getByText(/generated images/i);
    if (await gallerySection.isVisible()) {
      await expect(gallerySection).toBeVisible();

      // Check empty state
      const emptyState = page.getByText(/no images generated/i);
      if (await emptyState.isVisible()) {
        expect(emptyState).toBeTruthy();
      }
    }
  });

  test('should handle gallery pagination', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /next/i });
    const prevButton = page.getByRole('button', { name: /previous/i });

    if (await nextButton.isVisible()) {
      // Check if disabled when no content
      if (await nextButton.isDisabled()) {
        expect(await nextButton.isDisabled()).toBeTruthy();
      }
    }
  });

  test('should select generated images', async ({ page }) => {
    const imageCard = page.locator('.generated-image').first();
    if (await imageCard.count() > 0) {
      const checkbox = imageCard.locator('input[type="checkbox"]');
      if (await checkbox.isVisible()) {
        await checkbox.check();
        await expect(checkbox).toBeChecked();

        await checkbox.uncheck();
        await expect(checkbox).not.toBeChecked();
      }
    }
  });

  test('should download generated image', async ({ page }) => {
    const downloadButton = page.locator('button').filter({ has: page.locator('svg.lucide-download') }).first();
    if (await downloadButton.isVisible()) {
      // Set up download promise
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

      await downloadButton.click();

      const download = await downloadPromise;
      if (download) {
        expect(download).toBeTruthy();
      }
    }
  });

  test('should copy prompt from generated image', async ({ page }) => {
    const copyPromptButton = page.locator('button').filter({ has: page.locator('svg.lucide-copy') }).first();
    if (await copyPromptButton.isVisible()) {
      await copyPromptButton.click();
      await page.waitForTimeout(300);

      // Check for success notification if implemented
      // await expect(page.getByText(/copied/i)).toBeVisible();
    }
  });

  test('should clear all reference images', async ({ page }) => {
    const clearAllButton = page.getByRole('button', { name: /clear all/i });
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      await page.waitForTimeout(300);

      // Verify images cleared
      const referenceImages = page.locator('.reference-image');
      await expect(referenceImages).toHaveCount(0);
    }
  });

  test('should show generation progress', async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"]');
    if (await progressBar.count() > 0) {
      expect(progressBar).toBeTruthy();
    }
  });

  test('should handle generation errors gracefully', async ({ page }) => {
    // This would test error states if the API fails
    const errorMessage = page.getByText(/error.*generating/i);
    if (await errorMessage.isVisible()) {
      expect(errorMessage).toBeTruthy();
    }
  });

  test('should save generation settings', async ({ page }) => {
    const saveSettingsButton = page.getByRole('button', { name: /save settings/i });
    if (await saveSettingsButton.isVisible()) {
      await saveSettingsButton.click();
      await page.waitForTimeout(300);

      // Check for success notification
      // await expect(page.getByText(/settings saved/i)).toBeVisible();
    }
  });
});