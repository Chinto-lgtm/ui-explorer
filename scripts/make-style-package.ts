/**
 * Builds a community package from a generated or registered style, exactly as
 * the in-app "Contribute Package" export does — style.json, metadata.json,
 * preview.svg and README.md — into styles/community/<slug>/.
 *
 *   npm run style:package -- --seed 40711 --mode Coherent --slug dusk-paper --name "Dusk Paper" --author you
 *   npm run style:package -- --from glassmorphism --slug my-glass --name "My Glass" --author you
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateProceduralStyle } from '../src/engine/generator/generator';
import type { GenerationMode } from '../src/engine/generator/generator';
import { allStyles } from '../src/styles';
import { renderStylePreviewSvg } from '../src/engine/preview';
import { validateStyleDefinition } from '../src/engine/validate';
import type { StyleDefinition } from '../src/engine/types';

// --key value pairs; a flag with no value (or followed by another flag) is "true".
const argv = process.argv.slice(2);
const args: Record<string, string> = {};
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) continue;
  const next = argv[i + 1];
  args[argv[i].slice(2)] = next !== undefined && !next.startsWith('--') ? (i++, next) : 'true';
}
const slug = args.slug;
const author = args.author;
if (!slug || !author) throw new Error('Required: --slug <folder> --author <name>');

let source: StyleDefinition;
if (args.seed) {
  // Numeric seeds are numbers everywhere else (URL, Python CLI); keep that here.
  const seed = /^\d+$/.test(args.seed) ? Number(args.seed) : args.seed;
  source = generateProceduralStyle({ seed, mode: (args.mode as GenerationMode) ?? 'Coherent' }).style;
} else if (args.from) {
  const found = allStyles.find((s) => s.metadata.id === args.from);
  if (!found) throw new Error(`Unknown style ${args.from}`);
  source = found;
} else {
  throw new Error('Pass --seed <seed> or --from <style id>');
}

const id = `community-${slug}`;
const { generation: _g, ...definition } = source;
const { isCustom: _c, relatedStyles: _r, principles: _p, ...meta } = definition.metadata;
const style: StyleDefinition = {
  ...definition,
  metadata: {
    ...meta,
    id,
    name: args.name ?? meta.name,
    description: args.description ?? meta.description,
    tags: Array.from(new Set(['community', ...meta.tags.filter((t) => t !== 'procedural')])),
    author,
    version: '1.0.0',
    license: args.license ?? 'MIT',
    source: 'community'
  }
};
const result = validateStyleDefinition(style);
if (!result.ok) throw new Error(`Package is not valid:\n${result.missing.join('\n')}`);

const root = resolve(import.meta.dirname ?? '.', '..');
const dir = resolve(root, 'styles/community', slug);
if (existsSync(dir) && !args.force) throw new Error(`${dir} exists (pass --force to overwrite)`);
mkdirSync(dir, { recursive: true });

const metadata = {
  id, name: style.metadata.name, author, version: '1.0.0', license: style.metadata.license,
  category: style.metadata.category, description: style.metadata.description, tags: style.metadata.tags,
  path: `styles/community/${slug}/style.json`,
  repository: `https://github.com/Chinto-lgtm/ui-explorer/tree/main/styles/community/${slug}`
};
writeFileSync(resolve(dir, 'style.json'), JSON.stringify(style, null, 2) + '\n');
writeFileSync(resolve(dir, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
writeFileSync(resolve(dir, 'preview.svg'), renderStylePreviewSvg(style) + '\n');
writeFileSync(resolve(dir, 'README.md'), `# ${style.metadata.name}

${style.metadata.description}

- **Author:** ${author}
- **License:** ${style.metadata.license}
- **Category:** ${style.metadata.category}
${args.seed ? `- **Origin:** generated from seed \`${args.seed}\` (${args.mode ?? 'Coherent'}), then packaged\n` : ''}
Best for ${style.metadata.bestUsedFor.join(', ').toLowerCase()}.
`);
console.log(`wrote styles/community/${slug}/ (${style.metadata.name}) — now add metadata.json to styles/community/index.json`);
