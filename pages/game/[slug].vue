<template>
  <div v-if="pending" class="text-center">{{ $t('loading_game') }}</div>
  
  <div v-else-if="error || !data" class="text-center" style="color:red;">
    <h2>{{ $t('error_prefix') }} {{ error?.message || $t('game_not_found') }}</h2>
    <NuxtLink :to="localePath('/')" style="text-decoration: underline; margin-top: 1rem; display: inline-block;">{{ $t('back_home') }}</NuxtLink>
  </div>

  <div v-else class="game-view-container">
    <div class="game-view-header">
      <h1 class="game-view-title">{{ data.game.title }}</h1>
      <NuxtLink :to="localePath('/')" class="back-link">{{ $t('back_catalog') }}</NuxtLink>
    </div>

    <div class="game-player" v-if="data.game.url">
      <!-- Using an iframe mapped directly to the url stored in your database -->
      <iframe 
        :src="data.game.url" 
        frameborder="0" 
        allowfullscreen="true"
        scrolling="no"
        :style="{ width: data.game.width === '100%' ? '100%' : (data.game.width || '800') + 'px', height: data.game.height === '100%' ? '600px' : (data.game.height || '600') + 'px' }"
      ></iframe>
    </div>

    <div class="game-view-info">
      <div v-if="data.game.description">
        <h3>{{ $t('description') }}</h3>
        <p v-html="data.game.description"></p>
      </div>

      <div v-if="data.game.instructions" style="margin-top: 2rem;">
        <h3>{{ $t('instructions') }}</h3>
        <p v-html="data.game.instructions"></p>
      </div>
      
      <div class="game-view-meta">
        <span class="meta-tag" v-if="data.game.category">{{ data.game.category }}</span>
        <span class="meta-stats">👁️ {{ data.game.views || 0 }}</span>
        
        <div class="meta-actions" style="display: flex; gap: 1rem; margin-left: auto;">
          <button @click="handleInteraction('like')" class="action-btn">
            👍 {{ $t('like') }} <span>{{ data.game.upvote || 0 }}</span>
          </button>
          <button @click="handleInteraction('dislike')" class="action-btn">
            👎 {{ $t('dislike') }} <span>{{ data.game.downvote || 0 }}</span>
          </button>
          <button @click="handleInteraction('report')" class="action-btn error-btn">
            🚩 {{ $t('report_bug') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()
const { addToRecentlyPlayed } = useRecentlyPlayed()

const { data, pending, error, refresh } = await useFetch(`/api/games/${route.params.slug}`, {
  query: { lang: locale }
})

onMounted(() => {
  if (data.value?.game) {
    addToRecentlyPlayed(data.value.game)
  }
})

useHead({
  title: computed(() => data.value?.game?.title ? `${data.value.game.title} - Tudex Games` : 'Cargando... - Tudex Games')
})

const handleInteraction = async (type) => {
  if (!data.value?.game?.id) return;
  try {
    const response = await $fetch('/api/interactions', {
      method: 'POST',
      body: { gameId: data.value.game.id, type }
    })
    
    // Quick optimistic update or just refresh
    if (response.success) {
      if (type === 'like') data.value.game.upvote = (data.value.game.upvote || 0) + 1;
      if (type === 'dislike') data.value.game.downvote = (data.value.game.downvote || 0) + 1;
      if (type === 'report') alert('Reported bug successfully. / Reporte enviado.');
    }
  } catch(e) {
    console.error('Failed to log interaction', e)
  }
}
</script>

<style scoped>
.game-view-container {
  max-width: 1000px;
  margin: 0 auto;
}

.game-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #333;
  padding-bottom: 1rem;
}

.game-view-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}

.back-link {
  color: #888;
  transition: color 0.2s;
}

.back-link:hover {
  color: #fff;
}

.game-player {
  background-color: #111;
  border-radius: 8px;
  border: 1px solid #333;
  padding: 1rem;
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  overflow: hidden;
}

.game-player iframe {
  max-width: 100%;
}

.game-view-info {
  background-color: #080808;
  border: 1px solid #222;
  border-radius: 8px;
  padding: 2rem;
}

.game-view-info h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  border-left: 3px solid #fff;
  padding-left: 0.5rem;
}

.game-view-info p {
  color: #ccc;
}

.game-view-meta {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px dashed #333;
}

.meta-tag {
  background-color: #fff;
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.meta-stats {
  color: #888;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.action-btn {
  background: #222;
  border: 1px solid #444;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.action-btn:hover {
  background: #333;
  border-color: #666;
}

.action-btn.error-btn {
  background: #3a1111;
  border-color: #6a1a1a;
  color: #ffbaba;
}

.action-btn.error-btn:hover {
  background: #501515;
}
</style>
