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

    <div v-if="relatedGames.length > 0" class="related-games-section">
      <h3>{{ $t('related_games') }}</h3>
      <div class="related-games-carousel">
        <NuxtLink
          v-for="game in relatedGames"
          :key="game.id"
          :to="localePath(`/game/${game.slug}`)"
          class="related-game-card"
        >
          <div class="card-thumb">
             <img :src="game.thumb_small || game.thumb_1" :alt="game.title" loading="lazy">
          </div>
          <div class="card-title">{{ game.title }}</div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()

const { data, pending, error, refresh } = await useFetch(`/api/games/${route.params.slug}`, {
  query: { lang: locale }
})

const stripHtml = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

const gameTitle = computed(() => data.value?.game?.title ? `${data.value.game.title} - Tudex Games` : 'Cargando... - Tudex Games')
const gameDescription = computed(() => data.value?.game?.description ? stripHtml(data.value.game.description).substring(0, 160) : 'Juega los mejores juegos online gratis en Tudex Games.')
const gameFullDescription = computed(() => data.value?.game?.description ? stripHtml(data.value.game.description) : 'Juega los mejores juegos online gratis en Tudex Games.')

const gameImage = computed(() => {
  if (!data.value?.game) return 'https://tudexgames.com/logo.png'
  const img = data.value.game.thumb_2 || data.value.game.thumb_1 || data.value.game.thumb_small
  if (!img) return 'https://tudexgames.com/logo.png'
  if (img.startsWith('http')) return img
  return `https://tudexgames.com${img.startsWith('/') ? '' : '/'}${img}`
})

const canonicalUrl = computed(() => {
  const currentSlug = route.params.slug
  const currentLocale = locale.value
  return `https://tudexgames.com/${currentLocale}/game/${currentSlug}/`
})

useSeoMeta({
  title: gameTitle,
  description: gameDescription,
  ogTitle: gameTitle,
  ogDescription: gameFullDescription,
  ogImage: gameImage,
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: gameTitle,
  twitterDescription: gameDescription,
  twitterImage: gameImage
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => {
        if (!data.value?.game) return '{}'

        const upvotes = data.value.game.upvote || 0
        const downvotes = data.value.game.downvote || 0
        const totalVotes = upvotes + downvotes

        const schema = {
          '@context': 'https://schema.org',
          '@type': 'VideoGame',
          name: data.value.game.title,
          description: gameFullDescription.value,
          image: gameImage.value,
          url: canonicalUrl.value,
          genre: data.value.game.category || 'Game',
          applicationCategory: 'Game',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          }
        }

        if (totalVotes > 0) {
           const ratingValue = (upvotes / totalVotes) * 5
           schema.aggregateRating = {
             '@type': 'AggregateRating',
             ratingValue: ratingValue.toFixed(1),
             ratingCount: totalVotes,
             bestRating: '5',
             worstRating: '1'
           }
        }

        return JSON.stringify(schema)
      })
    }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl }
  ]
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

.related-games-section {
  margin-top: 3rem;
  border-top: 1px solid #333;
  padding-top: 2rem;
}

.related-games-section h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.related-games-carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scroll-snap-type: x mandatory;
}

.related-games-carousel::-webkit-scrollbar {
  height: 8px;
}

.related-games-carousel::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

.related-games-carousel::-webkit-scrollbar-track {
  background: #111;
}

.related-game-card {
  flex: 0 0 200px;
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: #fff;
  transition: transform 0.2s, border-color 0.2s;
  scroll-snap-align: start;
}

.related-game-card:hover {
  transform: translateY(-4px);
  border-color: #666;
}

.card-thumb {
  width: 100%;
  aspect-ratio: 4/3;
  background: #222;
  overflow: hidden;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.related-game-card:hover .card-thumb img {
  transform: scale(1.05);
}

.card-title {
  padding: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
</style>
