<template>
  <div class="app-wrapper">
    <header class="navbar">
      <div class="navbar-inner flex-row">
        <NuxtLink :to="localePath('/')" class="logo-wrapper">
          <span class="logo-text font-logo">tudexgames</span>
        </NuxtLink>
        
        <div class="nav-actions">
          <div class="search-wrap">
            <SearchBar />
          </div>

          <div class="lang-switcher-wrap">
            <div class="custom-select-container">
              <select :value="locale" @change="handleLanguageChange" class="premium-lang-select">
                <option v-for="loc in locales" :key="loc.code" :value="loc.code">
                  {{ loc.code.toUpperCase() }}
                </option>
              </select>
              <span class="select-arrow"></span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <NuxtPage />
    </main>

    <footer class="main-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="font-logo footer-logo">tudexgames</span>
            <p class="footer-subtitle">{{ $t('site_title') }}</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} tudexgames. {{ $t('all_rights') }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const { locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const handleLanguageChange = (event) => {
  const newLocale = event.target.value
  navigateTo(switchLocalePath(newLocale))
}
</script>

<style>
.app-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

.flex-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo-text {
  font-size: 1.65rem;
  color: var(--text-primary);
  transition: var(--transition-smooth);
  letter-spacing: -0.04em;
}

.logo-text:hover {
  opacity: 0.85;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.search-wrap {
  width: 320px;
}

@media (max-width: 768px) {
  .search-wrap { display: none; }
  .nav-actions { gap: 0.75rem; }
}

/* Premium Select Styling */
.custom-select-container {
  position: relative;
  display: inline-block;
}

.premium-lang-select {
  appearance: none;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem 2rem 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.775rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: var(--transition-smooth);
  min-width: 72px;
}

.premium-lang-select:hover {
  border-color: var(--border-glow);
  background: rgba(255, 255, 255, 0.1);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid var(--text-primary);
  pointer-events: none;
}

.main-content {
  flex: 1;
  padding: 1.5rem 0 4rem;
}

.main-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 3.5rem 0 2rem;
  margin-top: 5rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: 2.5rem;
}

.footer-logo {
  font-size: 1.8rem;
}

.footer-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.footer-bottom {
  border-top: 1px solid var(--border-color);
  padding-top: 1.75rem;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.775rem;
  letter-spacing: 0.02em;
}

@media (max-width: 640px) {
  .logo-text { font-size: 1.35rem; }
}
</style>
