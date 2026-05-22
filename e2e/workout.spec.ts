import { test, expect } from '@playwright/test';

test.describe('Workout Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const demoButton = page.getByRole('button', { name: 'Explore Demo App' });
    await demoButton.click();
    await page.waitForTimeout(1000);
    await page.goto('/(tabs)/workout');
    await page.waitForTimeout(1000);
  });

  test('should display workout screen header', async ({ page }) => {
    await expect(page.getByText('Workout')).toBeVisible();
  });

  test('should have today and plan tabs', async ({ page }) => {
    await expect(page.getByText("Today's Session")).toBeVisible();
    await expect(page.getByText('Full Plan')).toBeVisible();
  });

  test('should display today session card', async ({ page }) => {
    await expect(page.getByText('TODAY')).toBeVisible();
    await expect(page.getByText(/exercises/)).toBeVisible();
  });

  test('should display start session button', async ({ page }) => {
    await expect(page.getByText('Start Session')).toBeVisible();
  });

  test('should switch to plan tab', async ({ page }) => {
    await page.getByText('Full Plan').click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/training days/)).toBeVisible();
  });

  test('should display plan days', async ({ page }) => {
    await page.getByText('Full Plan').click();
    await page.waitForTimeout(500);
    const planCards = page.locator('[class*="planDay"]');
    await expect(planCards.first()).toBeVisible();
  });

  test('should display recent training history', async ({ page }) => {
    await expect(page.getByText('Recent Training History')).toBeVisible();
    await expect(page.getByText(/sessions completed this week/)).toBeVisible();
  });

  test('should display adherence percentage', async ({ page }) => {
    await expect(page.getByText(/adherence/)).toBeVisible();
  });

  test('should open plan day detail modal', async ({ page }) => {
    await page.getByText('Full Plan').click();
    await page.waitForTimeout(500);
    const firstDayCard = page.locator('[class*="planDay"]').first();
    await firstDayCard.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Close')).toBeVisible();
  });

  test('should display exercise details in modal', async ({ page }) => {
    await page.getByText('Full Plan').click();
    await page.waitForTimeout(500);
    const firstDayCard = page.locator('[class*="planDay"]').first();
    await firstDayCard.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Exercises')).toBeVisible();
    await expect(page.getByText('Focus Areas')).toBeVisible();
  });

  test('should close plan day modal', async ({ page }) => {
    await page.getByText('Full Plan').click();
    await page.waitForTimeout(500);
    const firstDayCard = page.locator('[class*="planDay"]').first();
    await firstDayCard.click();
    await page.waitForTimeout(500);
    await page.getByText('Close').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Exercises')).not.toBeVisible();
  });
});
