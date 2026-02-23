<template>
  <div>
    <h1 class="font-logo text-center" style="margin-bottom: 2rem; font-size: 2rem;">{{ $t('featured') }}</h1>
    
    <div v-if="pending && games.length === 0" class="text-center">{{ $t('loading_catalog') }}</div>
    <div v-else-if="error" class="text-center" style="color:red;">{{ $t('error_catalog') }} {{ error.message }}</div>

    <div v-else>
      <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
        <NuxtLink
          v-for="game in games"
          :key="game.id"
          :to="localePath(`/game/${game.slug}`)"
          class="game-card"
        >
          <div style="position: relative;">
            <img :src="game.thumb_2 || game.thumb_1 || game.thumb_small" :alt="game.title" loading="lazy" class="game-thumb" />
          </div>
          <div class="game-info">
            <h2 class="game-title">{{ game.title }}</h2>
          </div>
        </NuxtLink>
      </div>

      <div v-if="hasMore" class="text-center" style="margin-top: 2rem; margin-bottom: 2rem;">
        <button
          @click="loadMore"
          :disabled="isLoadingMore"
          class="load-more-btn"
          style="padding: 10px 20px; font-size: 1.2rem; cursor: pointer;"
        >
          {{ isLoadingMore ? $t('loading') : $t('load_more') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { locale } = useI18n()
const localePath = useLocalePath()

const games = ref([])
const offset = ref(0)
const isLoadingMore = ref(false)
const hasMore = ref(true)

// Load initial games (page 0)
const { data, pending, error } = await useFetch('/api/games', {
  query: { lang: locale, offset: 0 }
})

// Sync games with data from useFetch (handles SSR and hydration)
watch(data, (newData) => {
  if (newData && newData.games) {
    games.value = [...newData.games]
    hasMore.value = newData.games.length === 60
    offset.value = 0
  }
}, { immediate: true })

// Reset pagination when language changes
watch(locale, () => {
  offset.value = 0
  hasMore.value = true
  // useFetch will automatically re-run because 'locale' is in its query
})

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return

  isLoadingMore.value = true
  const nextOffset = offset.value + 60

  try {
    const newData = await $fetch('/api/games', {
      query: { lang: locale.value, offset: nextOffset }
    })

    if (newData && newData.games && newData.games.length > 0) {
      games.value.push(...newData.games)
      offset.value = nextOffset
      if (newData.games.length < 60) {
        hasMore.value = false
      }
    } else {
      hasMore.value = false
    }
  } catch (e) {
    console.error('Error loading more games:', e)
  } finally {
    isLoadingMore.value = false
  }
}
</script>
