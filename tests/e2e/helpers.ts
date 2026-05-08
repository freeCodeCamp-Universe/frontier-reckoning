import { expect, type Page } from '@playwright/test';

type StartNewGameOptions = {
  expeditionName?: string;
  difficulty?: 'Greenhorn' | 'Trailwise' | 'Reckoning';
};

export async function forceSeed(page: Page, seed: number | string) {
  const installSeed = (seedValue: number | string) => {
    const createRandom = () => {
      if (
        typeof seedValue === 'number' &&
        Number.isFinite(seedValue) &&
        seedValue > 0 &&
        seedValue < 1
      ) {
        return () => seedValue;
      }

      let value =
        typeof seedValue === 'number'
          ? Math.abs(Math.floor(seedValue)) || 1
          : Array.from(seedValue).reduce(
              (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
              0,
            ) || 1;

      value %= 0x7fffffff;

      if (value <= 0) {
        value += 0x7ffffffe;
      }

      return () => {
        value = (value * 48271) % 0x7fffffff;
        return (value - 1) / 0x7ffffffe;
      };
    };

    Math.random = createRandom();
  };

  await page.addInitScript(installSeed, seed);
  await page.evaluate(installSeed, seed).catch(() => undefined);
}

export async function startNewGame(page: Page, options: StartNewGameOptions = {}) {
  const expeditionName = options.expeditionName ?? 'Integration Trail Crew';
  const difficulty = options.difficulty ?? 'Trailwise';

  await page.goto('/');
  await page.getByRole('button', { name: 'New Expedition' }).click();
  await page.getByLabel('Expedition name').fill(expeditionName);
  await page.getByRole('radio', { name: new RegExp(difficulty) }).check();
  await page.getByRole('button', { name: 'Start Custom Expedition' }).click();

  await expect(page.getByRole('button', { name: 'Travel One Day' })).toBeEnabled();
  await expect(page.getByTestId('phaser-game')).toBeVisible();
}

export async function travelDays(page: Page, dayCount: number) {
  for (let day = 0; day < dayCount; day += 1) {
    const travelButton = page.getByRole('button', { name: 'Travel One Day' });

    await expect(travelButton).toBeEnabled();
    await travelButton.click();

    if (
      (await page.getByRole('dialog').isVisible()) ||
      (await page
        .getByRole('heading', {
          name: /Ash Hollow|Mercy Bend|Iron Post|Last Lantern|Blackwater Crossing|Red Fork River/,
        })
        .isVisible())
    ) {
      break;
    }
  }
}

export async function resolveCurrentEvent(page: Page) {
  const dialog = page.getByRole('dialog');

  await expect(dialog).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Event resolved')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
}

export async function enterCamp(page: Page) {
  await page.getByRole('button', { name: 'Make Camp' }).click();
  await expect(page.getByRole('heading', { name: 'Camp' })).toBeVisible();
}

export async function buySupply(page: Page, supplyName = 'Food') {
  const row = page.getByRole('row', { name: new RegExp(supplyName, 'i') });
  const buyButton = row.getByRole('button', { name: 'Buy' });

  await expect(buyButton).toBeEnabled();
  await buyButton.click();
}
