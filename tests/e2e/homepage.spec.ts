import { expect, test } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Frontier Reckoning' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Start Expedition' }),
  ).toBeVisible();
  await expect(page.getByTestId('phaser-game')).toBeVisible();
});
