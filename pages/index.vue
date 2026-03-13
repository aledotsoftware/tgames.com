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
            <img :src="'/_ipx/w_300&f_webp/' + (game.thumb_2 || game.thumb_1 || game.thumb_small)" :alt="game.title" loading="lazy"
              class="game-thumb" />
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
  const cursor = ref(null)
  const loadingMore = ref(false)
  const hasMore = ref(true)

  if (data.value && data.value.games) {
    games.value = [...data.value.games]
    if (games.value.length > 0) {
      const last = games.value[games.value.length - 1]
      cursor.value = `${last.upvote}_${last.views}_${last.id}`
    }
  }

  watch(data, (newData) => {
    if (newData && newData.games) {
      games.value = [...newData.games]
      if (games.value.length > 0) {
        const last = games.value[games.value.length - 1]
        cursor.value = `${last.upvote}_${last.views}_${last.id}`
      } else {
        cursor.value = null
      }
      hasMore.value = true
    }
  })

  const loadMoreGames = async () => {
    if (loadingMore.value || !hasMore.value) return

    loadingMore.value = true
    try {
      const res = await $fetch('/api/games', {
        query: {
          lang: locale.value,
          cursor: cursor.value
        }
      })

      if (res.games && res.games.length > 0) {
        games.value.push(...res.games)
        const last = res.games[res.games.length - 1]
        cursor.value = `${last.upvote}_${last.views}_${last.id}`
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
  .hero-section {
    min-height: 40vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4rem 1rem;
    background: #000000;
  }

  .hero-title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    margin-bottom: 1.5rem;
    color: var(--text-primary);
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto 3rem;
  }

  .hero-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    color: var(--text-primary);
    letter-spacing: 0.1em;
  }

  .stat-divider {
    width: 1px;
    height: 30px;
    background: var(--border-color);
  }

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
    background: #ffffff;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 2rem;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .game-card:hover .card-overlay {
    transform: translateY(0);
  }

  .play-btn {
    background: var(--accent);
    color: #000000;
    padding: 0.5rem 1.5rem;
    border-radius: 999px;
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
    border: 3px solid var(--bg-tertiary);
    border-top-color: var(--accent);
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
    background: var(--bg-secondary);
    border-radius: 12px;
    color: var(--text-primary);
  }

  @media (max-width: 640px) {
    .games-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
    }

    .hero-stats {
      gap: 1rem;
    }

    .stat-value {
      font-size: 1.2rem;
    }
  }
</style>