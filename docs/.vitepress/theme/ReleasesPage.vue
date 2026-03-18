<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

const platformInfo: Record<string, { label: string; icon: string }> = {
  'darwin-arm64': { label: 'macOS (Apple Silicon)', icon: '' },
  'darwin-x64': { label: 'macOS (Intel)', icon: '' },
  'linux-x64': { label: 'Linux (x64)', icon: '' },
  'linux-arm64': { label: 'Linux (ARM64)', icon: '' },
  'windows-x64': { label: 'Windows (x64)', icon: '' },
}

function getPlatform(name: string): { label: string; icon: string } | null {
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
          <div class="release-notes-body" v-html="release.body" />
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
  max-width: 800px;
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

.prerelease-badge {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}

.release-assets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.asset-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
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
  font-size: 1.2rem;
  flex-shrink: 0;
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
  white-space: pre-wrap;
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
    grid-template-columns: 1fr;
  }
}
</style>
