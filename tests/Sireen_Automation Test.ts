import { test, expect } from '@playwright/test';
import { dismissBlockingOverlays } from './support/demoqa-helpers';

test.describe('Automation Practice Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/automation-practice-form');
    await dismissBlockingOverlays(page);
  });

  test('incomplete form does not show submission confirmation', async ({ page }) => {
    await page.locator('#firstName').fill('Pat');
    await page.locator('#lastName').fill('Lee');
    await page.locator('#userEmail').fill('pat.lee@example.com');
    await page.getByText('Other', { exact: true }).click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByText('Thanks for submitting the form')).not.toBeVisible();
  });

  test('happy path: required fields submit and confirmation shows values', async ({ page }) => {
    await page.locator('#firstName').fill('Jane');
    await page.locator('#lastName').fill('Doe');
    await page.locator('#userEmail').fill('jane.doe@example.com');
    await page.getByText('Female', { exact: true }).click();
    await page.locator('#userNumber').fill('1234567890');
    await page.locator('#hobbies-checkbox-1').check({ force: true });
    await page.locator('#currentAddress').fill('123 Main Street');

    await page.getByRole('button', { name: 'Submit', exact: true }).click();

    await expect(page.getByText('Thanks for submitting the form')).toBeVisible();
    await expect(page.locator('td').filter({ hasText: 'Student Name' }).locator('..').locator('td').nth(1)).toHaveText(
      'Jane Doe'
    );
    await expect(page.locator('td').filter({ hasText: 'Student Email' }).locator('..').locator('td').nth(1)).toHaveText(
      'jane.doe@example.com'
    );
    await expect(page.locator('td').filter({ hasText: 'Gender' }).locator('..').locator('td').nth(1)).toHaveText(
      'Female'
    );
    await expect(page.locator('td').filter({ hasText: 'Mobile' }).locator('..').locator('td').nth(1)).toHaveText(
      '1234567890'
    );
    await expect(page.locator('td').filter({ hasText: 'Hobbies' }).locator('..').locator('td').nth(1)).toContainText(
      'Sports'
    );
  });
});
