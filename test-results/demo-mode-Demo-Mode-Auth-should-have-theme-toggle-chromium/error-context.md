# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo-mode.spec.ts >> Demo Mode & Auth >> should have theme toggle
- Location: e2e/demo-mode.spec.ts:27:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /theme/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /theme/i })

```

```yaml
- button " Light"
- button " Dark"
- text: Navya Enter your email and we'll send you a one-time sign-in link. No password needed. Email
- textbox "you@example.com"
- text: Send Email Link
- button "Demo mode"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Demo Mode & Auth', () => {
  4  |   test('should load login screen', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await expect(page).toHaveTitle(/Navya/);
  7  |     await expect(page.getByText('Navya')).toBeVisible();
  8  |     await expect(page.getByText("Enter your email and we'll send you a one-time sign-in link")).toBeVisible();
  9  |   });
  10 | 
  11 |   test('should have email input and send link button', async ({ page }) => {
  12 |     await page.goto('/');
  13 |     await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  14 |     await expect(page.getByRole('button', { name: 'Send Email Link' })).toBeVisible();
  15 |   });
  16 | 
  17 |   test('should have demo mode entry point', async ({ page }) => {
  18 |     await page.goto('/');
  19 |     const demoButton = page.getByRole('button', { name: 'Explore Demo App' });
  20 |     await expect(demoButton).toBeVisible();
  21 |     await demoButton.click();
  22 |     await page.waitForTimeout(1000);
  23 |     const url = page.url();
  24 |     expect(url).toContain('tabs');
  25 |   });
  26 | 
  27 |   test('should have theme toggle', async ({ page }) => {
  28 |     await page.goto('/');
> 29 |     await expect(page.getByRole('button', { name: /theme/i })).toBeVisible();
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  30 |   });
  31 | });
  32 | 
```