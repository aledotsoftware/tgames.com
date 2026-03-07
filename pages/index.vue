<template>
  <div>
    <h1 class="font-logo text-center" style="margin-bottom: 2rem; font-size: 2rem;">{{ $t('featured') }}</h1>
    
    <div class="sort-buttons">
      <button
        v-for="sort in ['newest', 'most_viewed', 'top_rated']"
        :key="sort"
        @click="currentSort = sort"
        :class="['sort-btn', { active: currentSort === sort }]"
      >
        {{ $t(`sort_${sort}`) }}
      </button>
    </div>

    <div v-if="pending" class="text-center">{{ $t('loading_catalog') }}</div>
    <div v-else-if="error" class="text-center" style="color:red;">{{ $t('error_catalog') }} {{ error.message }}</div>

    <div v-else class="grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
      <NuxtLink 
        v-for="game in data?.games" 
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
  </div>
</template>

<script setup>
const { locale } = useI18n()
const localePath = useLocalePath()

const currentSort = ref('top_rated')

// Load games directly with useFetch
// The server API will handle the cache-aside pattern with Redis per language
const { data, pending, error } = await useFetch('/api/games', {
  query: {
    lang: locale,
    sort: currentSort
  },
  watch: [currentSort]
})
</script>

<style scoped>
.sort-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.sort-btn {
  background-color: transparent;
  color: #fff;
  border: 1px solid #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  font-size: 0.9rem;
}

.sort-btn:hover, .sort-btn.active {
  background-color: #fff;
  color: #000;
}
</style>
