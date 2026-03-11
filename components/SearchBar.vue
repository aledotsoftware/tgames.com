<template>
  <div class="premium-search-container" v-click-outside="closeSearch">
    <div class="search-input-wrapper" :class="{ 'is-active': query }">
      <span class="search-icon">🔍</span>
      <input 
        v-model="query" 
        @input="onSearch"
        type="text" 
        class="premium-search-input" 
        :placeholder="$t('search_placeholder')" 
        :aria-label="$t('search_placeholder')"
      />
      <button v-if="query" @click="query = ''; results = []" class="clear-btn">✕</button>
    </div>
    
    <Transition name="fade-slide">
      <div v-if="results.length > 0 && query" class="premium-search-dropdown shadow-2xl">
        <NuxtLink 
          v-for="game in results" 
          :key="game.id" 
          :to="localePath(`/game/${game.slug}`)"
          class="premium-search-item"
          @click="closeSearch"
        >
          <div class="item-thumb-wrapper">
            <img
              :src="'/_ipx/w_300&f_webp/' + (game.thumb_small || game.thumb_1)"
              :alt="game.title"
              class="item-thumb"
            />
          </div>
          <div class="item-details">
            <span class="item-title">{{ game.title }}</span>
            <span class="item-meta" v-if="game.category">{{ game.category }}</span>
          </div>
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const { locale } = useI18n()
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
  
  searchTimeout = setTimeout(async () => {
    try {
      const response = await $fetch(`/api/search?q=${encodeURIComponent(query.value)}&lang=${locale.value}`)
      if (response.success) {
        results.value = response.games
      }
    } catch (e) {
      console.error('Search failed:', e)
    }
  }, 300)
}

const closeSearch = () => {
  query.value = ''
  results.value = []
}

</script>

<style scoped>
.premium-search-container {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0 1rem;
  transition: var(--transition-smooth);
}

.search-input-wrapper.is-active,
.search-input-wrapper:focus-within {
  border-color: var(--border-glow);
  background: var(--bg-secondary);
}

.search-icon {
  font-size: 0.9rem;
  margin-right: 0.75rem;
}

.premium-search-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.75rem 0;
  font-size: 0.9rem;
  outline: none;
}

.clear-btn {
  font-size: 0.8rem;
  padding: 0.5rem;
}

.clear-btn:hover {
  background: #ffffff;
  color: #000000;
}

.premium-search-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  max-height: 480px;
  overflow-y: auto;
  z-index: 1100;
  padding: 0.5rem;
}

.premium-search-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 12px;
  transition: var(--transition-smooth);
  gap: 1rem;
}

.premium-search-item:hover {
  background: var(--bg-tertiary);
}

.item-thumb-wrapper {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  background: #000000;
}

.item-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.item-title {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  margin-top: 0.25rem;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  transform: translateY(-10px);
}
</style>
