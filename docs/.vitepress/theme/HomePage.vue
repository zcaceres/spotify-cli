<template>
  <div class="home-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <span class="overline">Open Source CLI</span>
        <h1 class="headline">Control Spotify<br>from your AI Agent</h1>
        <p class="subtitle">
          40 commands for playback, search, playlists, and library management. JSON output, PKCE auth, zero dependencies.
        </p>
      </div>
      <div class="cta-buttons">
        <a href="/guide/getting-started" class="btn btn-primary">Get Started</a>
        <a href="/api/" class="btn btn-secondary">API Reference</a>
      </div>
      <div class="code-preview">
        <div class="code-line code-dim">$ spotify search "Kind of Blue" --type album</div>
        <div class="code-line code-muted">{ "albums": [{ "name": "Kind of Blue", ... }] }</div>
        <div class="code-line code-dim" style="padding-top: 8px">$ spotify play --uri spotify:album:1weenld61qoidwYuZ1GESA</div>
        <div class="code-line code-green">{ "status": "playing" }</div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="feature-card">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="6" width="24" height="18" rx="3" stroke="#1DB954" stroke-width="1.5" fill="none" />
          <path d="M10 15L14 19L22 11" stroke="#1DB954" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="24" cy="8" r="4" fill="#1DB954" opacity="0.3" />
          <circle cx="24" cy="8" r="2" fill="#1DB954" />
        </svg>
        <h3>Agent-Friendly</h3>
        <p>Every command outputs structured JSON — perfect for LLM agents, scripts, and automation pipelines. No parsing needed.</p>
      </div>
      <div class="feature-card">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M10 8L6 16L10 24" stroke="#1DB954" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M22 8L26 16L22 24" stroke="#1DB954" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M18 6L14 26" stroke="#1DB954" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
        </svg>
        <h3>JSON-First Output</h3>
        <p>Structured JSON to stdout, errors to stderr. Machine-readable exit codes for every failure type.</p>
      </div>
      <div class="feature-card">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="9" y="14" width="14" height="12" rx="2" stroke="#1DB954" stroke-width="1.5" fill="none" />
          <path d="M12 14V10C12 7.8 13.8 6 16 6C18.2 6 20 7.8 20 10V14" stroke="#1DB954" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="16" cy="20" r="2" fill="#1DB954" />
        </svg>
        <h3>Secure PKCE Auth</h3>
        <p>No client secret needed. Browser-based OAuth with PKCE, automatic token refresh, and secure local storage.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  --hp-bg: #121212;
  --hp-headline: #ffffff;
  --hp-subtitle: #b3b3b3;
  --hp-code-bg: #0d0d0d;
  --hp-code-dim: #666666;
  --hp-code-muted: #b3b3b3;
  --hp-card-bg: #181818;
  --hp-card-border: #1f1f1f;
  --hp-card-title: #ffffff;
  --hp-card-text: #999999;
  --hp-btn-secondary-border: #333333;
  --hp-btn-secondary-color: #b3b3b3;
  --hp-btn-secondary-hover-border: #555555;
  --hp-btn-secondary-hover-color: #ffffff;

  max-width: 1440px;
  margin: 0 auto;
  background-color: var(--hp-bg);
}

/* ── Light mode ── */
:root:not(.dark) .home-page {
  --hp-bg: #fafafa;
  --hp-headline: #1a1a1a;
  --hp-subtitle: #555555;
  --hp-code-bg: #f0f0f0;
  --hp-code-dim: #888888;
  --hp-code-muted: #333333;
  --hp-card-bg: #ffffff;
  --hp-card-border: #e5e5e5;
  --hp-card-title: #1a1a1a;
  --hp-card-text: #666666;
  --hp-btn-secondary-border: #cccccc;
  --hp-btn-secondary-color: #555555;
  --hp-btn-secondary-hover-border: #999999;
  --hp-btn-secondary-hover-color: #1a1a1a;
}

/* ── Hero ── */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 80px 64px 0;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.overline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1DB954;
  line-height: 16px;
}

.headline {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 76px;
  text-align: center;
  color: var(--hp-headline);
  margin: 0;
  border: none;
  padding: 0;
  background: none;
  border-radius: 0;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  line-height: 28px;
  color: var(--hp-subtitle);
  text-align: center;
  max-width: 520px;
  margin: 0;
}

/* ── CTA Buttons ── */
.cta-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 18px;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #1DB954;
  color: #121212;
}

.btn-primary:hover {
  background-color: #1ed760;
}

.btn-secondary {
  border: 1px solid var(--hp-btn-secondary-border);
  color: var(--hp-btn-secondary-color);
  font-weight: 500;
  background: none;
}

.btn-secondary:hover {
  border-color: var(--hp-btn-secondary-hover-border);
  color: var(--hp-btn-secondary-hover-color);
}

/* ── Code Preview ── */
.code-preview {
  background-color: var(--hp-code-bg);
  border: 1px solid rgba(29, 185, 84, 0.12);
  border-radius: 12px;
  padding: 24px 32px;
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.code-line {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 22px;
}

.code-dim {
  color: var(--hp-code-dim);
}

.code-muted {
  color: var(--hp-code-muted);
}

.code-green {
  color: #1DB954;
}

/* ── Features ── */
.features {
  display: flex;
  gap: 24px;
  justify-content: center;
  padding: 64px 64px 80px;
}

.feature-card {
  background-color: var(--hp-card-bg);
  border: 1px solid var(--hp-card-border);
  border-radius: 12px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  max-width: 360px;
}

.feature-card h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 22px;
  color: var(--hp-card-title);
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  border-radius: 0;
}

.feature-card p {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 22px;
  color: var(--hp-card-text);
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hero {
    padding: 48px 24px 0;
  }

  .headline {
    font-size: 40px;
    line-height: 44px;
  }

  .subtitle {
    font-size: 16px;
    line-height: 24px;
  }

  .code-preview {
    max-width: 100%;
  }

  .code-line {
    font-size: 11px;
  }

  .features {
    flex-direction: column;
    align-items: center;
    padding: 48px 24px 64px;
  }

  .feature-card {
    max-width: 100%;
  }
}
</style>
