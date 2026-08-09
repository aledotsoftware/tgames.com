<template>
  <div>
    <!-- Games Section -->
    <section class="games-section container">
      <div v-if="error" class="error-state">
        <p>{{ $t('error_catalog') }} {{ error.message }}</p>
      </div>

      <div v-else class="games-grid">
        <NuxtLink 
          v-for="(game, index) in games" 
          :key="game.id" 
          :to="localePath(`/game/${game.slug}`)"
          class="game-card hover-lift animate-fade-in" 
          :style="{ animationDelay: Math.min((index % 12) * 0.03, 0.3) + 's' }"
        >
          <div class="thumb-wrapper">
            <img 
              :src="'/_ipx/w_300&f_webp/' + (game.thumb_2 || game.thumb_1 || game.thumb_small)" 
              :alt="game.title" 
              loading="lazy"
              class="game-thumb" 
            />
            <div class="card-overlay">
              <span class="play-btn">
                {{ $t('play') }} ➔
              </span>
            </div>
          </div>
          <div class="game-info">
            <h3 class="game-title">{{ game.title }}</h3>
          </div>
        </NuxtLink>

        <!-- Skeletons while loading -->
        <SkeletonGameCard v-for="n in (pending && games.length === 0 ? 18 : (loadingMore ? 6 : 0))"
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
  .games-section {
    padding-top: 1rem;
    padding-bottom: 3rem;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(5, 5, 5, 0.72);
    backdrop-filter: blur(8px);
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
    background: #ffffff;
    color: #050505;
    padding: 0.55rem 1.25rem;
    border-radius: 999px;
    font-size: 0.825rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    transform: translateY(8px) scale(0.95);
    transition: var(--transition-smooth);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  }

  .game-card:hover .play-btn {
    transform: translateY(0) scale(1);
  }

  .scroll-sentinel {
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-spinner {
    width: 36px;
    height: 36px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
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
    border-radius: 18px;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
  }

  @media (max-width: 640px) {
    .games-grid {
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 0.85rem;
    }

    .games-section {
      padding-top: 0.5rem;
    }
  }
</style>