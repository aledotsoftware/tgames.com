<template>
  <div v-if="pending" class="loading-full">
    <div class="loader-content">
      <div class="spinner"></div>
      <p>{{ $t('loading_game') }}</p>
    </div>
  </div>
  
  <div v-else-if="error || !data" class="error-container">
    <div class="error-box glass-panel animate-fade-in">
      <h2>{{ $t('error_prefix') }}</h2>
      <p>{{ error?.message || $t('game_not_found') }}</p>
      <NuxtLink :to="localePath('/')" class="btn-primary">{{ $t('back_home') }}</NuxtLink>
    </div>
  </div>

  <div v-else class="game-page animate-fade-in">
    <div class="game-container">
      <!-- Breadcrumbs / Top Nav -->
      <nav class="game-nav container">
        <NuxtLink :to="localePath('/')" class="nav-back">
           {{ $t('back_catalog') }}
        </NuxtLink>
      </nav>

      <!-- Main Stage -->
      <div class="game-stage shadow-xl">
        <div class="stage-inner" v-if="data.game.url">
          <iframe 
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
        
        <div class="stage-toolbar container">
          <h1 class="stage-title">{{ data.game.title }}</h1>
          <div class="stage-actions">
            <button @click="handleInteraction('like')" class="btn-icon" title="Like">
              👍 <span>{{ data.game.upvote || 0 }}</span>
            </button>
            <button @click="handleInteraction('dislike')" class="btn-icon" title="Dislike">
              👎 <span>{{ data.game.downvote || 0 }}</span>
            </button>
            <button @click="toggleFullscreen" class="btn-icon" title="Fullscreen">
              ⛶
            </button>
            <button @click="handleInteraction('report')" class="btn-icon btn-danger" title="Report">
              🚩
            </button>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="game-content-wrap container section-padding">
        <div class="content-grid">
          <div class="main-info">
            <section class="info-block glass-panel" v-if="sanitizedDescription">
              <h3>{{ $t('description') }}</h3>
              <div class="content-text" v-html="sanitizedDescription"></div>
            </section>

            <section class="info-block glass-panel" v-if="sanitizedInstructions">
              <h3>{{ $t('instructions') }}</h3>
              <div class="content-text" v-html="sanitizedInstructions"></div>
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

            <!-- Ad Space or Mini Catalog -->
          </aside>
        </div>
      </div>

      <!-- Related Games Section -->
      <section v-if="relatedGames.length > 0" class="related-section container">
        <div class="section-header">
          <h2>{{ $t('related_games') }}</h2>
          <div class="section-line"></div>
        </div>
        <div class="related-grid">
          <NuxtLink
            v-for="game in relatedGames.slice(0, 12)"
            :key="game.id"
            :to="localePath(`/game/${game.slug}`)"
            class="related-card hover-lift"
          >
            <div class="rel-thumb">
               <img :src="game.thumb_small || game.thumb_1" :alt="game.title" loading="lazy">
            </div>
            <div class="rel-title">{{ game.title }}</div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import DOMPurify from 'isomorphic-dompurify'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const { data, pending, error } = await useFetch(`/api/games/${route.params.slug}`, {
  query: { lang: locale }
})

const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, '') : ''

const gameTitle = computed(() => data.value?.game?.title ? `${data.value.game.title} - Tudex Games` : t('site_title'))
const gameDesc = computed(() => data.value?.game?.description ? stripHtml(data.value.game.description).substring(0, 160) : t('site_title'))

const sanitizedDescription = computed(() => {
  return data.value?.game?.description ? DOMPurify.sanitize(data.value.game.description) : ''
})

const sanitizedInstructions = computed(() => {
  return data.value?.game?.instructions ? DOMPurify.sanitize(data.value.game.instructions) : ''
})

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
      if (type === 'report') alert(t('feedback_report'));
    }
  } catch(e) { console.error(e) }
}

const toggleFullscreen = () => {
    const stage = document.querySelector('.stage-inner iframe')
    if (stage) {
        if (stage.requestFullscreen) stage.requestFullscreen()
        else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen()
        else if (stage.msRequestFullscreen) stage.msRequestFullscreen()
    }
}
</script>

<style scoped>
.loading-full {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-content {
  text-align: center;
  color: var(--text-secondary);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--bg-tertiary);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.game-nav {
  padding: 1rem 2rem;
}

.nav-back {
  color: var(--text-secondary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-back:hover { color: var(--accent); }

.game-stage {
  background: #050505;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 2rem 0;
}

.stage-inner {
  max-width: fit-content;
  margin: 0 auto;
  background: #000;
  border-radius: 8px;
  box-shadow: 0 0 100px rgba(0,0,0,0.8);
  overflow: hidden;
  position: relative;
}

.game-iframe {
  max-width: 100vw;
  display: block;
}

.stage-toolbar {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-title {
  font-size: 1.75rem;
  margin: 0;
}

.stage-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-icon {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon:hover {
  background: var(--bg-secondary);
  border-color: var(--accent);
}

.btn-danger:hover {
  border-color: #ff4444;
  color: #ff4444;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}

.info-block {
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.info-block h3 {
  font-size: 1.25rem;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1.5rem;
}

.content-text {
  color: var(--text-secondary);
  font-size: 1.05rem;
}

.meta-card {
  padding: 1.5rem;
  border-radius: 16px;
  position: sticky;
  top: 100px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.meta-row:last-child { border: none; }

.meta-row .label { color: var(--text-dim); font-size: 0.9rem; }
.meta-row .value { font-weight: 600; }

.tag {
  background: var(--accent);
  color: #000;
  padding: 0.1rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.related-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.rel-thumb { aspect-ratio: 1/1; overflow: hidden; }
.rel-thumb img { width: 100%; height: 100%; object-fit: cover; }
.rel-title {
  padding: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; }
  .side-info { order: -1; }
}

@media (max-width: 640px) {
  .stage-toolbar { flex-direction: column; gap: 1rem; align-items: flex-start; }
}
</style>
