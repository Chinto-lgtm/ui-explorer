import { defineConfig } from 'vitepress'

// The docs are plain Markdown in docs/; this only adds navigation and a theme.
// DOCS_BASE_PATH is /ui-explorer/docs/ on GitHub Pages and /docs/ on a custom domain.
export default defineConfig({
  title: 'UI Explorer',
  description: 'Documentation for the open-source interactive design laboratory.',
  base: process.env.DOCS_BASE_PATH || '/docs/',
  outDir: '../dist/docs',
  cleanUrls: true,
  appearance: 'dark',
  lastUpdated: false,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: (process.env.DOCS_BASE_PATH || '/docs/') + 'favicon.svg' }]],
  themeConfig: {
    nav: [
      { text: 'App', link: process.env.APP_URL || 'https://chinto-lgtm.github.io/ui-explorer/' },
      { text: 'GitHub', link: 'https://github.com/Chinto-lgtm/ui-explorer' }
    ],
    sidebar: [
      { text: 'Introduction', link: '/' },
      {
        text: 'Using UI Explorer',
        items: [
          { text: 'Styles', link: '/guide/styles' },
          { text: 'Components', link: '/guide/components' },
          { text: 'Style Anatomy', link: '/guide/style-anatomy' },
          { text: 'Customizer', link: '/guide/customizer' },
          { text: 'Style Mixer', link: '/guide/style-mixer' },
          { text: 'SVG Lab', link: '/guide/svg-lab' },
          { text: 'Design Tokens', link: '/guide/design-tokens' }
        ]
      },
      {
        text: 'Building styles',
        items: [
          { text: 'Creating a style', link: '/creating-a-style' },
          { text: 'Style schema', link: '/style-schema' },
          { text: 'Community styles', link: '/community-styles' },
          { text: 'Contributing', link: '/contributing' }
        ]
      },
      {
        text: 'Internals',
        items: [
          { text: 'Architecture', link: '/architecture' },
          { text: 'Style engine', link: '/style-engine' },
          { text: 'Procedural generation', link: '/procedural-generation' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/Chinto-lgtm/ui-explorer' }],
    search: { provider: 'local' },
    footer: { message: 'Released under the MIT License.' }
  },
  srcExclude: ['**/README.md']
})
