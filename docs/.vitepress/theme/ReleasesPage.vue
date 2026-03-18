<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true })

interface Asset {
  name: string
  browser_download_url: string
  size: number
}

interface Release {
  tag_name: string
  name: string
  published_at: string
  html_url: string
  body: string
  assets: Asset[]
  prerelease: boolean
}

const releases = ref<Release[]>([])
const loading = ref(true)
const error = ref('')

const REPO = 'zcaceres/spotify-cli'

const platformInfo: Record<string, { label: string; svg: string }> = {
  'darwin-arm64': { label: 'macOS (Apple Silicon)', svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.15 11.89c-.26.58-.38.84-.72 1.36-.47.72-1.13 1.62-1.95 1.63-.73.01-1.02-.47-1.95-.47-.93 0-1.25.46-1.93.49-.82.03-1.45-.88-1.92-1.6C2.36 11.28 1.3 8.2 2.71 6.13c.51-.74 1.33-1.2 2.2-1.21.78-.01 1.52.53 2 .53.47 0 1.36-.66 2.29-.56.39.02 1.49.16 2.19 1.18-.06.04-1.31.76-1.29 2.28.02 1.81 1.59 2.42 1.61 2.42-.01.04-.25.87-.56 1.12zM9.76 2.8c.36-.46.64-1.11.57-1.77-.55.04-1.2.39-1.57.85-.34.41-.63 1.07-.52 1.7.6.02 1.15-.34 1.52-.78z"/></svg>' },
  'darwin-x64': { label: 'macOS (Intel)', svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.15 11.89c-.26.58-.38.84-.72 1.36-.47.72-1.13 1.62-1.95 1.63-.73.01-1.02-.47-1.95-.47-.93 0-1.25.46-1.93.49-.82.03-1.45-.88-1.92-1.6C2.36 11.28 1.3 8.2 2.71 6.13c.51-.74 1.33-1.2 2.2-1.21.78-.01 1.52.53 2 .53.47 0 1.36-.66 2.29-.56.39.02 1.49.16 2.19 1.18-.06.04-1.31.76-1.29 2.28.02 1.81 1.59 2.42 1.61 2.42-.01.04-.25.87-.56 1.12zM9.76 2.8c.36-.46.64-1.11.57-1.77-.55.04-1.2.39-1.57.85-.34.41-.63 1.07-.52 1.7.6.02 1.15-.34 1.52-.78z"/></svg>' },
  'linux-x64': { label: 'Linux (x64)', svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1C5.79 1 4 2.79 4 5v2.5c0 .83-.67 1.5-1.5 1.5H2v2h1c.17 0 .33.02.5.05C4.07 12.72 5.86 14 8 14s3.93-1.28 4.5-2.95c.17-.03.33-.05.5-.05h1v-2h-.5c-.83 0-1.5-.67-1.5-1.5V5c0-2.21-1.79-4-4-4zm-2 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 3h4c0 1.1-.9 2-2 2s-2-.9-2-2z"/></svg>' },
  'linux-arm64': { label: 'Linux (ARM64)', svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1C5.79 1 4 2.79 4 5v2.5c0 .83-.67 1.5-1.5 1.5H2v2h1c.17 0 .33.02.5.05C4.07 12.72 5.86 14 8 14s3.93-1.28 4.5-2.95c.17-.03.33-.05.5-.05h1v-2h-.5c-.83 0-1.5-.67-1.5-1.5V5c0-2.21-1.79-4-4-4zm-2 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 3h4c0 1.1-.9 2-2 2s-2-.9-2-2z"/></svg>' },
  'windows-x64': { label: 'Windows (x64)', svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3.2l5.5-.8v5.3H1V3.2zm0 9.6l5.5.8V8.3H1v4.5zM7.5 2.3L15 1v6.7H7.5V2.3zM15 8.3v6.7l-7.5-1V8.3H15z"/></svg>' },
}

function getPlatform(name: string): { label: string; svg: string } | null {
  for (const [key, info] of Object.entries(platformInfo)) {
    if (name.includes(key)) return info
  }
  return null
}

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function renderMarkdown(text: string): string {
  return md.render(text)
}

onMounted(async () => {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases`)
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`)
    releases.value = await res.json()
  } catch (e: any) {
    error.value = e.message ?? 'Failed to fetch releases'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="releases">
    <div v-if="loading" class="releases-loading">
      <div class="spinner" />
      <p>Loading releases from GitHub…</p>
    </div>

    <div v-else-if="error" class="releases-error">
      <p>{{ error }}</p>
      <a :href="`https://github.com/${REPO}/releases`" target="_blank">
        View releases on GitHub →
      </a>
    </div>

    <div v-else-if="releases.length === 0" class="releases-empty">
      <p>No releases yet. The first release will appear here when <code>v0.1.0</code> is tagged.</p>
      <a :href="`https://github.com/${REPO}/releases`" target="_blank">
        View on GitHub →
      </a>
    </div>

    <div v-else>
      <div
        v-for="release in releases"
        :key="release.tag_name"
        class="release-card"
        :class="{ prerelease: release.prerelease }"
      >
        <div class="release-header">
          <h2 :id="release.tag_name">
            <a :href="`#${release.tag_name}`" class="header-anchor">#</a>
            {{ release.name || release.tag_name }}
            <span v-if="releases.indexOf(release) === 0 && !release.prerelease" class="badge latest-badge">latest</span>
            <span v-if="release.prerelease" class="badge prerelease-badge">pre-release</span>
          </h2>
          <time class="release-date">{{ formatDate(release.published_at) }}</time>
        </div>

        <div class="release-assets">
          <a
            v-for="asset in release.assets"
            :key="asset.name"
            :href="asset.browser_download_url"
            class="asset-card"
          >
            <template v-if="getPlatform(asset.name)">
              <span class="asset-icon" v-html="getPlatform(asset.name)!.svg" />
              <span class="asset-label">{{ getPlatform(asset.name)!.label }}</span>
              <span class="asset-size">{{ formatSize(asset.size) }}</span>
            </template>
            <template v-else>
              <span class="asset-label">{{ asset.name }}</span>
              <span class="asset-size">{{ formatSize(asset.size) }}</span>
            </template>
          </a>
        </div>

        <details v-if="release.body" class="release-notes">
          <summary>Release notes</summary>
          <div class="release-notes-body" v-html="renderMarkdown(release.body)" />
        </details>

        <a :href="release.html_url" class="release-gh-link" target="_blank">
          View on GitHub →
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.releases {
  max-width: 960px;
  margin: 0 auto;
}

.releases-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  color: var(--vp-c-text-2);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--spotify-green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.releases-error,
.releases-empty {
  text-align: center;
  padding: 48px 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.releases-error a,
.releases-empty a {
  color: var(--spotify-green);
  font-weight: 500;
}

.release-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.2s;
}

.release-card:first-child {
  border-color: var(--spotify-green);
  box-shadow: 0 0 0 1px rgba(29, 185, 84, 0.1);
}

.release-card.prerelease {
  border-style: dashed;
}

.release-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.release-header h2 {
  margin: 0;
  padding: 0;
  border: none;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: none;
  border-radius: 0;
}

.release-date {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  white-space: nowrap;
}

.badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 4px;
  vertical-align: middle;
  margin-left: 8px;
}

.latest-badge {
  background: rgba(29, 185, 84, 0.15);
  color: #1DB954;
}

.prerelease-badge {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}

.release-assets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.asset-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  white-space: nowrap;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
}

.asset-card:hover {
  border-color: var(--spotify-green);
  background: rgba(29, 185, 84, 0.04);
}

.dark .asset-card:hover {
  background: rgba(29, 185, 84, 0.08);
}

.asset-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: var(--vp-c-text-2);
}

.asset-label {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 500;
}

.asset-size {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}

.release-notes {
  margin-bottom: 12px;
}

.release-notes summary {
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 4px 0;
  user-select: none;
}

.release-notes summary:hover {
  color: var(--spotify-green);
}

.release-notes-body {
  padding: 12px 16px;
  margin-top: 8px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.6;
}

.release-notes-body :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  margin: 12px 0 4px;
}

.release-notes-body :deep(h4) {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 10px 0 4px;
}

.release-notes-body :deep(ul) {
  padding-left: 20px;
  margin: 4px 0;
}

.release-notes-body :deep(li) {
  margin: 2px 0;
}

.release-notes-body :deep(a) {
  color: var(--spotify-green);
}

.release-gh-link {
  font-size: 0.85rem;
  color: var(--spotify-green);
  font-weight: 500;
  text-decoration: none;
}

.release-gh-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .release-header {
    flex-direction: column;
    gap: 4px;
  }

  .release-assets {
    flex-direction: column;
  }
}
</style>
