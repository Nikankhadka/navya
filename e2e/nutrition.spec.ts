import { test, expect } from '@playwright/test';

test.describe('Nutrition Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('login-demo-shortcut').click();
    await page.waitForURL(/\/(tabs)/);
    await page.goto('/(tabs)/nutrition');
  });

  test('should display nutrition screen header', async ({ page }) => {
    await expect(page.getByText('Nutrition')).toBeVisible();
    await expect(page.getByText(/Log Meal/)).toBeVisible();
  });

  test('should display date label', async ({ page }) => {
    const dateLabel = page.getByText(/\w+day, \d+ \w+/);
    await expect(dateLabel).toBeVisible();
  });

  test('should display macro rings', async ({ page }) => {
    await expect(page.getByText('Calories')).toBeVisible();
    await expect(page.getByText('Protein')).toBeVisible();
    await expect(page.getByText('Carbs')).toBeVisible();
    await expect(page.getByText('Fat')).toBeVisible();
  });

  test('should display remaining calories banner', async ({ page }) => {
    await expect(page.getByText(/kcal remaining today/)).toBeVisible();
  });

  test('should display hydration section', async ({ page }) => {
    await expect(page.getByText('Hydration')).toBeVisible();
    await expect(page.getByText(/Daily habit/)).toBeVisible();
  });

  test('should have quick add water buttons', async ({ page }) => {
    await expect(page.getByText('+250ml')).toBeVisible();
    await expect(page.getByText('+500ml')).toBeVisible();
    await expect(page.getByText('+750ml')).toBeVisible();
  });

  test('should display favorites section', async ({ page }) => {
    await expect(page.getByText('Favorites')).toBeVisible();
  });

  test('should display quick add section', async ({ page }) => {
    await expect(page.getByText('Quick Add')).toBeVisible();
    await expect(page.getByText('+ 200 kcal')).toBeVisible();
  });

  test('should display meal diary sections', async ({ page }) => {
    await expect(page.getByText("Today's Diary")).toBeVisible();
    await expect(page.getByText('Breakfast')).toBeVisible();
    await expect(page.getByText('Lunch')).toBeVisible();
    await expect(page.getByText('Dinner')).toBeVisible();
    await expect(page.getByText('Snack')).toBeVisible();
  });

  test('should open add meal modal', async ({ page }) => {
    await page.getByText('+ Log Meal').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Log a Meal')).toBeVisible();
    await expect(page.getByText('Manual')).toBeVisible();
  });

  test('should have manual meal form fields', async ({ page }) => {
    await page.getByText('+ Log Meal').click();
    await page.waitForTimeout(500);
    await page.getByText('Manual').click();
    await page.waitForTimeout(500);
    await expect(page.getByPlaceholder(/meal name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/calories/i)).toBeVisible();
    await expect(page.getByPlaceholder(/protein/i)).toBeVisible();
    await expect(page.getByPlaceholder(/carbs/i)).toBeVisible();
    await expect(page.getByPlaceholder(/fat/i)).toBeVisible();
  });

  test('should have meal time selector', async ({ page }) => {
    await page.getByText('+ Log Meal').click();
    await page.waitForTimeout(500);
    await page.getByText('Manual').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Breakfast')).toBeVisible();
    await expect(page.getByText('Lunch')).toBeVisible();
    await expect(page.getByText('Dinner')).toBeVisible();
    await expect(page.getByText('Snack')).toBeVisible();
  });

  test('should have save meal button', async ({ page }) => {
    await page.getByText('+ Log Meal').click();
    await page.waitForTimeout(500);
    await page.getByText('Manual').click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: 'Save Meal' })).toBeVisible();
  });

  test('should close modal', async ({ page }) => {
    await page.getByText('+ Log Meal').click();
    await page.waitForTimeout(500);
    await page.getByText('Close').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Log a Meal')).not.toBeVisible();
  });

  test('should allow quick add calories', async ({ page }) => {
    const quickAddButton = page.getByText('+ 200 kcal');
    await expect(quickAddButton).toBeVisible();
    await quickAddButton.click();
    await page.waitForTimeout(500);
  });
});
