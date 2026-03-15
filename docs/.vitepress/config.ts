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
      { text: 'Releases', link: '/releases' },
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
        {
          text: 'Modules',
          collapsed: false,
          items: [
            { text: 'api/client', link: '/api/api/client' },
            { text: 'api/player', link: '/api/api/player' },
            { text: 'api/tracks', link: '/api/api/tracks' },
            { text: 'api/albums', link: '/api/api/albums' },
            { text: 'api/playlists', link: '/api/api/playlists' },
            { text: 'api/search', link: '/api/api/search' },
            { text: 'api/user', link: '/api/api/user' },
          ],
        },
        {
          text: 'Auth',
          collapsed: false,
          items: [
            { text: 'auth/flow', link: '/api/auth/flow' },
            { text: 'auth/token-store', link: '/api/auth/token-store' },
            { text: 'auth/pkce', link: '/api/auth/pkce' },
            { text: 'auth/server', link: '/api/auth/server' },
          ],
        },
        {
          text: 'Schemas',
          collapsed: false,
          items: [
            { text: 'schemas/track', link: '/api/schemas/track' },
            { text: 'schemas/album', link: '/api/schemas/album' },
            { text: 'schemas/player', link: '/api/schemas/player' },
            { text: 'schemas/playlist', link: '/api/schemas/playlist' },
            { text: 'schemas/search', link: '/api/schemas/search' },
            { text: 'schemas/user', link: '/api/schemas/user' },
            { text: 'schemas/artist', link: '/api/schemas/artist' },
            { text: 'schemas/common', link: '/api/schemas/common' },
          ],
        },
        {
          text: 'Utilities',
          collapsed: false,
          items: [
            { text: 'errors', link: '/api/errors' },
            { text: 'config', link: '/api/config' },
            { text: 'output', link: '/api/output' },
            { text: 'parse', link: '/api/parse' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zcaceres/spotify-cli' },
    ],
  },
})
