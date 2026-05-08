import { expect, test } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.01;
  });
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Frontier Reckoning' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'New Expedition' })).toBeVisible();

  await page.getByRole('button', { name: 'New Expedition' }).click();
  await page.getByRole('button', { name: 'Start Custom Expedition' }).click();

  await expect(page.getByTestId('phaser-game')).toBeVisible();
  await page.getByRole('button', { name: 'Travel One Day' }).click();
  await page.getByRole('button', { name: 'Travel One Day' }).click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Event resolved')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeHidden();
});
