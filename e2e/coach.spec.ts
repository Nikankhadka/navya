import { test, expect } from '@playwright/test';

test.describe('Coach Messaging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const demoButton = page.getByRole('button', { name: 'Explore Demo App' });
    await demoButton.click();
    await page.waitForTimeout(1000);
    await page.goto('/(tabs)/coach');
    await page.waitForTimeout(1000);
  });

  test('should display coach screen header', async ({ page }) => {
    await expect(page.getByText('AI Coach')).toBeVisible();
  });

  test('should display coach status', async ({ page }) => {
    await expect(page.getByText(/Active|Offline/)).toBeVisible();
  });

  test('should display message input', async ({ page }) => {
    await expect(page.getByPlaceholder(/Ask your coach/)).toBeVisible();
    await expect(page.getByText('↑')).toBeVisible();
  });

  test('should display quick reply suggestions', async ({ page }) => {
    const quickReplies = page.locator('[class*="quickReply"]');
    await expect(quickReplies.first()).toBeVisible();
  });

  test('should have send button', async ({ page }) => {
    const sendButton = page.getByText('↑');
    await expect(sendButton).toBeVisible();
  });

  test('should allow typing in message input', async ({ page }) => {
    const input = page.getByPlaceholder(/Ask your coach/);
    await input.fill('Test message');
    await expect(input).toHaveValue('Test message');
  });

  test('should display message bubbles if messages exist', async ({ page }) => {
    await page.waitForTimeout(1000);
    const bubbles = page.locator('[class*="bubble"]');
    const count = await bubbles.count();
    if (count > 0) {
      await expect(bubbles.first()).toBeVisible();
    }
  });
});
