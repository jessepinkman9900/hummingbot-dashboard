import { test, expect } from '@playwright/test';

test.describe('Market Data Page', () => {
  test('should load market data page with form and chart container', async ({
    page,
  }) => {
    // Navigate to market data page
    await page.goto('/market');

    // Check page title and header
    await expect(page.locator('h1')).toContainText('Market Data Analysis');

    // Check form elements are present
    await expect(
      page.locator('label:text("Exchange Connector")')
    ).toBeVisible();
    await expect(page.locator('label:text("Trading Pair")')).toBeVisible();
    await expect(page.locator('label:text("Time Interval")')).toBeVisible();
    await expect(page.locator('label:text("Number of Records")')).toBeVisible();

    // Check submit button is present
    await expect(page.locator('button:text("Load Chart Data")')).toBeVisible();

    // Check chart container exists
    await expect(page.locator('text="Market Chart"')).toBeVisible();

    // Check empty state message
    await expect(
      page.locator('text="Select configuration and click"')
    ).toBeVisible();
  });

  test('should show form validation errors for empty fields', async ({
    page,
  }) => {
    await page.goto('/market');

    // Try to submit without filling required fields
    await page.click('button:text("Load Chart Data")');

    // Should show validation errors
    await expect(
      page.locator('text="Please select a connector"')
    ).toBeVisible();
    await expect(
      page.locator('text="Please enter a trading pair"')
    ).toBeVisible();
  });

  test('should allow filling form with valid data', async ({ page }) => {
    await page.goto('/market');

    // Fill form with valid data
    await page.selectOption('[placeholder="Select connector"]', 'binance');
    await page.fill('[placeholder="e.g., BTC-USDT"]', 'BTC-USDT');
    await page.selectOption('select >> nth=1', '1h');

    // Submit button should be enabled and not show validation errors
    await expect(page.locator('button:text("Load Chart Data")')).toBeEnabled();
  });
});
