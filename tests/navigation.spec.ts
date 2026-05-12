import { test, expect, type Page } from '@playwright/test';
import { dismissBlockingOverlays } from './support/demoqa-helpers';

const TRACKER_HOST_RE =
  /(google-analytics\.com|googletagmanager\.com|doubleclick\.net|googlesyndication\.com|hotjar\.com|facebook\.net|scorecardresearch\.com)/i;

async function blockHeavyThirdParty(page: Page): Promise<void> {
  await page.route('**/*', (route) => {
    if (TRACKER_HOST_RE.test(route.request().url())) {
      return route.abort();
    }
    return route.continue();
  });
}

async function openHome(page: Page): Promise<void> {
  await blockHeavyThirdParty(page);
  // `load` can hang on third-party analytics; `domcontentloaded` is enough for card links.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await dismissBlockingOverlays(page);
}

test.describe('DemoQA navigation', () => {
  test('home loads and category cards link to main sections', async ({ page }) => {
    await openHome(page);
    // Href + .first(): avoids strict-mode failures when sidebar repeats the same routes on some builds/browsers.
    await expect(page.locator('a[href="/elements"]').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('a[href="/forms"]').first()).toBeVisible();
    await expect(page.locator('a[href="/books"]').first()).toBeVisible();
  });

  test('home → Elements → Text Box via sidebar', async ({ page }) => {
    await openHome(page);
    await page.locator('a[href="/elements"]').first().click();
    await expect(page).toHaveURL(/\/elements$/);
    await page.getByRole('listitem').getByRole('link', { name: 'Text Box' }).click();
    await expect(page).toHaveURL(/\/text-box$/);
    await expect(page.getByRole('heading', { name: 'Text Box' })).toBeVisible();
    await expect(page.locator('#userName')).toBeVisible();
  });

  test('home → Forms → Practice Form', async ({ page }) => {
    await openHome(page);
    await page.locator('a[href="/forms"]').first().click();
    await expect(page).toHaveURL(/\/forms$/);
    await page.getByRole('listitem').getByRole('link', { name: 'Practice Form' }).click();
    await expect(page).toHaveURL(/\/automation-practice-form$/);
    await expect(page.getByRole('heading', { name: 'Practice Form' })).toBeVisible();
  });

  test('home → Book Store → Login from sidebar', async ({ page }) => {
    await openHome(page);
    await page.locator('a[href="/books"]').first().click();
    await expect(page).toHaveURL(/\/books$/);
    await page.getByRole('listitem').getByRole('link', { name: 'Login', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
  });
});
