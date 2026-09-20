/**
 * UI Explorer — Style Registry
 * Registry for storing, retrieving, and organizing design styles.
 */

import type { StyleDefinition, StyleCategory } from './types';

class StyleRegistry {
  private styles = new Map<string, StyleDefinition>();

  register(style: StyleDefinition): void {
    this.styles.set(style.metadata.id, style);
  }

  registerMany(styles: StyleDefinition[]): void {
    styles.forEach((style) => this.register(style));
  }

  get(id: string): StyleDefinition | undefined {
    return this.styles.get(id);
  }

  getAll(): StyleDefinition[] {
    return Array.from(this.styles.values());
  }

  getByCategory(category: StyleCategory): StyleDefinition[] {
    return this.getAll().filter((s) => s.metadata.category === category);
  }

  search(query: string): StyleDefinition[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (s) =>
        s.metadata.name.toLowerCase().includes(q) ||
        s.metadata.description.toLowerCase().includes(q) ||
        s.metadata.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.metadata.category.toLowerCase().includes(q)
    );
  }

  has(id: string): boolean {
    return this.styles.has(id);
  }

  unregister(id: string): boolean {
    return this.styles.delete(id);
  }

  clear(): void {
    this.styles.clear();
  }
}

export const registry = new StyleRegistry();
