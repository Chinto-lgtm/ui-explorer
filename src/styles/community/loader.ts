/**
 * UI Explorer — Community style registry loader
 * Styles live on disk as `styles/community/<slug>/style.json` (plus an optional
 * README) and are indexed at build time via `import.meta.glob`. Every file is
 * validated, `extends` is resolved against the built-in styles, and provenance
 * (author, licence, source path) is attached for the gallery and docs.
 */

import type { StyleDefinition } from '../../engine/types';
import { coerceStyleDefinition, validateStyleDefinition } from '../../engine/validate';
import { resolveInheritance, type StyleFile } from '../../engine/inherit';
import registryIndex from '../../../styles/community/index.json';

interface RegistryEntry {
  id: string;
  name: string;
  author: string;
  version: string;
  license: string;
  category: string;
  description: string;
  tags: string[];
  path: string;
  repository?: string;
}

export interface CommunityPackage {
  style: StyleDefinition;
  /** Path relative to the repository root, e.g. styles/community/aurora-glass/style.json */
  path: string;
  /** Raw JSON as written by the author (before inheritance is resolved). */
  source: string;
  readme?: string;
  repository?: string;
  extends?: string;
}

export interface CommunityLoadProblem {
  path: string;
  errors: string[];
}

const styleFiles = import.meta.glob<StyleFile>('../../../styles/community/*/style.json', { eager: true, import: 'default' });
const styleSources = import.meta.glob<string>('../../../styles/community/*/style.json', { eager: true, query: '?raw', import: 'default' });
const readmes = import.meta.glob<string>('../../../styles/community/*/README.md', { eager: true, query: '?raw', import: 'default' });

const toRepoPath = (key: string) => key.replace(/^(\.\.\/)+/, '');
const slugOf = (key: string) => key.split('/').slice(-2, -1)[0];

export const communityProblems: CommunityLoadProblem[] = [];

/**
 * Load, validate and resolve every community package. `lookup` resolves the
 * `extends` field against already-registered styles.
 */
export function loadCommunityPackages(lookup: (id: string) => StyleDefinition | undefined): CommunityPackage[] {
  const entries = registryIndex as RegistryEntry[];
  const packages: CommunityPackage[] = [];
  communityProblems.length = 0;

  for (const [key, file] of Object.entries(styleFiles)) {
    const path = toRepoPath(key);
    const slug = slugOf(key);
    const resolved = resolveInheritance(file, lookup);
    const validation = validateStyleDefinition(resolved);
    const style = validation.ok ? coerceStyleDefinition(resolved) : null;
    if (!style) {
      communityProblems.push({ path, errors: validation.missing.length ? validation.missing : ['unreadable style file'] });
      continue;
    }
    const entry = entries.find((e) => e.id === style.metadata.id);
    style.metadata = {
      ...style.metadata,
      source: 'community',
      author: style.metadata.author ?? entry?.author ?? 'community',
      license: style.metadata.license ?? entry?.license ?? 'MIT',
      version: style.metadata.version ?? entry?.version ?? '1.0.0',
      tags: Array.from(new Set(['community', ...style.metadata.tags]))
    };
    packages.push({
      style,
      path,
      source: styleSources[key] ?? '',
      readme: readmes[key.replace(/style\.json$/, 'README.md')],
      repository: entry?.repository,
      extends: file.extends
    });
    if (!entry) communityProblems.push({ path, errors: [`${slug} is not listed in styles/community/index.json`] });
  }

  return packages.sort((a, b) => a.style.metadata.name.localeCompare(b.style.metadata.name));
}
