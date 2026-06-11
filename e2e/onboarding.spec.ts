import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('login-demo-shortcut').click();
    await page.waitForURL(/\/(tabs)/);
  });

  test('should navigate through onboarding screens', async ({ page }) => {
    await page.waitForURL(/\/welcome/);
    await expect(page.getByText('Welcome to Navya')).toBeVisible();
  });

  test('should have all onboarding steps', async ({ page }) => {
    const screens = ['welcome', 'basics', 'body', 'goal', 'preferences', 'complete'];
    for (const screen of screens) {
      await page.goto(`/(onboarding)/${screen}`);
      await page.waitForTimeout(500);
      const url = page.url();
      expect(url).toContain(screen);
    }
  });

  test('should validate basics screen inputs', async ({ page }) => {
    await page.goto('/(onboarding)/basics');
    await page.waitForTimeout(500);
    await expect(page.getByPlaceholder(/name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/age/i)).toBeVisible();
  });

  test('should validate body screen inputs', async ({ page }) => {
    await page.goto('/(onboarding)/body');
    await page.waitForTimeout(500);
    await expect(page.getByPlaceholder(/weight/i)).toBeVisible();
    await expect(page.getByPlaceholder(/height/i)).toBeVisible();
  });

  test('should show goal selection', async ({ page }) => {
    await page.goto('/(onboarding)/goal');
    await page.waitForTimeout(500);
    await expect(page.getByText(/goal/i)).toBeVisible();
  });

  test('should show preferences screen', async ({ page }) => {
    await page.goto('/(onboarding)/preferences');
    await page.waitForTimeout(500);
    await expect(page.getByText(/workout/i)).toBeVisible();
  });

  test('should show completion screen', async ({ page }) => {
    await page.goto('/(onboarding)/complete');
    await page.waitForTimeout(500);
    await expect(page.getByText(/complete/i)).toBeVisible();
  });
});
