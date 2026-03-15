---
layout: home
hero:
  name: Spotify CLI
  tagline: Control Spotify from your terminal. JSON output, scriptable, no GUI required.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Command Reference
      link: /commands
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: Download
      link: /releases
features:
  - icon:
      src: /icons/playback.svg
      alt: Playback control
    title: Full Playback Control
    details: Play, pause, skip, seek, volume, shuffle, repeat — control any Spotify Connect device from your terminal.
  - icon:
      src: /icons/json.svg
      alt: JSON output
    title: JSON Output
    details: All output is structured JSON to stdout. Pipe to jq, feed into scripts, or integrate with other tools.
  - icon:
      src: /icons/search.svg
      alt: Search
    title: Search & Library
    details: Search tracks, albums, artists, and playlists. Browse your saved library, manage playlists, check top items.
  - icon:
      src: /icons/lock.svg
      alt: Authentication
    title: OAuth 2.0 PKCE
    details: Secure authentication with no client secret. Tokens refresh automatically and are stored locally.
---

<div class="vp-doc" style="max-width: 688px; margin: 0 auto; padding: 2rem 1.5rem;">

## Quick example

```bash
# Log in (one-time setup)
spotify login --client-id <your-client-id>

# What's playing?
spotify now | jq '.item.name, .item.artists[0].name'

# Search and play
spotify search "miles davis" --type artist
spotify play --uri spotify:artist:0kbYTNQb4Pb1rY2MnLRbWx

# Control playback
spotify volume 60
spotify shuffle on
```

</div>
