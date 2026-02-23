<template>
  <div>
    <!-- Favorites Section -->
    <div v-if="favorites.length > 0" class="favorites-section">
      <h1 class="font-logo text-center" style="margin-bottom: 2rem; font-size: 2rem;">{{ $t('for_you') }}</h1>
      <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
        <NuxtLink
          v-for="game in favorites"
          :key="game.id"
          :to="localePath(`/game/${game.slug}`)"
          class="game-card"
        >
          <div style="position: relative;">
            <img :src="game.thumb_2 || game.thumb_1 || game.thumb_small" :alt="game.title" loading="lazy" class="game-thumb" />
            <button
              class="favorite-btn"
              @click.prevent="toggleFavorite(game)"
              :title="$t('remove_favorite')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
          </div>
          <div class="game-info">
            <h2 class="game-title">{{ game.title }}</h2>
          </div>
        </NuxtLink>
      </div>
      <hr style="border-color: #333; margin: 3rem 0;" />
    </div>

    <!-- Featured / Main Catalog -->
    <h1 class="font-logo text-center" style="margin-bottom: 2rem; font-size: 2rem;">{{ $t('featured') }}</h1>
    
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
          <button
            class="favorite-btn"
            @click.prevent="toggleFavorite(game)"
            :title="isFavorite(game.id) ? $t('remove_favorite') : $t('add_favorite')"
          >
            <svg v-if="isFavorite(game.id)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
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
const { favorites, loadFavorites, isFavorite, toggleFavorite } = useFavorites()

onMounted(() => {
  loadFavorites()
})

// Load games directly with useFetch
// The server API will handle the cache-aside pattern with Redis per language
const { data, pending, error } = await useFetch('/api/games', {
  query: { lang: locale }
})
</script>

<style scoped>
.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  z-index: 10;
}

.favorite-btn:hover {
  transform: scale(1.1);
  background: black;
  border-color: white;
}
</style>
