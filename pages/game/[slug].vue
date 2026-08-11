<template>
  <div v-if="pending" class="loading-full">
    <div class="loader-content">
      <div class="spinner"></div>
      <p>{{ $t('loading_game') }}</p>
    </div>
  </div>
  
  <div v-else-if="error || !data" class="error-container container section-padding">
    <div class="error-box glass-panel animate-fade-in">
      <h2>{{ $t('error_prefix') }}</h2>
      <p>{{ error?.message || $t('game_not_found') }}</p>
      <NuxtLink :to="localePath('/')" class="btn-primary">← {{ $t('back_home') }}</NuxtLink>
    </div>
  </div>

  <div v-else class="pro-game-page animate-fade-in">
    <!-- Hero Banner with Ambient Blur Backdrop -->
    <div class="pro-hero-banner" :style="{ backgroundImage: `url(${getThumbUrl(data.game.thumb_1 || data.game.thumb_2)})` }">
      <div class="hero-overlay-gradient"></div>
      <div class="hero-container container">
        <div class="hero-grid">
          <!-- Poster Cover -->
          <div class="hero-poster-wrap">
            <img :src="getThumbUrl(data.game.thumb_1 || data.game.thumb_2)" :alt="data.game.title" class="hero-poster-img" />
          </div>

          <!-- Hero Info Details -->
          <div class="hero-details">
            <h1 class="hero-game-title">{{ data.game.title }}</h1>

            <div class="hero-meta-line">
              <span class="meta-item category-badge" v-if="data.game.category">{{ data.game.category }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-item rating-box">
                <svg class="meta-svg-star" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span class="rating-num">4.8</span>
              </span>
              <span class="meta-separator">•</span>
              <span class="meta-item views-count">
                <svg class="meta-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>{{ (data.game.views || 0).toLocaleString() }} {{ $t('views') || 'vistas' }}</span>
              </span>
            </div>

            <div class="hero-feature-tags">
              <span class="feature-tag">{{ data.game.is_mobile ? $t('mobile_and_pc') : $t('web_browser') }}</span>
              <span class="feature-tag">{{ $t('instant_load') }}</span>
              <span class="feature-tag" v-if="data.game.game_type">{{ (data.game.game_type || 'HTML5').toUpperCase() }}</span>
            </div>

            <!-- Action Buttons Group -->
            <div class="hero-actions">
              <button @click="scrollToStage" class="pro-btn-play">
                <svg class="play-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>{{ $t('play_now') }}</span>
              </button>

              <button @click="handleInteraction('like')" class="pro-btn-secondary" :title="$t('like')">
                <svg class="action-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <span>{{ data.game.upvote || 0 }}</span>
              </button>

              <button @click="handleInteraction('dislike')" class="pro-btn-secondary" :title="$t('dislike')">
                <svg class="action-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                </svg>
                <span>{{ data.game.downvote || 0 }}</span>
              </button>

              <button @click="toggleFullscreen" class="pro-btn-icon" :title="$t('fullscreen')">
                <svg class="action-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              </button>

              <button @click="copyShareLink" class="pro-btn-icon" :title="$t('share')">
                <svg class="action-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>

              <button @click="handleInteraction('report')" class="pro-btn-icon danger" :title="$t('report_bug')">
                <svg class="action-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Professional Disclaimer Bar -->
    <div class="rating-disclaimer-bar">
      <div class="container rating-bar-inner">
        <div class="esrb-badge-wrap">
          <div class="esrb-box">PEGI 3</div>
          <div class="esrb-info">
            <span class="esrb-title">{{ $t('free_access_no_install') }}</span>
            <span class="esrb-desc">{{ $t('instant_online_game_desc') }}</span>
          </div>
        </div>
        <div class="disclaimer-text">
          <p>{{ $t('enjoy_without_download', { title: data.game.title }) }}</p>
        </div>
      </div>
    </div>

    <!-- Interactive Game Player Stage -->
    <div class="game-stage-section" ref="stageSectionRef">
      <div class="container stage-container-inner">
        <div class="stage-header">
          <h2 class="stage-section-title">
            <svg class="header-play-icon" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>{{ data.game.title }}</span>
          </h2>
          <button @click="toggleFullscreen" class="stage-fullscreen-btn">
            <svg class="btn-svg-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
            <span>{{ $t('fullscreen') }}</span>
          </button>
        </div>
        
        <div class="stage-inner glass-panel" ref="stageContainerRef" v-if="data.game.url">
          <iframe 
            ref="gameIframeRef"
            :src="data.game.url" 
            frameborder="0" 
            allowfullscreen="true"
            scrolling="no"
            class="game-iframe"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- Game Information & Details Section -->
    <div class="game-details-section container section-padding">
      <div class="pro-tabs-nav">
        <button 
          @click="activeTab = 'description'" 
          class="tab-btn" 
          :class="{ 'active': activeTab === 'description' }"
        >
          {{ $t('details') }}
        </button>
        <button 
          v-if="data.game.instructions" 
          @click="activeTab = 'instructions'" 
          class="tab-btn" 
          :class="{ 'active': activeTab === 'instructions' }"
        >
          {{ $t('instructions') }}
        </button>
      </div>

      <div class="tab-content-wrap">
        <!-- Description Tab -->
        <div v-if="activeTab === 'description'" class="tab-pane animate-fade-in">
          <div class="details-grid">
            <div class="details-main glass-panel" v-if="data.game.description">
              <h3 class="pane-heading">{{ $t('description') }}</h3>
              <div class="content-text" v-html="sanitizeHtml(data.game.description)"></div>
            </div>

            <!-- Side Specs Panel -->
            <div class="details-specs glass-panel">
              <h3 class="pane-heading">{{ $t('specs') }}</h3>
              <div class="spec-row" v-if="data.game.category">
                <span class="spec-label">{{ $t('category') }}</span>
                <span class="spec-value tag">{{ data.game.category }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">{{ $t('total_views') }}</span>
                <span class="spec-value">{{ (data.game.views || 0).toLocaleString() }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">{{ $t('upvotes') }}</span>
                <span class="spec-value">{{ data.game.upvote || 0 }}</span>
              </div>
              <div class="spec-row" v-if="data.game.game_type">
                <span class="spec-label">{{ $t('platform') }}</span>
                <span class="spec-value">{{ data.game.game_type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions Tab -->
        <div v-if="activeTab === 'instructions'" class="tab-pane animate-fade-in">
          <div class="details-main glass-panel">
            <h3 class="pane-heading">{{ $t('instructions') }}</h3>
            <div class="content-text" v-html="sanitizeHtml(data.game.instructions)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Games Grid -->
    <section v-if="relatedGames.length > 0" class="related-section container section-padding">
      <div class="section-header">
        <h2 class="section-title">{{ $t('more_similar_games') }}</h2>
        <div class="section-line"></div>
      </div>
      <div class="related-grid">
        <NuxtLink
          v-for="game in relatedGames.slice(0, 12)"
          :key="game.id"
          :to="localePath(`/game/${game.slug}`)"
          class="game-card hover-lift"
        >
          <div class="thumb-wrapper">
             <img :src="getThumbUrl(game.thumb_small || game.thumb_1)" :alt="game.title" loading="lazy" class="game-thumb">
             <div class="card-overlay">
               <svg class="overlay-play-icon" viewBox="0 0 24 24" fill="currentColor">
                 <polygon points="5 3 19 12 5 21 5 3"></polygon>
               </svg>
             </div>
          </div>
          <div class="game-info">
            <h3 class="game-title">{{ game.title }}</h3>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { sanitizeHtml } from '~/utils/sanitize'

const gameIframeRef = ref(null)
const stageContainerRef = ref(null)
const stageSectionRef = ref(null)
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const activeTab = ref('description')

const { data, pending, error } = await useFetch(`/api/games/${route.params.slug}`, {
  query: { lang: locale }
})

const getThumbUrl = (thumbPath) => {
  if (!thumbPath) return '/pwa-192x192.png'
  const cleanPath = thumbPath.replace(/^\/+/, '')
  return `/${cleanPath}`
}

const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, '') : ''

const gameTitle = computed(() => data.value?.game?.title ? `${data.value.game.title} - tudexgames` : t('site_title'))
const gameDesc = computed(() => data.value?.game?.description ? stripHtml(data.value.game.description).substring(0, 160) : t('site_title'))

useSeoMeta({
  title: gameTitle,
  description: gameDesc,
  ogTitle: gameTitle,
  ogDescription: gameDesc,
  twitterCard: 'summary_large_image'
})

const { data: relatedData } = await useFetch('/api/games/related', {
  query: {
    category: computed(() => data.value?.game?.category),
    lang: locale
  },
  lazy: true
})

const relatedGames = computed(() => {
  if (!relatedData.value?.games || !data.value?.game?.id) return []
  return relatedData.value.games.filter(g => g.id !== data.value.game.id)
})

const handleInteraction = async (type) => {
  if (!data.value?.game?.id) return;
  try {
    const response = await $fetch('/api/interactions', {
      method: 'POST',
      body: { gameId: data.value.game.id, type }
    })
    if (response.success) {
      if (type === 'like') data.value.game.upvote = (data.value.game.upvote || 0) + 1;
      if (type === 'dislike') data.value.game.downvote = (data.value.game.downvote || 0) + 1;
      if (type === 'report') toast.add({ message: t('feedback_report'), type: 'success' });
    }
  } catch(e) { console.error(e) }
}

const scrollToStage = () => {
  if (stageSectionRef.value) {
    stageSectionRef.value.scrollIntoView({ behavior: 'smooth' })
  }
}

const copyShareLink = () => {
  if (typeof window !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    toast.add({ message: t('link_copied'), type: 'success' })
  }
}

const toggleFullscreen = () => {
  const stage = stageContainerRef.value || gameIframeRef.value
  if (stage) {
    if (stage.requestFullscreen) stage.requestFullscreen()
    else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen()
    else if (stage.msRequestFullscreen) stage.msRequestFullscreen()
  }
}
</script>

<style scoped>
.pro-game-page {
  position: relative;
  min-height: 100vh;
  color: #ffffff;
}

.loading-full {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-content {
  text-align: center;
  color: var(--text-secondary);
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1.25rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ==========================================================================
   CLEAN MONOCHROME HERO BANNER
   ========================================================================== */

.pro-hero-banner {
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 4rem 0 3.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.hero-overlay-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(5, 5, 5, 0.6) 0%, rgba(5, 5, 5, 0.95) 100%);
  backdrop-filter: blur(40px) saturate(160%);
  -webkit-backdrop-filter: blur(40px) saturate(160%);
}

.hero-container {
  position: relative;
  z-index: 2;
}

.hero-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 3rem;
  align-items: flex-end;
}

/* Poster Cover */
.hero-poster-wrap {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 
    0 24px 48px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  background: #0d0d12;
}

.hero-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Hero Details */
.hero-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-game-title {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.03em;
  color: #ffffff;
}

.hero-meta-line {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.925rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.meta-separator {
  color: rgba(255, 255, 255, 0.3);
}

.category-badge {
  font-weight: 600;
  color: #ffffff;

  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.meta-svg-star {
  width: 16px;
  height: 16px;
  color: #ffffff;
}

.meta-svg-icon {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

.views-count {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.rating-num {
  font-weight: 700;
  color: #ffffff;
}

.hero-feature-tags {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.feature-tag {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Professional Action Buttons */
.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.pro-btn-play {
  background: #10b981;
  color: #ffffff;
  border: none;
  padding: 0.85rem 2.25rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  transition: var(--transition-smooth);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.play-svg-icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.pro-btn-play:hover {
  transform: translateY(-2px);
  background: #059669;
  box-shadow: 0 14px 30px rgba(16, 185, 129, 0.45);
}

.pro-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #ffffff;
  padding: 0.85rem 1.4rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.action-svg-icon {
  width: 16px;
  height: 16px;
}

.pro-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
}

.pro-btn-icon {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #ffffff;
  padding: 0.85rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.pro-btn-icon:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
}

.pro-btn-icon.danger:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Disclaimer Bar */
.rating-disclaimer-bar {
  background: #09090d;
  border-bottom: 1px solid var(--border-color);
  padding: 1.25rem 0;
}

.rating-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.esrb-badge-wrap {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.esrb-box {
  border: 2px solid #ffffff;
  padding: 0.4rem 0.75rem;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  background: #000000;
  border-radius: 4px;
}

.esrb-info {
  display: flex;
  flex-direction: column;
}

.esrb-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #ffffff;
}

.esrb-desc {
  font-size: 0.775rem;
  color: var(--text-dim);
}

.disclaimer-text p {
  font-size: 0.8rem;
  color: var(--text-dim);
  max-width: 500px;
  text-align: right;
  margin: 0;
}

/* Stage Section */
.game-stage-section {
  padding: 3rem 0 1rem;
  background: #050505;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.stage-section-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.header-play-icon {
  width: 16px;
  height: 16px;
  color: #ffffff;
}

.stage-fullscreen-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  font-size: 0.825rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition-smooth);
}

.btn-svg-small {
  width: 14px;
  height: 14px;
}

.stage-fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: #ffffff;
}

.stage-inner {
  width: 100%;
  aspect-ratio: 16/9;
  max-height: 720px;
  background: #000000;
  border-radius: 24px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.game-iframe {
  width: 100% !important;
  height: 100% !important;
  border-radius: 20px;
  border: none;
  display: block;
}

/* Tabs */
.pro-tabs-nav {
  display: flex;
  gap: 2rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
}

.tab-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.85rem 0;
  position: relative;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.tab-btn:hover { color: #ffffff; }

.tab-btn.active {
  color: #ffffff;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #ffffff;
  border-radius: 2px;
}

.details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.5rem;
}

.details-main, .details-specs {
  padding: 2rem;
  border-radius: 20px;
}

.pane-heading {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 1.5rem;
}

.content-text {
  color: var(--text-secondary);
  font-size: 0.975rem;
  line-height: 1.7;
}

.spec-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--border-color);
}

.spec-row:last-child { border: none; }
.spec-label { color: var(--text-dim); font-size: 0.85rem; }
.spec-value { font-weight: 600; font-size: 0.9rem; }

/* Related Section */
.section-header {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0;
}

.section-line {
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1.25rem;
}

.overlay-play-icon {
  width: 24px;
  height: 24px;
  color: #ffffff;
}

/* Responsive Rules */
@media (max-width: 1024px) {
  .hero-grid { grid-template-columns: 180px 1fr; gap: 2rem; }
  .hero-game-title { font-size: 2.1rem; }
  .details-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .hero-grid { grid-template-columns: 1fr; justify-items: center; text-align: center; }
  .hero-poster-wrap { width: 180px; }
  .hero-meta-line, .hero-feature-tags, .hero-actions { justify-content: center; }
  .rating-bar-inner { flex-direction: column; text-align: center; }
  .disclaimer-text p { text-align: center; }
}
</style>
