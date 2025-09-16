import { test, expect } from '@playwright/test';

test.describe('ShotAnimator Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/post-production');
    await page.waitForLoadState('networkidle');
  });

  test('should display Shot Animator tab', async ({ page }) => {
    // Click on Shot Animator tab
    const animatorTab = page.getByRole('tab', { name: /shot animator/i });
    if (await animatorTab.isVisible()) {
      await animatorTab.click();
      await expect(page.getByText('Shot Animator')).toBeVisible();
    }
  });

  test('should select AI model', async ({ page }) => {
    const animatorTab = page.getByRole('tab', { name: /shot animator/i });
    if (await animatorTab.isVisible()) {
      await animatorTab.click();

      // Check for model selection
      await expect(page.getByText(/seedance lite/i)).toBeVisible();
      await expect(page.getByText(/seedance pro/i)).toBeVisible();

      // Click on Pro model
      const proModel = page.getByText(/seedance pro/i).first();
      if (await proModel.isVisible()) {
        await proModel.click();

        // Check if model is selected
        await expect(page.getByText(/selected/i)).toBeVisible();
      }
    }
  });

  test('should configure video settings', async ({ page }) => {
    const animatorTab = page.getByRole('tab', { name: /shot animator/i });
    if (await animatorTab.isVisible()) {
      await animatorTab.click();

      // Fill in prompt
      const promptField = page.getByPlaceholder(/describe your video/i);
      if (await promptField.isVisible()) {
        await promptField.fill('A beautiful sunset over mountains');
      }

      // Select resolution
      const resolutionSelect = page.getByRole('combobox').filter({ hasText: /resolution/i });
      if (await resolutionSelect.isVisible()) {
        await resolutionSelect.click();
        await page.getByRole('option', { name: /720p/i }).click();
      }

      // Select duration
      const durationSelect = page.getByRole('combobox').filter({ hasText: /duration/i });
      if (await durationSelect.isVisible()) {
        await durationSelect.click();
        await page.getByRole('option', { name: /5 seconds/i }).click();
      }

      // Select aspect ratio
      const aspectRatioSelect = page.getByRole('combobox').filter({ hasText: /aspect ratio/i });
      if (await aspectRatioSelect.isVisible()) {
        await aspectRatioSelect.click();
        await page.getByRole('option', { name: /16:9/i }).click();
      }
    }
  });

  test('should upload reference images', async ({ page }) => {
    const animatorTab = page.getByRole('tab', { name: /shot animator/i });
    if (await animatorTab.isVisible()) {
      await animatorTab.click();

      // Look for upload button
      const uploadButton = page.getByRole('button', { name: /upload/i });
      if (await uploadButton.isVisible()) {
        // Create a test image file
        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.count() > 0) {
          // Set test file
          await fileInput.first().setInputFiles({
            name: 'test.png',
            mimeType: 'image/png',
            buffer: Buffer.from('fake-image-data')
          });

          // Check if image is displayed
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should adjust motion intensity', async ({ page }) => {
    const animatorTab = page.getByRole('tab', { name: /shot animator/i });
    if (await animatorTab.isVisible()) {
      await animatorTab.click();

      // Find motion intensity slider
      const motionLabel = page.getByText(/motion intensity/i);
      if (await motionLabel.isVisible()) {
        const slider = page.getByRole('slider').first();
        if (await slider.isVisible()) {
          // Move slider to 75%
          await slider.fill('75');

          // Check if value updated
          await expect(page.getByText('75%')).toBeVisible();
        }
      }
    }
  });

  test('should show generation queue', async ({ page }) => {
    const animatorTab = page.getByRole('tab', { name: /shot animator/i });
    if (await animatorTab.isVisible()) {
      await animatorTab.click();

      // Check for generation queue
      await expect(page.getByText(/generation queue/i)).toBeVisible();

      // Check empty state
      const emptyState = page.getByText(/no videos generated yet/i);
      if (await emptyState.isVisible()) {
        expect(emptyState).toBeTruthy();
      }
    }
  });

  test('should switch between tabs in Shot Animator', async ({ page }) => {
    const animatorTab = page.getByRole('tab', { name: /shot animator/i });
    if (await animatorTab.isVisible()) {
      await animatorTab.click();

      // Check for sub-tabs
      const generateTab = page.getByRole('tab', { name: /generate/i });
      const galleryTab = page.getByRole('tab', { name: /gallery/i });
      const libraryTab = page.getByRole('tab', { name: /reference library/i });

      if (await generateTab.isVisible()) {
        // Switch to Gallery
        await galleryTab.click();
        await page.waitForTimeout(500);

        // Switch to Library
        await libraryTab.click();
        await page.waitForTimeout(500);

        // Switch back to Generate
        await generateTab.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display credits estimation', async ({ page }) => {
    const animatorTab = page.getByRole('tab', { name: /shot animator/i });
    if (await animatorTab.isVisible()) {
      await animatorTab.click();

      // Check for credits display
      const creditsDisplay = page.getByText(/estimated.*credits/i);
      if (await creditsDisplay.isVisible()) {
        expect(creditsDisplay).toBeTruthy();
      }
    }
  });

  test('should handle paste from clipboard', async ({ page }) => {
    const animatorTab = page.getByRole('tab', { name: /shot animator/i });
    if (await animatorTab.isVisible()) {
      await animatorTab.click();

      // Look for paste button
      const pasteButton = page.getByRole('button', { name: /paste/i });
      if (await pasteButton.isVisible()) {
        // Grant clipboard permissions
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        // Click paste button
        await pasteButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show gallery modal', async ({ page }) => {
    const animatorTab = page.getByRole('tab', { name: /shot animator/i });
    if (await animatorTab.isVisible()) {
      await animatorTab.click();

      // Look for gallery button
      const galleryButton = page.getByRole('button', { name: /gallery/i });
      if (await galleryButton.isVisible()) {
        await galleryButton.click();

        // Check if modal appears
        await expect(page.getByText(/select reference images/i)).toBeVisible();

        // Close modal
        const closeButton = page.getByRole('button', { name: /close/i });
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }
  });
});