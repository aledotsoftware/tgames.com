<template>
  <div>

    <!-- Games Section -->
    <section class="games-section section-padding">
      <div v-if="error" class="error-state">
        <p>{{ $t('error_catalog') }} {{ error.message }}</p>
      </div>

      <div v-else class="games-grid">
        <NuxtLink v-for="(game, index) in games" :key="game.id" :to="localePath(`/game/${game.slug}`)"
          class="game-card hover-lift" :style="{ animationDelay: (index % 10) * 0.05 + 's' }">
          <div class="thumb-wrapper">
            <NuxtImg :src="game.thumb_2 || game.thumb_1 || game.thumb_small" :alt="game.title" loading="lazy"
              class="game-thumb" sizes="300px sm:400px md:300px" format="webp" />
            <div class="card-overlay">
              <span class="play-btn">{{ $t('play') }}</span>
            </div>
          </div>
          <div class="game-info">
            <h3 class="game-title">{{ game.title }}</h3>
          </div>
        </NuxtLink>

        <!-- Skeletons while loading -->
        <SkeletonGameCard v-for="n in (pending && games.length === 0 ? 12 : (loadingMore ? 6 : 0))"
          :key="'loading-' + n" />
      </div>

      <div ref="sentinel" class="scroll-sentinel">
        <div v-if="loadingMore" class="loading-spinner"></div>
      </div>
    </section>
  </div>
</template>

<script setup>
  const { locale, t } = useI18n()
  const localePath = useLocalePath()

  const { data, pending, error } = await useFetch('/api/games', {
    query: { lang: locale }
  })

  useSeoMeta({
    title: () => t('site_title'),
    description: () => t('site_title')
  })

  const games = ref([])
  const page = ref(1)
  const loadingMore = ref(false)
  const hasMore = ref(true)

  if (data.value && data.value.games) {
    games.value = [...data.value.games]
  }

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
      rootMargin: '400px',
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

<style scoped>
  .section-header {
    margin-bottom: 3rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .section-line {
    flex: 1;
    height: 1px;
    background: var(--border-color); /* Solid white line */
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 2rem;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    /* Transparent background for strict binary palette - no dimming/grays */
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: var(--transition-smooth);
  }

  .game-card:hover .card-overlay {
    opacity: 1;
  }

  .play-btn {
    background: var(--text-primary); /* White */
    color: var(--bg-color); /* Black */
    padding: 0.5rem 1.5rem;
    border: 1px solid var(--bg-color); /* Ensure visibility if overlay is transparent? Or just rely on contrast */
    border-radius: 0; /* Architectural/Sharp */
    font-weight: 700;
    transform: translateY(10px);
    transition: var(--transition-smooth);
  }

  .game-card:hover .play-btn {
    transform: translateY(0);
  }

  .scroll-sentinel {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--bg-color);
    border-top-color: var(--text-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-state {
    padding: 4rem;
    text-align: center;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    border-radius: 0;
  }

  @media (max-width: 640px) {
    .games-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
    }
  }
</style>
