import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('main menu has no automatically detectable accessibility violations', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Frontier Reckoning' })).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
