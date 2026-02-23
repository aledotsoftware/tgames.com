<template>
  <div>
    <h1 class="font-logo text-center" style="margin-bottom: 2rem; font-size: 2rem;">
      <span style="opacity: 0.6; font-size: 1.5rem;">{{ $t('category') }}:</span> {{ categoryName }}
    </h1>

    <div v-if="pending" class="text-center">{{ $t('loading_catalog') }}</div>
    <div v-else-if="error" class="text-center" style="color:red;">{{ $t('error_catalog') }} {{ error.message }}</div>

    <div v-else-if="!data?.games || data.games.length === 0" class="text-center" style="padding: 2rem;">
        <p>{{ $t('game_not_found') }}</p>
        <NuxtLink :to="localePath('/')" class="back-link">{{ $t('back_home') }}</NuxtLink>
    </div>

    <div v-else class="grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
      <NuxtLink
        v-for="game in data.games"
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
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()

const categoryName = computed(() => route.params.slug ? decodeURIComponent(route.params.slug) : '')

const { data, pending, error } = await useFetch('/api/games', {
  query: {
      lang: locale,
      category: categoryName
  },
  watch: [locale, categoryName]
})
</script>

<style scoped>
.back-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    border: 1px solid #333;
    border-radius: 4px;
    transition: all 0.2s;
    text-decoration: none;
    color: #fff;
}
.back-link:hover {
    background-color: #111;
    border-color: #fff;
}
</style>
