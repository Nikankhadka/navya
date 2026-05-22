import { test, expect } from '@playwright/test';

test.describe('Profile & Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const demoButton = page.getByRole('button', { name: 'Explore Demo App' });
    await demoButton.click();
    await page.waitForTimeout(1000);
    await page.goto('/(tabs)/profile');
    await page.waitForTimeout(1000);
  });

  test('should display profile screen', async ({ page }) => {
    await expect(page.getByText(/Navya User/)).toBeVisible();
  });

  test('should display demo session badge', async ({ page }) => {
    await expect(page.getByText('Demo Session')).toBeVisible();
  });

  test('should display stats grid', async ({ page }) => {
    await expect(page.getByText('Sessions')).toBeVisible();
    await expect(page.getByText('Streak')).toBeVisible();
    await expect(page.getByText('Adherence')).toBeVisible();
    await expect(page.getByText('Avg Session')).toBeVisible();
  });

  test('should display body metrics', async ({ page }) => {
    await expect(page.getByText('Body Metrics')).toBeVisible();
    await expect(page.getByText('Weight')).toBeVisible();
    await expect(page.getByText('Height')).toBeVisible();
    await expect(page.getByText('BMI')).toBeVisible();
  });

  test('should display progress check-ins', async ({ page }) => {
    await expect(page.getByText('Progress Check-ins')).toBeVisible();
    await expect(page.getByText('Log Weight')).toBeVisible();
  });

  test('should display setup list', async ({ page }) => {
    await expect(page.getByText('My Setup')).toBeVisible();
    await expect(page.getByText('Goal')).toBeVisible();
    await expect(page.getByText('Activity Level')).toBeVisible();
    await expect(page.getByText('Workouts / week')).toBeVisible();
  });

  test('should have edit profile button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Edit Profile/ })).toBeVisible();
  });

  test('should have log weight button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Log Weight/ })).toBeVisible();
  });

  test('should have sign out button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Sign Out|Exit Demo/ })).toBeVisible();
  });

  test('should open edit profile modal', async ({ page }) => {
    await page.getByRole('button', { name: /Edit Profile/ }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Edit Profile')).toBeVisible();
    await expect(page.getByText('Full Name')).toBeVisible();
    await expect(page.getByText('Goal')).toBeVisible();
    await expect(page.getByText('Weight (kg)')).toBeVisible();
    await expect(page.getByText('Height (cm)')).toBeVisible();
  });

  test('should close edit profile modal', async ({ page }) => {
    await page.getByRole('button', { name: /Edit Profile/ }).click();
    await page.waitForTimeout(500);
    await page.getByText('Close').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Edit Profile')).not.toBeVisible();
  });

  test('should open weight check-in modal', async ({ page }) => {
    await page.getByRole('button', { name: /Log Weight/ }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Log Weight Check-in')).toBeVisible();
    await expect(page.getByPlaceholder(/weight/i)).toBeVisible();
  });

  test('should close weight check-in modal', async ({ page }) => {
    await page.getByRole('button', { name: /Log Weight/ }).click();
    await page.waitForTimeout(500);
    await page.getByText('Close').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Log Weight Check-in')).not.toBeVisible();
  });

  test('should display theme toggle', async ({ page }) => {
    await expect(page.getByText('Appearance')).toBeVisible();
    await expect(page.getByRole('button', { name: /theme/i })).toBeVisible();
  });

  test('should have notification settings button (coming soon)', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Notification/ })).toBeVisible();
  });

  test('should have regenerate workout plan button (coming soon)', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Regenerate/ })).toBeVisible();
  });
});
