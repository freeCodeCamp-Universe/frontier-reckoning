import { expect, test } from '@playwright/test';
import { forceSeed, resolveCurrentEvent, startNewGame, travelDays } from './helpers';

test('homepage loads', async ({ page }) => {
  await forceSeed(page, 0.01);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Frontier Reckoning' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start Expedition' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Caravan status' })).toHaveCount(
    0,
  );
  await expect(page.getByText('Trail: Uncharted')).toHaveCount(0);

  await startNewGame(page);
  await expect(page.getByTestId('phaser-game')).toBeVisible();

  await travelDays(page, 2);
  await resolveCurrentEvent(page);
});
