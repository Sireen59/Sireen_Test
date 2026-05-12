import { test, expect } from '@playwright/test';
import { dismissBlockingOverlays, registerBookStoreUser, uniqueUserName } from './support/demoqa-helpers';

const DEFAULT_PASSWORD = 'TestPass1!';

test.describe('Book Store login and registration', () => {
  test('login page shows username, password, and actions', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#userName')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New User', exact: true })).toBeVisible();
  });

  test('invalid credentials show validation feedback', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#userName').fill('nonexistent_user_xyz');
    await page.locator('#password').fill('WrongPass1!');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByText(/invalid username or password/i)).toBeVisible();
  });

  test('successful login after API user creation lands on profile', async ({ page, request }) => {
    const userName = uniqueUserName();
    await registerBookStoreUser(request, userName, DEFAULT_PASSWORD);

    await page.goto('/login');
    await page.locator('#userName').fill(userName);
    await page.locator('#password').fill(DEFAULT_PASSWORD);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.locator('#userName-value')).toContainText(userName);
  });

  test('register page: empty submit shows required field errors', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Register', exact: true }).click();
    await expect(page.locator('#firstname.is-invalid')).toBeVisible();
    await expect(page.locator('#lastname.is-invalid')).toBeVisible();
    await expect(page.locator('#userName.is-invalid')).toBeVisible();
    await expect(page.locator('#password.is-invalid')).toBeVisible();
  });

  test('register page: filled form requires reCAPTCHA (cannot complete in automation)', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#firstname').fill('Auto');
    await page.locator('#lastname').fill('Test');
    await page.locator('#userName').fill(uniqueUserName('reg'));
    await page.locator('#password').fill(DEFAULT_PASSWORD);
    await page.getByRole('button', { name: 'Register', exact: true }).click();
    await expect(page.getByText(/verify recaptcha/i)).toBeVisible();
  });

  test('register page: Back to Login navigates to login', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Back to Login' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
  });

  test('New User from login opens register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'New User', exact: true }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'Register', exact: true })).toBeVisible();
  });
});

test.describe('Text Box form submit', () => {
  test('submits Text Box form and shows output', async ({ page }) => {
    await page.goto('/text-box');
    const name = uniqueUserName('tb');
    await page.locator('#userName').fill(name);
    await page.locator('#userEmail').fill(`${name}@example.com`);
    await page.locator('#currentAddress').fill('1 Demo Street');
    await page.locator('#permanentAddress').fill('2 Permanent Ave');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('#name')).toContainText(name);
    await expect(page.locator('#email')).toContainText(`${name}@example.com`);
  });
});

test.describe('Logged-in navigation', () => {
  test('from profile, Book Store link opens books', async ({ page, request }) => {
    const userName = uniqueUserName();
    await registerBookStoreUser(request, userName, DEFAULT_PASSWORD);
    await page.goto('/login');
    await page.locator('#userName').fill(userName);
    await page.locator('#password').fill(DEFAULT_PASSWORD);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page).toHaveURL(/\/profile$/);

    await page.getByRole('link', { name: 'Book Store', exact: true }).click();
    await expect(page).toHaveURL(/\/books$/);
    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible();
  });
});
