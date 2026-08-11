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
        @keydown.esc="closeSearch"
        type="text" 
        class="premium-search-input" 
        :placeholder="$t('search_placeholder')" 
        :aria-label="$t('search_placeholder')"
      />
      <button v-if="query" @click="clearSearch" class="clear-btn" aria-label="Clear">✕</button>
    </div>
    
    <Transition name="fade-slide">
      <div v-if="isOpen && query.trim().length >= 2" class="premium-search-dropdown">
        <div v-if="isSearching" class="search-state-message">
          <div class="search-spinner"></div>
        </div>

        <div v-else-if="results.length === 0" class="search-state-message text-dim">
          {{ $t('no_results') || 'Sin resultados' }}
        </div>

        <NuxtLink 
          v-else
          v-for="game in results" 
          :key="game.id" 
          :to="localePath(`/game/${game.slug}`)"
          class="premium-search-item"
          @click="closeSearch"
        >
          <div class="item-thumb-wrapper">
            <img
              :src="getThumbUrl(game.thumb_small || game.thumb_1)"
              :alt="game.title"
              class="item-thumb"
              loading="lazy"
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
const isSearching = ref(false)
const isOpen = ref(false)
let searchTimeout = null

const getThumbUrl = (thumbPath) => {
  if (!thumbPath) return '/pwa-192x192.png'
  const clean = thumbPath.startsWith('/') ? thumbPath : `/${thumbPath}`
  return clean
}

const onSearch = () => {
  clearTimeout(searchTimeout)
  if (!query.value.trim() || query.value.trim().length < 2) {
    results.value = []
    isOpen.value = false
    isSearching.value = false
    return
  }
  
  isOpen.value = true
  isSearching.value = true

  searchTimeout = setTimeout(async () => {
    try {
      const response = await $fetch(`/api/search`, {
        query: {
          q: query.value.trim(),
          lang: locale.value
        }
      })
      if (response && response.success) {
        results.value = response.games || []
      }
    } catch (e) {
      console.error('Search failed:', e)
      results.value = []
    } finally {
      isSearching.value = false
    }
  }, 200)
}

const clearSearch = () => {
  query.value = ''
  results.value = []
  isOpen.value = false
  isSearching.value = false
}

const closeSearch = () => {
  isOpen.value = false
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
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  padding: 0 1.1rem;
  transition: var(--transition-smooth);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.search-input-wrapper.is-active,
.search-input-wrapper:focus-within {
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 0 20px rgba(255, 255, 255, 0.12);
}

.search-svg-icon {
  width: 16px;
  height: 16px;
  margin-right: 0.65rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: var(--transition-smooth);
}

.search-input-wrapper:focus-within .search-svg-icon {
  color: #ffffff;
}

.premium-search-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.65rem 0;
  font-size: 0.85rem;
  font-weight: 500;
  outline: none;
}

.premium-search-input::placeholder {
  color: var(--text-dim);
  font-weight: 400;
}

.clear-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: var(--text-secondary);
  line-height: 1;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.premium-search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(10, 10, 14, 0.96);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  max-height: 420px;
  overflow-y: auto;
  z-index: 1100;
  padding: 0.6rem;
  box-shadow: 
    0 24px 60px rgba(0, 0, 0, 0.9), 
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.search-state-message {
  padding: 1.25rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-dim);
  display: flex;
  justify-content: center;
}

.search-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.premium-search-item {
  display: flex;
  align-items: center;
  padding: 0.7rem;
  border-radius: 14px;
  transition: var(--transition-smooth);
  gap: 0.85rem;
  border: 1px solid transparent;
}

.premium-search-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.item-thumb-wrapper {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
