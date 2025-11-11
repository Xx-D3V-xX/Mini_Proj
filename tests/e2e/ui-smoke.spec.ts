import { test, expect } from '@playwright/test';

test('homepage loads & no severe console errors (visible DevTools)', async ({ page, baseURL }) => {
  const consoleMessages: any[] = [];
  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));

  await page.goto(baseURL!);
  await expect(page).toHaveTitle(/MumbAI Trails/i);

  // TODO: Replace with real selectors for your app:
  // await expect(page.getByTestId('landing-hero')).toBeVisible();

  await page.waitForTimeout(800); // allow late logs
  const fs = await import('fs');
  fs.writeFileSync(process.env.CONSOLE_OUT!, JSON.stringify(consoleMessages, null, 2), 'utf-8');

  const hasSevere = consoleMessages.some(m => m.type === 'error');
  expect(hasSevere, 'no console.error in DevTools').toBeFalsy();
});

test('basic search flow works', async ({ page, baseURL }) => {
  await page.goto(baseURL!);
  // TODO: Replace with actual selectors:
  // await page.getByPlaceholder('Search places').fill('museum');
  // await page.keyboard.press('Enter');
  // await expect(page.getByTestId('search-result-item').first()).toBeVisible();
});
