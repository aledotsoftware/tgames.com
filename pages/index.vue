<template>
  <div>
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

// Load games directly with useFetch
// The server API will handle the cache-aside pattern with Redis per language
const { data, pending, error } = await useFetch('/api/games', {
  query: { lang: locale }
})
</script>
