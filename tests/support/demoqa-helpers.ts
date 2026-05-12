import type { APIRequestContext, Page } from '@playwright/test';

export const DEMOQA_BASE = 'https://demoqa.com';

export function uniqueUserName(prefix = 'pw'): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export async function registerBookStoreUser(
  request: APIRequestContext,
  userName: string,
  password: string
): Promise<void> {
  const res = await request.post(`${DEMOQA_BASE}/Account/v1/User`, {
    data: { userName, password },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok()) {
    const text = await res.text();
    throw new Error(`Account create failed: ${res.status()} ${text}`);
  }
}

/** Dismiss promo / cookie overlays that block clicks on DemoQA. */
export async function dismissBlockingOverlays(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Close' }).click({ timeout: 2000 }).catch(() => {});
}
