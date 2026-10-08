import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The test DOM has no layout engine, so this guards the grid rule directly.
 * A hidden panel is display: none and leaves the grid, so the hidden layout
 * must start with the stage's flexible track. A leading 0px track for the
 * panel squeezes the stage to nothing on every page.
 */
describe('workspace layout', () => {
  const css = readFileSync(join(process.cwd(), 'src/components/layout/Workspace.css'), 'utf8');
  const tracks = (selector: string) => {
    const rule = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*grid-template-columns:\\s*([^;]+);`).exec(css);
    expect(rule, `${selector} sets grid-template-columns`).not.toBeNull();
    return rule![1].trim().split(/\s+(?![^(]*\))/);
  };

  it('gives the stage the first, flexible column when the panel is hidden', () => {
    const hidden = tracks('.ws-workspace--panel-hidden:not(.ws-workspace--narrow)');
    expect(hidden[0]).toMatch(/1fr/);
    expect(hidden).toHaveLength(2);
  });

  it('keeps a panel column, a flexible stage and a drawer column when the panel shows', () => {
    const open = tracks('.ws-workspace');
    expect(open).toHaveLength(3);
    expect(open[1]).toMatch(/1fr/);
  });
});
