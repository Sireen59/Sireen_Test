import { test, expect } from '@playwright/test';

test.describe('Planner seed', () => {
  test('opens DemoQA practice form', async ({ page }) => {
    await page.goto('https://demoqa.com/automation-practice-form');
    await expect(page.getByText('Student Registration Form')).toBeVisible();
  });
});
