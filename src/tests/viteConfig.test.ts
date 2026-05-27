import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('vite production bundle config', () => {
  it('keeps Phaser split into a production chunk without the default warning budget', () => {
    const configPath = join(process.cwd(), 'vite.config.ts');
    const configSource = readFileSync(configPath, 'utf8');

    expect(configSource).toContain('chunkSizeWarningLimit: 2000');
    expect(configSource).toContain("id.includes('/node_modules/phaser/')");
    expect(configSource).toContain("return 'phaser'");
  });
});
