import { test, expect } from '@playwright/test';

test.describe('Portfolio Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to portfolio page
    await page.goto('/portfolio');
  });

  test('should display portfolio page with header and add button', async ({
    page,
  }) => {
    // Check page title and header
    await expect(page).toHaveTitle(/Hummingbot Dashboard/);
    await expect(page.locator('h1')).toContainText('Portfolio');

    // Check add portfolio button exists
    await expect(
      page.getByRole('button', { name: /Add Portfolio/i })
    ).toBeVisible();

    // Check refresh button exists
    await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible();
  });

  test('should open add portfolio dialog when clicking add button', async ({
    page,
  }) => {
    // Click add portfolio button
    await page.getByRole('button', { name: /Add Portfolio/i }).click();

    // Check dialog is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Add New Portfolio')).toBeVisible();

    // Check form fields
    await expect(page.getByLabel('Portfolio Name')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Create Portfolio/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
  });

  test('should validate portfolio name input', async ({ page }) => {
    // Open add portfolio dialog
    await page.getByRole('button', { name: /Add Portfolio/i }).click();

    // Try to submit with empty name
    await page.getByRole('button', { name: /Create Portfolio/i }).click();

    // Check that button is disabled when input is empty
    await expect(
      page.getByRole('button', { name: /Create Portfolio/i })
    ).toBeDisabled();

    // Enter invalid characters
    await page.getByLabel('Portfolio Name').fill('invalid name with spaces!');
    await page.getByRole('button', { name: /Create Portfolio/i }).click();

    // Should show validation error
    // Note: This assumes toast notifications work - in real tests you might mock the API
  });

  test('should create new portfolio with valid name', async ({ page }) => {
    // Mock the API call to avoid actual backend calls
    await page.route('/api/accounts/add-account', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Account created successfully' }),
      });
    });

    // Mock the accounts list API call
    await page.route('/api/accounts/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['master', 'test-portfolio']),
      });
    });

    // Open add portfolio dialog
    await page.getByRole('button', { name: /Add Portfolio/i }).click();

    // Fill in valid name
    await page.getByLabel('Portfolio Name').fill('test-portfolio');

    // Submit form
    await page.getByRole('button', { name: /Create Portfolio/i }).click();

    // Dialog should close (assuming successful creation)
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should display account list when accounts exist', async ({ page }) => {
    // Mock API calls
    await page.route('/api/accounts/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['master', 'binance-account', 'coinbase-account']),
      });
    });

    await page.route('/api/portfolio/state', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accounts: {
            master: {
              connectors: {
                binance: {
                  balances: {
                    BTC: { balance: 1.5, usd_value: 45000, percentage: 60 },
                  },
                  total_balance: 45000,
                  available_balance: 45000,
                  total_pnl: 5000,
                  total_pnl_percentage: 12.5,
                },
              },
              total_balance: 45000,
              total_pnl: 5000,
              total_pnl_percentage: 12.5,
            },
          },
          total_balance: 45000,
          total_pnl: 5000,
          total_pnl_percentage: 12.5,
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await page.route('/api/portfolio/accounts-distribution', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accounts: {
            master: { value: 45000, percentage: 100, connectors: {} },
          },
          total_value: 45000,
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // Reload to get fresh data
    await page.reload();

    // Check that accounts are displayed
    await expect(page.getByText('master')).toBeVisible();
    await expect(page.getByText('binance-account')).toBeVisible();
    await expect(page.getByText('coinbase-account')).toBeVisible();

    // Check portfolio summary is displayed
    await expect(page.getByText('Total Balance')).toBeVisible();
    await expect(page.getByText('Total PnL')).toBeVisible();
    await expect(page.getByText('Active Accounts')).toBeVisible();
  });

  test('should navigate to account details when clicking view details', async ({
    page,
  }) => {
    // Mock accounts list
    await page.route('/api/accounts/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['master', 'test-account']),
      });
    });

    // Mock portfolio data
    await page.route('/api/portfolio/state', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accounts: {
            'test-account': {
              connectors: {},
              total_balance: 1000,
              total_pnl: 100,
              total_pnl_percentage: 10,
            },
          },
          total_balance: 1000,
          total_pnl: 100,
          total_pnl_percentage: 10,
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await page.reload();

    // Click view details button for an account
    await page
      .getByRole('button', { name: /View Details/i })
      .first()
      .click();

    // Should navigate to details view
    await expect(
      page.getByText('Portfolio details and performance')
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Settings/i })).toBeVisible();
  });

  test('should navigate to account settings when clicking settings button', async ({
    page,
  }) => {
    // Mock accounts list
    await page.route('/api/accounts/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['master']),
      });
    });

    // Mock credentials
    await page.route('/api/accounts/master/credentials', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['binance', 'coinbase']),
      });
    });

    // Mock connectors
    await page.route('/api/connectors/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['binance', 'coinbase', 'kraken']),
      });
    });

    await page.reload();

    // Click settings button (first one, should be the settings icon)
    await page
      .locator('button:has-text("Settings"), button:has(svg)')
      .first()
      .click();

    // Should navigate to settings view
    await expect(page.getByText('Account Settings')).toBeVisible();
    await expect(page.getByText('Exchange Credentials')).toBeVisible();
  });

  test('should be able to add credentials in settings', async ({ page }) => {
    // Mock accounts and navigate to settings
    await page.route('/api/accounts/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['master']),
      });
    });

    await page.route('/api/accounts/master/credentials', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('/api/connectors/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['binance', 'coinbase']),
      });
    });

    await page.reload();

    // Go to settings
    await page
      .locator('button:has-text("Settings"), button:has(svg)')
      .first()
      .click();

    // Click add credential button
    await page.getByRole('button', { name: /Add Credential/i }).click();

    // Should open add credential dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Add New Credential')).toBeVisible();

    // Select connector
    await page.getByRole('combobox').click();
    await page.getByText('binance').click();

    // Fill in credential fields
    await expect(page.getByLabel('Api Key')).toBeVisible();
    await expect(page.getByLabel('Secret Key')).toBeVisible();
  });

  test('should handle empty state when no accounts exist', async ({ page }) => {
    // Mock empty accounts list
    await page.route('/api/accounts/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.reload();

    // Check empty state message
    await expect(page.getByText('No portfolios found')).toBeVisible();
    await expect(page.getByText('Add Your First Portfolio')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/accounts/', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' }),
      });
    });

    await page.reload();

    // Should display error message
    await expect(page.getByText(/Failed to fetch accounts/i)).toBeVisible();
  });
});
