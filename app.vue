<template>
  <div class="app-wrapper">
    <header class="navbar">
      <div class="container flex-row">
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
            <span class="font-logo">tudexgames</span>
            <p>{{ $t('site_title') }}</p>
          </div>
          <div class="footer-links">
            <!-- Add future links here -->
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} Tudex Games. {{ $t('all_rights') }}</p>
        </div>
      </div>
    </footer>

    <!-- Global Background Elements for depth -->
    <div class="bg-glow"></div>
  </div>
</template>

<script setup>
const { locale, locales, setLocale } = useI18n()
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
}

.flex-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo-text {
  font-size: 1.75rem;
  color: var(--accent);
  transition: var(--transition-smooth);
}

.logo-text:hover {
  text-shadow: 0 0 15px var(--accent-glow);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.search-wrap {
  width: 300px;
}

@media (max-width: 768px) {
  .search-wrap { display: none; } /* On mobile search might need a different placement */
  .nav-actions { gap: 0.75rem; }
}

/* Premium Select Styling */
.custom-select-container {
  position: relative;
  display: inline-block;
}

.premium-lang-select {
  appearance: none;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem 2rem 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-smooth);
  min-width: 70px;
}

.premium-lang-select:hover {
  border-color: var(--border-glow);
  background: var(--bg-secondary);
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid var(--text-dim);
  pointer-events: none;
}

.main-content {
  flex: 1;
  padding: 2rem 0 5rem;
}

.main-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 4rem 0 2rem;
  margin-top: 4rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.footer-brand p {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.footer-bottom {
  border-top: 1px solid var(--border-color);
  padding-top: 2rem;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.8rem;
}

/* Background Depth Elements */
.bg-glow {
  position: fixed;
  top: -10%;
  right: -5%;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}

@media (max-width: 640px) {
  .logo-text { font-size: 1.4rem; }
  .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
}
</style>
