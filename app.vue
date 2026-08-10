<template>
  <div class="app-wrapper">
    <header class="navbar" :class="{ 'scrolled': isScrolled }">
      <div class="navbar-inner flex-row">
        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="logo-wrapper">
          <span class="logo-text font-logo">tudexgames</span>
          <span class="pulse-indicator" title="Online">
            <span class="pulse-ring"></span>
            <span class="pulse-dot"></span>
          </span>
        </NuxtLink>

        <!-- Desktop Category Nav -->
        <nav class="desktop-nav" aria-label="Main Navigation">
          <NuxtLink :to="localePath('/')" class="nav-pill-link" active-class="active">
            <span class="nav-text">{{ $t('home') || 'Inicio' }}</span>
          </NuxtLink>
          <NuxtLink :to="localePath('/upload')" class="nav-pill-link upload-btn" active-class="active">
            <span class="upload-plus">+</span>
            <span class="nav-text">{{ $t('upload') || 'Subir' }}</span>
          </NuxtLink>
        </nav>

        <!-- Nav Actions -->
        <div class="nav-actions">
          <div class="search-wrap desktop-only">
            <SearchBar />
          </div>

          <!-- Language Selector -->
          <div class="lang-switcher-wrap desktop-only">
            <div class="custom-select-container">
              <span class="globe-icon">🌐</span>
              <select :value="locale" @change="handleLanguageChange" class="premium-lang-select" aria-label="Select Language">
                <option v-for="loc in locales" :key="loc.code" :value="loc.code">
                  {{ loc.name ? `${loc.name} (${loc.code.toUpperCase()})` : loc.code.toUpperCase() }}
                </option>
              </select>
              <span class="select-arrow"></span>
            </div>
          </div>

          <!-- Mobile Toggle Button -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="mobile-toggle-btn" aria-label="Toggle Menu">
            <span class="hamburger-icon" :class="{ 'open': mobileMenuOpen }">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <Transition name="mobile-drawer">
        <div v-if="mobileMenuOpen" class="mobile-menu-drawer glass-panel">
          <div class="mobile-search-wrap">
            <SearchBar @select="mobileMenuOpen = false" />
          </div>
          <div class="mobile-nav-links">
            <NuxtLink :to="localePath('/')" @click="mobileMenuOpen = false" class="mobile-nav-item">
              <span class="item-icon">🏠</span>
              <span>{{ $t('home') || 'Inicio' }}</span>
            </NuxtLink>
            <NuxtLink :to="localePath('/upload')" @click="mobileMenuOpen = false" class="mobile-nav-item upload-item">
              <span class="item-icon">🚀</span>
              <span>{{ $t('upload') || 'Subir Juego' }}</span>
            </NuxtLink>
          </div>
          <div class="mobile-lang-wrap">
            <label class="mobile-lang-label">{{ $t('select_language') || 'Idioma' }}</label>
            <div class="mobile-select-box">
              <span class="globe-icon">🌐</span>
              <select :value="locale" @change="handleMobileLanguageChange" class="mobile-lang-select">
                <option v-for="loc in locales" :key="loc.code" :value="loc.code">
                  {{ loc.name ? `${loc.name} (${loc.code.toUpperCase()})` : loc.code.toUpperCase() }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </Transition>
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
const { locale, locales, setLocale, setLocaleCookie } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

const handleLanguageChange = async (event) => {
  const newLocale = event.target.value
  if (!newLocale || newLocale === locale.value) return

  if (typeof setLocaleCookie === 'function') {
    setLocaleCookie(newLocale)
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('i18n_locale', newLocale)
  }

  const targetPath = switchLocalePath ? switchLocalePath(newLocale) : null

  if (typeof setLocale === 'function') {
    await setLocale(newLocale)
  } else if (targetPath) {
    await navigateTo(targetPath)
  }
}

const handleMobileLanguageChange = async (event) => {
  await handleLanguageChange(event)
  mobileMenuOpen.value = false
}

const handleScroll = () => {
  if (typeof window !== 'undefined') {
    isScrolled.value = window.scrollY > 20
  }
}

onMounted(() => {
  if (typeof localStorage !== 'undefined' && locale.value) {
    localStorage.setItem('i18n_locale', locale.value)
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
  }
})
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

/* ==========================================================================
   HIGH-END GRAPHIC NAVBAR DESIGN SYSTEM
   ========================================================================== */

.navbar {
  position: sticky;
  top: 1.25rem;
  z-index: 1000;
  margin: 0 auto;
  max-width: var(--container-max);
  padding: 0 1.25rem;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), padding 0.4s ease;
}

