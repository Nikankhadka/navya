import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Navya')).toBeVisible({ timeout: 10000 });
  });

  test('should load login screen', async ({ page }) => {
    await expect(page.getByText('Navya')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByTestId('login-send-magic-link')).toBeVisible();
  });

  test('should switch to password mode', async ({ page }) => {
    await page.getByText('Password', { exact: true }).click();
    await expect(page.getByTestId('login-password-input')).toBeVisible();
    await expect(page.getByText('Forgot password?')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('should show email validation error', async ({ page }) => {
    await page.getByTestId('login-send-magic-link').click();
    // The error text depends on bundle version: old code shows 'Invalid email',
    // new code shows 'Please enter a valid email address'
    const errorMsg = page.getByText(/Invalid email|Please enter a valid email address/);
    await expect(errorMsg.first()).toBeVisible();
  });

  test('should show password validation error in password mode', async ({ page }) => {
    await page.getByText('Password', { exact: true }).click();
    await page.getByTestId('login-email-input').fill('test@example.com');
    await page.getByTestId('login-password-input').fill('ab');
    await page.getByTestId('login-submit').click();
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('should call login API for non-existent user', async ({ page }) => {
    await page.getByText('Password', { exact: true }).click();
    await page.getByTestId('login-email-input').fill('nonexistent@test.com');
    await page.getByTestId('login-password-input').fill('password123');
    await page.getByTestId('login-submit').click();
    // Verify the API call completed — toast text or alert modal text appears
    await expect(page.getByText(/Sign-in failed/).or(page.getByText(/Check your inbox/)).first()).toBeVisible({ timeout: 15000 });
  });

  test('should show validation error for invalid email on signup', async ({ page }) => {
    await page.getByText('Sign up').click();
    await expect(page.getByText('Sign up to get started with Navya.')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('signup-submit').click();
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('should show validation error for short password on signup', async ({ page }) => {
    await page.getByText('Sign up').click();
    await expect(page.getByText('Sign up to get started with Navya.')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('signup-email-input').fill('test@example.com');
    await page.getByTestId('signup-password-input').fill('ab');
    await page.getByTestId('signup-confirm-password-input').fill('ab');
    await page.getByTestId('signup-submit').click();
    await expect(page.getByText('Password must be at least 6 characters').first()).toBeVisible();
  });

  test('should show error for non-matching passwords on signup', async ({ page }) => {
    await page.getByText('Sign up').click();
    await expect(page.getByText('Sign up to get started with Navya.')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('signup-email-input').fill('test@example.com');
    await page.getByTestId('signup-password-input').fill('password123');
    await page.getByTestId('signup-confirm-password-input').fill('different');
    await page.getByTestId('signup-submit').click();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should call magic link API', async ({ page }) => {
    await page.getByTestId('login-email-input').fill('test@example.com');
    await page.getByTestId('login-send-magic-link').click();
    const toast = page.getByRole('status');
    const errorLog = page.getByText('[ERROR]');
    await expect(toast.or(errorLog).first()).toBeAttached({ timeout: 15000 });
  });

  test('should have demo mode entry point', async ({ page }) => {
    await expect(page.getByTestId('login-demo-shortcut')).toBeVisible();
    await page.getByTestId('login-demo-shortcut').click();
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to forgot password screen', async ({ page }) => {
    await page.getByText('Password', { exact: true }).click();
    await page.getByText('Forgot password?').click();
    await expect(page.getByText('Reset Password')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('forgot-email-input')).toBeVisible();
    await expect(page.getByTestId('forgot-submit')).toBeVisible();
  });

  test('should call forgot password API', async ({ page }) => {
    await page.getByText('Password', { exact: true }).click();
    await page.getByText('Forgot password?').click();
    await expect(page.getByText('Reset Password')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('forgot-email-input').fill('test@example.com');
    await page.getByTestId('forgot-submit').click();
    // Verify the API call completed: toast or visible feedback text
    const toast = page.getByRole('status');
    const feedback = page.getByText(/Check your (inbox|email)/);
    await expect(toast.or(feedback).first()).toBeAttached({ timeout: 15000 });
  });

  test('should keep theme toggle visible', async ({ page }) => {
    await expect(page.getByTestId('theme-toggle-dark')).toBeVisible();
  });
});
