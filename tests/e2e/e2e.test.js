const { test, expect } = require('@playwright/test');

test.describe('Joyce Suites End-to-End Tests', () => {

    test('Admin Login and Dashboard', async ({ page }) => {
        await page.goto('/admin-login');

        // Fill login form
        await page.fill('#email', 'admin@joycesuites.com');
        await page.fill('#password', 'Admin@123456');
        await page.click('button[type="submit"]');

        // Check if redirected to dashboard
        await expect(page).toHaveURL(/\/admin\/dashboard/);

        // Verify dashboard elements
        await expect(page.locator('h1')).toContainText('Admin Dashboard');
        await expect(page.locator('button:has-text("Add Property")')).toBeVisible();
    });

    test('Tenant Login and Dashboard', async ({ page }) => {
        await page.goto('/login');

        // Fill login form
        await page.fill('#email', 'tenant@joycesuites.com');
        await page.fill('#password', 'Tenant@123456');
        await page.click('button[type="submit"]');

        // Check if redirected to dashboard
        await expect(page).toHaveURL(/(\/tenant\/dashboard|\/tenant\/lease-gate)/);

        // If redirected to dashboard, check elements
        if (page.url().includes('/tenant/dashboard')) {
            await expect(page.locator('h1')).toContainText('Tenant Dashboard');
        }
    });

    test('Caretaker Login and Dashboard', async ({ page }) => {
        await page.goto('/caretaker-login');

        // Fill login form
        await page.fill('#email', 'caretaker@joycesuites.com');
        await page.fill('#password', 'Caretaker@123456');
        await page.click('button[type="submit"]');

        // Check if redirected to dashboard
        await expect(page).toHaveURL(/\/caretaker\/dashboard/);

        // Verify dashboard elements
        await expect(page.locator('h1')).toContainText('Caretaker Dashboard');
    });

    test('Landing Page Navigation', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('h1')).toContainText('Joyce Suites');

        // Click on Admin Portal link if exists or navigate
        const adminLink = page.locator('button:has-text("Admin Board")');
        if (await adminLink.isVisible()) {
            await adminLink.click();
            await expect(page).toHaveURL(/\/admin-login/);
        }
    });
});
