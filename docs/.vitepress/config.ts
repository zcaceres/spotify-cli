import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Spotify CLI',
  description: 'A command-line interface for the Spotify API',
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap', rel: 'stylesheet' }],
  ],
  appearance: 'dark',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Commands', link: '/commands' },
      { text: 'API Reference', link: '/api/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
      ],
      '/commands': [
        {
          text: 'Command Reference',
          items: [
            { text: 'Overview', link: '/commands' },
            { text: 'Authentication', link: '/commands#authentication' },
            { text: 'Player', link: '/commands#player' },
            { text: 'Search', link: '/commands#search' },
            { text: 'Tracks', link: '/commands#tracks' },
            { text: 'Albums', link: '/commands#albums' },
            { text: 'Playlists', link: '/commands#playlists' },
            { text: 'User', link: '/commands#user' },
            { text: 'Exit Codes', link: '/commands#exit-codes' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zcaceres/spotify-cli' },
    ],
  },
})
