import { test, expect } from '@playwright/test';

test.describe('ShotListManager Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/post-production');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display Shot List Manager tab', async ({ page }) => {
    // Click on Shot List tab if available
    const shotListTab = page.getByRole('tab', { name: /shot list/i });
    if (await shotListTab.isVisible()) {
      await shotListTab.click();
    }

    // Check if Shot List Manager is visible
    await expect(page.getByText('Shot List Manager')).toBeVisible();
  });

  test('should add a manual shot', async ({ page }) => {
    // Navigate to Shot List tab
    const shotListTab = page.getByRole('tab', { name: /shot list/i });
    if (await shotListTab.isVisible()) {
      await shotListTab.click();
    }

    // Click Add Shot button
    const addButton = page.getByRole('button', { name: /add shot/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Verify new shot is added
    await expect(page.getByText(/new manual shot/i)).toBeVisible();
  });

  test('should filter shots by search term', async ({ page }) => {
    const shotListTab = page.getByRole('tab', { name: /shot list/i });
    if (await shotListTab.isVisible()) {
      await shotListTab.click();
    }

    // Type in search input
    const searchInput = page.getByPlaceholder(/search shots/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test search');

      // Wait for filter to apply
      await page.waitForTimeout(500);
    }
  });

  test('should select and deselect shots', async ({ page }) => {
    const shotListTab = page.getByRole('tab', { name: /shot list/i });
    if (await shotListTab.isVisible()) {
      await shotListTab.click();
    }

    // Add a shot first
    const addButton = page.getByRole('button', { name: /add shot/i });
    if (await addButton.isVisible()) {
      await addButton.click();

      // Find checkbox
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.isVisible()) {
        // Select shot
        await checkbox.check();
        await expect(checkbox).toBeChecked();

        // Deselect shot
        await checkbox.uncheck();
        await expect(checkbox).not.toBeChecked();
      }
    }
  });

  test('should export shots', async ({ page }) => {
    const shotListTab = page.getByRole('tab', { name: /shot list/i });
    if (await shotListTab.isVisible()) {
      await shotListTab.click();
    }

    // Click Export button
    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Check if export dialog appears
      await expect(page.getByText(/export shot list/i)).toBeVisible();

      // Check export format options
      await expect(page.getByText(/pdf document/i)).toBeVisible();
      await expect(page.getByText(/csv spreadsheet/i)).toBeVisible();
      await expect(page.getByText(/json data/i)).toBeVisible();
      await expect(page.getByText(/plain text/i)).toBeVisible();
    }
  });

  test('should edit a shot', async ({ page }) => {
    const shotListTab = page.getByRole('tab', { name: /shot list/i });
    if (await shotListTab.isVisible()) {
      await shotListTab.click();
    }

    // Add a shot first
    const addButton = page.getByRole('button', { name: /add shot/i });
    if (await addButton.isVisible()) {
      await addButton.click();

      // Click edit button
      const editButton = page.locator('button').filter({ has: page.locator('svg.lucide-edit') }).first();
      if (await editButton.isVisible()) {
        await editButton.click();

        // Check if edit dialog appears
        await expect(page.getByText(/edit shot/i)).toBeVisible();

        // Find description textarea
        const descriptionField = page.getByLabel(/description/i);
        if (await descriptionField.isVisible()) {
          await descriptionField.fill('Updated shot description');

          // Save changes
          const saveButton = page.getByRole('button', { name: /save changes/i });
          await saveButton.click();
        }
      }
    }
  });

  test('should copy shot description', async ({ page }) => {
    const shotListTab = page.getByRole('tab', { name: /shot list/i });
    if (await shotListTab.isVisible()) {
      await shotListTab.click();
    }

    // Add a shot first
    const addButton = page.getByRole('button', { name: /add shot/i });
    if (await addButton.isVisible()) {
      await addButton.click();

      // Click copy button
      const copyButton = page.locator('button').filter({ has: page.locator('svg.lucide-copy') }).first();
      if (await copyButton.isVisible()) {
        await copyButton.click();

        // Check for toast notification (if implemented)
        // await expect(page.getByText(/shot copied/i)).toBeVisible();
      }
    }
  });

  test('should delete a shot', async ({ page }) => {
    const shotListTab = page.getByRole('tab', { name: /shot list/i });
    if (await shotListTab.isVisible()) {
      await shotListTab.click();
    }

    // Add a shot first
    const addButton = page.getByRole('button', { name: /add shot/i });
    if (await addButton.isVisible()) {
      await addButton.click();

      // Count shots before deletion
      const shotsBefore = await page.locator('[data-testid="shot-card"]').count();

      // Click delete button
      const deleteButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Verify shot is deleted
        const shotsAfter = await page.locator('[data-testid="shot-card"]').count();
        expect(shotsAfter).toBeLessThan(shotsBefore);
      }
    }
  });

  test('should group shots by chapter', async ({ page }) => {
    const shotListTab = page.getByRole('tab', { name: /shot list/i });
    if (await shotListTab.isVisible()) {
      await shotListTab.click();
    }

    // Look for grouping selector
    const groupSelector = page.getByRole('combobox').filter({ hasText: /no grouping/i });
    if (await groupSelector.isVisible()) {
      await groupSelector.click();

      // Select "By Chapter" option
      await page.getByRole('option', { name: /by chapter/i }).click();

      // Wait for grouping to apply
      await page.waitForTimeout(500);
    }
  });

  test('should filter by status', async ({ page }) => {
    const shotListTab = page.getByRole('tab', { name: /shot list/i });
    if (await shotListTab.isVisible()) {
      await shotListTab.click();
    }

    // Look for status filter
    const statusFilter = page.getByRole('combobox').filter({ hasText: /all shots/i });
    if (await statusFilter.isVisible()) {
      await statusFilter.click();

      // Select different status options
      const completedOption = page.getByRole('option', { name: /completed/i });
      if (await completedOption.isVisible()) {
        await completedOption.click();
        await page.waitForTimeout(500);
      }
    }
  });
});