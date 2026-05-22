import { test, expect } from '@playwright/test';

test.describe('Home Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const demoButton = page.getByRole('button', { name: 'Explore Demo App' });
    await demoButton.click();
    await page.waitForTimeout(1000);
    await page.goto('/(tabs)');
    await page.waitForTimeout(1000);
  });

  test('should display greeting header', async ({ page }) => {
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
    await expect(page.getByText(/Athlete/)).toBeVisible();
  });

  test('should display streak chip', async ({ page }) => {
    await expect(page.getByText(/day streak/)).toBeVisible();
    await expect(page.getByText('🔥')).toBeVisible();
  });

  test('should display weekly activity row', async ({ page }) => {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (const day of weekDays) {
      await expect(page.getByText(day)).toBeVisible();
    }
  });

  test('should display today\'s session card', async ({ page }) => {
    await expect(page.getByText("Today's Session")).toBeVisible();
    await expect(page.getByText(/View Plan/)).toBeVisible();
    await expect(page.getByText(/Start Workout|Continue Workout|Open Workout/)).toBeVisible();
  });

  test('should display nutrition today card', async ({ page }) => {
    await expect(page.getByText('Nutrition Today')).toBeVisible();
    await expect(page.getByText(/Log Food/)).toBeVisible();
    await expect(page.getByText(/kcal/)).toBeVisible();
  });

  test('should display macro breakdown', async ({ page }) => {
    await expect(page.getByText('Protein')).toBeVisible();
    await expect(page.getByText('Carbs')).toBeVisible();
    await expect(page.getByText('Fat')).toBeVisible();
  });

  test('should display hydration section', async ({ page }) => {
    await expect(page.getByText('Hydration')).toBeVisible();
    await expect(page.getByText(/of.*target/)).toBeVisible();
  });

  test('should display progress & adherence card', async ({ page }) => {
    await expect(page.getByText('Progress & Adherence')).toBeVisible();
    await expect(page.getByText(/Current weight/)).toBeVisible();
    await expect(page.getByText(/Weekly adherence/)).toBeVisible();
  });

  test('should display AI coach card', async ({ page }) => {
    await expect(page.getByText('AI Coach')).toBeVisible();
    await expect(page.getByText('Daily Insight')).toBeVisible();
    await expect(page.getByText(/Chat with coach/)).toBeVisible();
  });

  test('should navigate to nutrition tab', async ({ page }) => {
    await page.getByText('Log Food').click();
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toContain('nutrition');
  });

  test('should navigate to workout tab', async ({ page }) => {
    await page.getByText('View Plan').click();
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toContain('workout');
  });

  test('should navigate to profile tab', async ({ page }) => {
    await page.getByText('View Profile').click();
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toContain('profile');
  });

  test('should navigate to coach tab', async ({ page }) => {
    await page.getByText('Chat with coach').click();
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toContain('coach');
  });
});