.navbar.scrolled {
  top: 0.75rem;
}

.navbar-inner {
  background: rgba(10, 10, 14, 0.78);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  height: 68px;
  padding: 0 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.2), 
    0 20px 40px rgba(0, 0, 0, 0.7),
    0 0 30px rgba(255, 255, 255, 0.03);
  transition: var(--transition-smooth);
}

.navbar.scrolled .navbar-inner {
  background: rgba(8, 8, 10, 0.92);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.3), 
    0 24px 48px rgba(0, 0, 0, 0.85),
    0 0 40px rgba(255, 255, 255, 0.05);
}

/* Logo & Live Indicator */
.logo-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #d0d0d5 50%, #a0a0a5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: var(--transition-smooth);
  letter-spacing: -0.05em;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.logo-wrapper:hover .logo-text {
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.5));
  opacity: 0.95;
}

/* Pulsing Cyber Dot */
.pulse-indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 10px;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  background: #00ff87;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff87;
}

.pulse-ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px solid #00ff87;
  animation: pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

@keyframes pulseRing {
  0% { transform: scale(0.6); opacity: 0.9; }
  50% { transform: scale(1.6); opacity: 0.2; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* Desktop Category Navigation Tabs */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-pill-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  transition: var(--transition-smooth);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid transparent;
}

.nav-pill-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.nav-pill-link.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.upload-btn {
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.upload-btn:hover {
  border-color: #ffffff;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.15);
}

.upload-plus {
  font-weight: 700;
  font-size: 1rem;
  line-height: 1;
}

/* Nav Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.search-wrap {
  width: 300px;
}

/* Premium Language Selector */
.custom-select-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.globe-icon {
  position: absolute;
  left: 12px;
  font-size: 0.85rem;
  pointer-events: none;
  opacity: 0.85;
}

.premium-lang-select {
  appearance: none;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  padding: 0.5rem 2.2rem 0.5rem 2.2rem;
  border-radius: 999px;
  font-size: 0.775rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: var(--transition-smooth);
  min-width: 140px;
}

.premium-lang-select option {
  background: #0d0d12;
  color: #ffffff;
  padding: 8px;
}

.premium-lang-select:hover {
  border-color: var(--border-glow);
  background: rgba(255, 255, 255, 0.14);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.08);
}

.select-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid var(--text-primary);
  pointer-events: none;
}

/* Mobile Toggle */
.mobile-toggle-btn {
  display: none;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.6rem;
  border-radius: 14px;
  transition: var(--transition-smooth);
}

.mobile-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.3);
}

.hamburger-icon {
  width: 20px;
  height: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.hamburger-icon span {
  display: block;
  height: 2px;
  width: 100%;
  background: #ffffff;
  border-radius: 2px;
  transition: var(--transition-smooth);
}

.hamburger-icon.open span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
}

.hamburger-icon.open span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* Mobile Drawer Overlay */
.mobile-menu-drawer {
  position: absolute;
  top: calc(68px + 1rem);
  left: 1.25rem;
  right: 1.25rem;
  background: rgba(10, 10, 14, 0.95);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.9), 
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  transition: var(--transition-smooth);
}

.mobile-nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.mobile-lang-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1.25rem;
}

.mobile-lang-label {
  font-size: 0.725rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
}

.mobile-select-box {
  position: relative;
  display: flex;
  align-items: center;
}

.mobile-lang-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
  color: #ffffff;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Drawer Animation */
.mobile-drawer-enter-active, .mobile-drawer-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-drawer-enter-from, .mobile-drawer-leave-to {
  opacity: 0;
  transform: translateY(-14px) scale(0.97);
}

/* Responsive Rules */
@media (max-width: 900px) {
  .desktop-only, .desktop-nav { display: none; }
  .mobile-toggle-btn { display: block; }
  .logo-text { font-size: 1.45rem; }
}
</style>
