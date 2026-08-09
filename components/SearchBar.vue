<template>
  <div class="premium-search-container" v-click-outside="closeSearch">
    <div class="search-input-wrapper" :class="{ 'is-active': query }">
      <svg class="search-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input 
        v-model="query" 
        @input="onSearch"
        type="text" 
        class="premium-search-input" 
        :placeholder="$t('search_placeholder')" 
        :aria-label="$t('search_placeholder')"
      />
      <button v-if="query" @click="query = ''; results = []" class="clear-btn" aria-label="Clear">✕</button>
    </div>
    
    <Transition name="fade-slide">
      <div v-if="results.length > 0 && query" class="premium-search-dropdown">
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
  }, 250)
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0 1rem;
  transition: var(--transition-smooth);
}

.search-input-wrapper.is-active,
.search-input-wrapper:focus-within {
  border-color: var(--border-glow);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.1);
}

.search-svg-icon {
  width: 16px;
  height: 16px;
  margin-right: 0.65rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.premium-search-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.6rem 0;
  font-size: 0.85rem;
  outline: none;
}

.premium-search-input::placeholder {
  color: var(--text-dim);
}

.clear-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 50%;
  color: var(--text-secondary);
  line-height: 1;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.premium-search-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  right: 0;
  background: rgba(13, 13, 13, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  max-height: 420px;
  overflow-y: auto;
  z-index: 1100;
  padding: 0.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.premium-search-item {
  display: flex;
  align-items: center;
  padding: 0.65rem;
  border-radius: 14px;
  transition: var(--transition-smooth);
  gap: 0.85rem;
}

.premium-search-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.item-thumb-wrapper {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 10px;
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
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.item-meta {
  font-size: 0.725rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.15rem;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
