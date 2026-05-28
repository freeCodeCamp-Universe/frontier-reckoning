import { expect, test, type Page } from '@playwright/test';
import {
  buySupply,
  enterCamp,
  forceSeed,
  resolveCurrentEvent,
  startNewGame,
  travelDays,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
});

test('starts a new expedition', async ({ page }) => {
  await forceSeed(page, 0.99);
  await startNewGame(page, {
    expeditionName: 'MVP Trail Crew',
    difficulty: 'Greenhorn',
  });

  await expect(page.getByText(/MVP Trail Crew \/ Greenhorn/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
});

test('travels several days and resolves a random event', async ({ page }) => {
  await forceSeed(page, 0.01);
  await startNewGame(page);

  await travelDays(page, 2);
  await expect(page.getByRole('dialog')).toBeVisible();
  await resolveCurrentEvent(page);
  await expect(page.getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
});

test('enters camp and hunts', async ({ page }) => {
  await forceSeed(page, 0.99);
  await startNewGame(page);

  await enterCamp(page);
  await page.getByRole('button', { name: 'Start hunting mini-game' }).click();
  await expect(page.getByLabel('Hunting mini-game')).toBeVisible();
  await expect(
    page.locator('section[aria-label="Hunting mini-game"]').getByText('hunting range'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Resume travel' }).click();
  await expect(page.getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
});

test('visits a town, buys supplies, and triggers a river crossing', async ({ page }) => {
  await forceSeed(page, 0.99);
  await startNewGame(page, { difficulty: 'Greenhorn' });

  await travelUntilHeading(page, /Ash Hollow/);
  await buySupply(page, 'Food');
  await expect(
    page.locator('section[aria-label="Town"]').getByText(/Bought 25 food/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Resume trail' }).click();

  await travelUntilHeading(page, /Blackwater Crossing/);
  await expect(page.getByRole('heading', { name: 'Blackwater Crossing' })).toBeVisible();
  await resolveRiverCrossing(page);
  await expect(page.getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
});

test('saves, reloads, and continues', async ({ page }) => {
  await forceSeed(page, 0.99);
  await startNewGame(page, {
    expeditionName: 'Saved Trail Crew',
    difficulty: 'Greenhorn',
  });

  await travelDays(page, 1);
  await page.getByRole('button', { name: 'Save game' }).click();
  await expect(page.getByText('Game saved.')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText(/Saved Trail Crew \/ Greenhorn/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
});

test('reaches victory or game over with a deterministic seed', async ({ page }) => {
  await forceSeed(page, 0.99);
  await startNewGame(page, {
    expeditionName: 'Last Mile Crew',
    difficulty: 'Greenhorn',
  });

  await playUntilEnding(page);

  await expect(page.getByRole('heading', { name: /Victory|Game Over/ })).toBeVisible();
});

async function travelUntilHeading(page: Page, headingName: RegExp) {
  for (let day = 0; day < 35; day += 1) {
    if (await page.getByRole('heading', { name: headingName }).isVisible()) {
      return;
    }

    await travelDays(page, 1);

    if (await page.getByRole('dialog').isVisible()) {
      await resolveCurrentEvent(page);
    }
  }

  await expect(page.getByRole('heading', { name: headingName })).toBeVisible();
}

async function resolveRiverCrossing(page: Page) {
  const ferry = page.getByRole('button', { name: 'Hire a ferry' });
  const ford = page.getByRole('button', { name: 'Ford the river' });

  if ((await ferry.isVisible()) && (await ferry.isEnabled())) {
    await ferry.click();
  } else {
    await ford.click();
  }

  await page
    .locator('section[aria-label="River crossing"]')
    .getByRole('button', { name: 'Continue' })
    .click();
}

async function playUntilEnding(page: Page) {
  for (let turn = 0; turn < 140; turn += 1) {
    if (await page.getByRole('heading', { name: /Victory|Game Over/ }).isVisible()) {
      return;
    }

    if (await page.getByRole('dialog').isVisible()) {
      await resolveCurrentEvent(page);
      continue;
    }

    if (await page.locator('section[aria-label="Town"]').isVisible()) {
      await buyFoodWhilePossible(page);
      await page.getByRole('button', { name: 'Resume trail' }).click();
      continue;
    }

    if (await page.locator('section[aria-label="River crossing"]').isVisible()) {
      await resolveRiverCrossing(page);
      continue;
    }

    const travelButton = page.getByRole('button', { name: 'Travel One Day' });

    if (await travelButton.isEnabled()) {
      await travelButton.click();
    }
  }
}

async function buyFoodWhilePossible(page: Page) {
  const foodRow = page.getByRole('row', { name: /Food/i });
  const buyFoodButton = foodRow.getByRole('button', { name: 'Buy' });

  for (let purchase = 0; purchase < 6; purchase += 1) {
    if (!(await buyFoodButton.isEnabled())) {
      return;
    }

    await buyFoodButton.click();
  }
}
