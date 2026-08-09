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

  <div v-else class="game-page animate-fade-in">
    <div class="game-container">
      <!-- Breadcrumbs / Top Nav -->
      <nav class="game-nav container">
        <NuxtLink :to="localePath('/')" class="nav-back">
          ← {{ $t('back_catalog') }}
        </NuxtLink>
      </nav>

      <!-- Main Stage -->
      <div class="game-stage">
        <div class="stage-outer container">
          <div class="stage-inner" v-if="data.game.url">
            <iframe 
              ref="gameIframeRef"
              :src="data.game.url" 
              frameborder="0" 
              allowfullscreen="true"
              scrolling="no"
              class="game-iframe"
              :style="{ 
                width: data.game.width === '100%' ? '100%' : (data.game.width || '800') + 'px', 
                height: data.game.height === '100%' ? '100%' : (data.game.height || '600') + 'px' 
              }"
            ></iframe>
          </div>
          
          <div class="stage-toolbar">
            <h1 class="stage-title">{{ data.game.title }}</h1>
            <div class="stage-actions">
              <button @click="handleInteraction('like')" class="btn-icon" title="Like">
                👍 <span>{{ data.game.upvote || 0 }}</span>
              </button>
              <button @click="handleInteraction('dislike')" class="btn-icon" title="Dislike">
                👎 <span>{{ data.game.downvote || 0 }}</span>
              </button>
              <button @click="toggleFullscreen" class="btn-icon" title="Fullscreen">
                ⛶ {{ $t('fullscreen') || '' }}
              </button>
              <button @click="handleInteraction('report')" class="btn-icon btn-danger" title="Report">
                🚩
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="game-content-wrap container section-padding">
        <div class="content-grid">
          <div class="main-info">
            <section class="info-block glass-panel" v-if="data.game.description">
              <h3>{{ $t('description') }}</h3>
              <div class="content-text" v-html="sanitizeHtml(data.game.description)"></div>
            </section>

            <section class="info-block glass-panel" v-if="data.game.instructions">
              <h3>{{ $t('instructions') }}</h3>
              <div class="content-text" v-html="sanitizeHtml(data.game.instructions)"></div>
            </section>
          </div>

          <aside class="side-info">
            <div class="meta-card glass-panel">
              <div class="meta-row" v-if="data.game.category">
                <span class="label">{{ $t('category') }}</span>
                <span class="value tag">{{ data.game.category }}</span>
              </div>
              <div class="meta-row">
                <span class="label">{{ $t('views') }}</span>
                <span class="value">{{ data.game.views || 0 }}</span>
              </div>
              <div class="meta-row" v-if="data.game.published_at">
                <span class="label">{{ $t('date') }}</span>
                <span class="value">{{ new Date(data.game.published_at).toLocaleDateString() }}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <!-- Related Games Section -->
      <section v-if="relatedGames.length > 0" class="related-section container section-padding">
        <div class="section-header">
          <h2 class="section-title">{{ $t('related_games') }}</h2>
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
               <img :src="'/_ipx/w_300&f_webp/' + (game.thumb_small || game.thumb_1)" :alt="game.title" loading="lazy" class="game-thumb">
               <div class="card-overlay">
                 <span class="play-btn">➔</span>
               </div>
            </div>
            <div class="game-info">
              <h3 class="game-title">{{ game.title }}</h3>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const gameIframeRef = ref(null)
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const { data, pending, error } = await useFetch(`/api/games/${route.params.slug}`, {
  query: { lang: locale }
})

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

const toggleFullscreen = () => {
    const stage = gameIframeRef.value
    if (stage) {
        if (stage.requestFullscreen) stage.requestFullscreen()
        else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen()
        else if (stage.msRequestFullscreen) stage.msRequestFullscreen()
    }
}
</script>

<style scoped>
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

.game-nav {
  padding: 0.75rem 2rem 1.5rem;
}

.nav-back {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition-smooth);
}

.nav-back:hover { color: #ffffff; transform: translateX(-3px); }

.game-stage {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 2.5rem 0;
}

.stage-outer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stage-inner {
  max-width: 100%;
  background: #000000;
  border-radius: 20px;
  padding: 6px;
  border: 1px solid var(--border-glow);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  overflow: hidden;
  position: relative;
}

.game-iframe {
  max-width: 100vw;
  display: block;
  border-radius: 14px;
}

.stage-toolbar {
  margin-top: 1.75rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-title {
  font-size: 1.65rem;
  margin: 0;
  color: var(--text-primary);
}

.stage-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  padding: 0.55rem 1.15rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition-smooth);
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--border-glow);
  transform: translateY(-2px);
}

.btn-danger:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.5rem;
}

.info-block {
  padding: 1.75rem;
  border-radius: 20px;
  margin-bottom: 1.75rem;
}

.info-block h3 {
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
}

.content-text {
  color: var(--text-secondary);
  font-size: 0.975rem;
  line-height: 1.65;
}

.meta-card {
  padding: 1.5rem;
  border-radius: 20px;
  position: sticky;
  top: 100px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--border-color);
}

.meta-row:last-child { border: none; }

.meta-row .label { color: var(--text-dim); font-size: 0.85rem; }
.meta-row .value { font-weight: 600; font-size: 0.9rem; }

.tag {
  background: #ffffff;
  color: #050505;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.section-header {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.section-title {
  font-size: 1.25rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
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

.error-box {
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
}

.btn-primary {
  display: inline-block;
  margin-top: 1.5rem;
  background: #ffffff;
  color: #050505;
  padding: 0.65rem 1.5rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.875rem;
}

@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; }
  .side-info { order: -1; }
}

@media (max-width: 640px) {
  .stage-toolbar { flex-direction: column; gap: 1rem; align-items: flex-start; }
  .related-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
}
</style>
