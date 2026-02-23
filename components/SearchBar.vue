<template>
  <div class="search-container">
    <input 
      v-model="query" 
      @input="onSearch"
      type="text" 
      class="search-input" 
      :placeholder="$t('search_placeholder')" 
      aria-label="Buscar juegos"
    />
    <div v-if="results.length > 0 && query" class="search-dropdown">
      <NuxtLink 
        v-for="game in results" 
        :key="game.id" 
        :to="localePath(`/game/${game.slug}`)"
        class="search-item"
        @click="query = ''"
      >
        <img :src="game.thumb_small || game.thumb_1" :alt="game.title" class="search-thumb" />
        <span class="search-title">{{ game.title }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const localePath = useLocalePath()

const query = ref('')
const results = ref([])
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  if (!query.value.trim()) {
    results.value = []
    return
  }
  
  // Debounce API calls for typing
  searchTimeout = setTimeout(async () => {
    try {
      const response = await $fetch(`/api/search?q=${encodeURIComponent(query.value)}`)
      if (response.success) {
        results.value = response.games
      }
    } catch (e) {
      console.error('Search failed:', e)
    }
  }, 300)
}
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: transparent;
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #fff;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background-color: #000;
  border: 1px solid #333;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 50;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.search-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #111;
  transition: background-color 0.2s;
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background-color: #111;
}

.search-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
}

.search-title {
  font-size: 0.95rem;
}
</style>
