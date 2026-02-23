<template>
  <div>
    <h1 class="font-logo text-center" style="margin-bottom: 2rem; font-size: 2rem;">{{ $t('featured') }}</h1>
    
    <div v-if="pending" class="text-center">{{ $t('loading_catalog') }}</div>
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

      <!-- Sentinel for Infinite Scroll -->
      <div ref="sentinel" style="height: 20px; margin: 20px 0;"></div>

      <!-- Loading Indicator -->
      <div v-if="loadingMore" class="text-center" style="padding: 20px;">
        {{ $t('loading_catalog') || 'Loading...' }}
      </div>
    </div>
  </div>
</template>

<script setup>
const { locale } = useI18n()
const localePath = useLocalePath()

// Load games directly with useFetch
// The server API will handle the cache-aside pattern with Redis per language
const { data, pending, error } = await useFetch('/api/games', {
  query: { lang: locale }
})

const games = ref([])
const page = ref(1)
const loadingMore = ref(false)
const hasMore = ref(true)

// Initialize games from initial fetch
if (data.value && data.value.games) {
    games.value = [...data.value.games]
}

// Watch for locale/data changes to reset list
watch(data, (newData) => {
    if (newData && newData.games) {
        games.value = [...newData.games]
        page.value = 1
        hasMore.value = true
    }
})

const loadMoreGames = async () => {
    if (loadingMore.value || !hasMore.value) return

    loadingMore.value = true
    try {
        page.value++
        const res = await $fetch('/api/games', {
            query: {
                lang: locale.value,
                page: page.value
            }
        })

        if (res.games && res.games.length > 0) {
            games.value.push(...res.games)
        } else {
            hasMore.value = false
        }
    } catch (e) {
        console.error('Error loading more games:', e)
    } finally {
        loadingMore.value = false
    }
}

const sentinel = ref(null)
let observer

onMounted(() => {
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadMoreGames()
        }
    }, {
        rootMargin: '200px', // Load before reaching bottom
        threshold: 0.1
    })

    if (sentinel.value) {
        observer.observe(sentinel.value)
    }
})

watch(sentinel, (newVal) => {
    if (newVal && observer) {
        observer.observe(newVal)
    }
})

onUnmounted(() => {
    if (observer) observer.disconnect()
})
</script>
