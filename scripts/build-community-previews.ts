/**
 * Writes metadata.json and preview.svg for every community package from its
 * resolved style — the preview is rendered from the tokens, never hand-drawn.
 *
 *   npm run registry:previews
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { communityPackages } from '../src/styles';
import { renderStylePreviewSvg } from '../src/engine/preview';

const root = resolve(import.meta.dirname ?? '.', '..');

for (const pkg of communityPackages) {
  const dir = dirname(resolve(root, pkg.path));
  const m = pkg.style.metadata;
  const metadata = {
    id: m.id, name: m.name, author: m.author, version: m.version, license: m.license,
    category: m.category, description: m.description, tags: m.tags, path: pkg.path, repository: pkg.repository
  };
  writeFileSync(resolve(dir, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
  writeFileSync(resolve(dir, 'preview.svg'), renderStylePreviewSvg(pkg.style) + '\n');
  console.log(`${pkg.path.replace(/style\.json$/, '')}: metadata.json, preview.svg`);
}
