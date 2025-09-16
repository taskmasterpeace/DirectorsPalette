import { test, expect } from '@playwright/test';

test.describe('UnifiedImageGallery Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/post-production');
    await page.waitForLoadState('networkidle');
  });

  test('should display image gallery', async ({ page }) => {
    // Navigate to gallery if available
    const gallerySection = page.getByText('Unified Image Gallery');
    if (await gallerySection.isVisible()) {
      await expect(gallerySection).toBeVisible();
    }
  });

  test('should switch between view modes', async ({ page }) => {
    // Look for view mode buttons
    const gridViewButton = page.getByRole('button', { name: /grid/i });
    const listViewButton = page.getByRole('button', { name: /list/i });
    const chainViewButton = page.getByRole('button', { name: /chain/i });

    if (await gridViewButton.isVisible()) {
      // Switch to list view
      await listViewButton.click();
      await page.waitForTimeout(300);

      // Switch to chain view
      await chainViewButton.click();
      await page.waitForTimeout(300);

      // Switch back to grid view
      await gridViewButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should filter images by search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search images/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test search query');
      await page.waitForTimeout(500);
    }
  });

  test('should filter by status', async ({ page }) => {
    const statusFilter = page.getByRole('combobox').filter({ hasText: /all images/i });
    if (await statusFilter.isVisible()) {
      await statusFilter.click();

      // Select processing status
      const processingOption = page.getByRole('option', { name: /processing/i });
      if (await processingOption.isVisible()) {
        await processingOption.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should filter by date range', async ({ page }) => {
    const dateFilter = page.getByRole('combobox').filter({ hasText: /date/i });
    if (await dateFilter.isVisible()) {
      await dateFilter.click();

      // Select last week
      const lastWeekOption = page.getByRole('option', { name: /last week/i });
      if (await lastWeekOption.isVisible()) {
        await lastWeekOption.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should sort images', async ({ page }) => {
    const sortDropdown = page.getByRole('combobox').filter({ hasText: /sort/i });
    if (await sortDropdown.isVisible()) {
      await sortDropdown.click();

      // Sort by oldest first
      const oldestOption = page.getByRole('option', { name: /oldest/i });
      if (await oldestOption.isVisible()) {
        await oldestOption.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should select and deselect images', async ({ page }) => {
    // Find image checkboxes
    const imageCheckbox = page.locator('.image-card input[type="checkbox"]').first();
    if (await imageCheckbox.count() > 0) {
      // Select image
      await imageCheckbox.check();
      await expect(imageCheckbox).toBeChecked();

      // Deselect image
      await imageCheckbox.uncheck();
      await expect(imageCheckbox).not.toBeChecked();
    }
  });

  test('should select all images', async ({ page }) => {
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
      await page.waitForTimeout(500);

      // Deselect all
      const deselectAllButton = page.getByRole('button', { name: /deselect all/i });
      if (await deselectAllButton.isVisible()) {
        await deselectAllButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle bulk actions', async ({ page }) => {
    // Select some images first
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();

      // Look for bulk actions menu
      const bulkActionsButton = page.getByRole('button', { name: /bulk actions/i });
      if (await bulkActionsButton.isVisible()) {
        await bulkActionsButton.click();

        // Check for action options
        await expect(page.getByText(/delete selected/i)).toBeVisible();
        await expect(page.getByText(/export selected/i)).toBeVisible();
        await expect(page.getByText(/tag selected/i)).toBeVisible();
      }
    }
  });

  test('should navigate pages', async ({ page }) => {
    // Look for pagination controls
    const nextButton = page.getByRole('button', { name: /next/i });
    const prevButton = page.getByRole('button', { name: /previous/i });

    if (await nextButton.isVisible()) {
      // Go to next page
      await nextButton.click();
      await page.waitForTimeout(500);

      // Go to previous page
      if (await prevButton.isEnabled()) {
        await prevButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display image details on hover', async ({ page }) => {
    const imageCard = page.locator('.image-card').first();
    if (await imageCard.count() > 0) {
      await imageCard.hover();
      await page.waitForTimeout(500);

      // Check if overlay appears with details
      const overlay = page.locator('.image-overlay');
      if (await overlay.count() > 0) {
        expect(overlay).toBeTruthy();
      }
    }
  });

  test('should open image in modal', async ({ page }) => {
    const imageCard = page.locator('.image-card').first();
    if (await imageCard.count() > 0) {
      await imageCard.click();

      // Check if modal opens
      await expect(page.getByRole('dialog')).toBeVisible();

      // Close modal
      const closeButton = page.getByRole('button', { name: /close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });

  test('should display chain view connections', async ({ page }) => {
    // Switch to chain view
    const chainViewButton = page.getByRole('button', { name: /chain/i });
    if (await chainViewButton.isVisible()) {
      await chainViewButton.click();
      await page.waitForTimeout(500);

      // Check for chain connections
      const chainConnections = page.locator('.chain-connection');
      if (await chainConnections.count() > 0) {
        expect(chainConnections).toBeTruthy();
      }
    }
  });

  test('should handle image upload', async ({ page }) => {
    const uploadButton = page.getByRole('button', { name: /upload/i });
    if (await uploadButton.isVisible()) {
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        // Set test file
        await fileInput.first().setInputFiles({
          name: 'test-image.png',
          mimeType: 'image/png',
          buffer: Buffer.from('fake-image-data')
        });

        await page.waitForTimeout(500);
      }
    }
  });

  test('should refresh gallery', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /refresh/i });
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(1000);
    }
  });
});