<template>
  <div class="app-wrapper">
    <header class="navbar" :class="{ 'scrolled': isScrolled }">
      <div class="navbar-inner flex-row">
        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="logo-wrapper">
          <span class="logo-text font-logo">tudexgames</span>
        </NuxtLink>

        <!-- Nav Actions -->
        <div class="nav-actions">
          <div class="search-wrap desktop-only">
            <SearchBar />
          </div>

          <!-- Language Selector -->
          <div class="lang-switcher-wrap desktop-only">
            <div class="custom-select-container">
              <svg class="globe-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <select :value="currentLocale" @change="handleLanguageChange" class="premium-lang-select" aria-label="Select Language">
                <option 
                  v-for="loc in locales" 
                  :key="typeof loc === 'string' ? loc : loc.code" 
                  :value="typeof loc === 'string' ? loc : loc.code"
                  :selected="(typeof loc === 'string' ? loc : loc.code) === currentLocale"
                >
                  {{ (typeof loc === 'object' && loc.name) ? `${loc.name} (${loc.code.toUpperCase()})` : (typeof loc === 'string' ? loc.toUpperCase() : loc.code.toUpperCase()) }}
                </option>
              </select>
              <span class="select-arrow"></span>
            </div>
          </div>

          <!-- Tudex Networks SSO Auth Control -->
          <div class="auth-wrap desktop-only">
            <button v-if="!isLoggedIn" @click="loginWithTudex" class="tudex-login-btn">
              <svg class="tudex-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span>{{ $t('login_tudex') }}</span>
            </button>

            <div v-else class="user-profile-menu">
              <button @click="userMenuOpen = !userMenuOpen" class="user-menu-trigger">
                <img v-if="user?.picture" :src="user.picture" :alt="user.name" class="user-avatar-img" />
                <span v-else class="user-avatar-initial">{{ (user?.name || 'U').charAt(0).toUpperCase() }}</span>
                <span class="user-display-name">{{ user?.name }}</span>
                <svg class="chevron-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              <Transition name="fade-slide">
                <div v-if="userMenuOpen" class="user-dropdown-card glass-panel">
                  <div class="user-card-header">
                    <span class="header-name">{{ user?.name }}</span>
                    <span class="header-email" v-if="user?.email">{{ user.email }}</span>
                  </div>
                  <div class="user-card-divider"></div>
                  <a href="https://passport.tudexnetworks.com" target="_blank" rel="noopener" class="user-card-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Mi Cuenta (Tudex Networks)</span>
                  </a>
                  <button @click="logoutTudex" class="user-card-item danger">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </Transition>
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
              <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>{{ $t('home') || 'Inicio' }}</span>
            </NuxtLink>
          </div>
          <div class="mobile-lang-wrap">
            <label class="mobile-lang-label">{{ $t('select_language') || 'Idioma' }}</label>
            <div class="mobile-select-box">
              <svg class="globe-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <select :value="currentLocale" @change="handleMobileLanguageChange" class="mobile-lang-select">
                <option 
                  v-for="loc in locales" 
                  :key="typeof loc === 'string' ? loc : loc.code" 
                  :value="typeof loc === 'string' ? loc : loc.code"
                  :selected="(typeof loc === 'string' ? loc : loc.code) === currentLocale"
                >
                  {{ (typeof loc === 'object' && loc.name) ? `${loc.name} (${loc.code.toUpperCase()})` : (typeof loc === 'string' ? loc.toUpperCase() : loc.code.toUpperCase()) }}
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
const route = useRoute()
const { locale, locales, setLocale, setLocaleCookie } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const currentLocale = computed(() => {
  const pathSegments = (route.path || '').split('/').filter(Boolean)
  const urlLocale = pathSegments[0]
  const rawLocales = unref(locales) || []
  const availableCodes = rawLocales.map(l => typeof l === 'string' ? l : l.code)
  
  if (urlLocale && availableCodes.includes(urlLocale)) {
    return urlLocale
  }
  const activeLoc = unref(locale)
  return activeLoc || 'es'
})

const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const isScrolled = ref(false)

const { data: authData } = await useFetch('/api/auth/me')

const user = computed(() => authData.value?.user || null)
const isLoggedIn = computed(() => !!authData.value?.authenticated)

const loginWithTudex = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/api/auth/login'
  }
}

const logoutTudex = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/api/auth/logout'
  }
}

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
   MINIMALIST MONOCHROME NAVBAR DESIGN
   ========================================================================== */

.navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
  margin: 0;
  padding: 0;
  background: rgba(10, 10, 14, 0.88);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  transition: var(--transition-smooth);
}

.navbar.scrolled {
  background: rgba(6, 6, 8, 0.96);
  border-bottom-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.95);
}

.navbar-inner {
  width: 100%;
  height: 72px;
  padding: 0 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Clean Logo */
.logo-wrapper {
  display: inline-flex;
  align-items: center;
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
}

.logo-wrapper:hover .logo-text {
  opacity: 0.85;
}

/* Desktop Category Navigation Tabs */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-pill-link {
  font-size: 0.875rem;
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
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.upload-btn {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-weight: 600;
}

.upload-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.upload-plus {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
}

/* Actions Section */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-wrap {
  width: 240px;
  transition: var(--transition-smooth);
}

.search-wrap:focus-within {
  width: 320px;
}

/* Language Switcher */
.lang-switcher-wrap {
  position: relative;
}

.custom-select-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  padding: 0 0.85rem;
  transition: var(--transition-smooth);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.custom-select-container:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.globe-svg-icon {
  width: 15px;
  height: 15px;
  color: var(--text-secondary);
  flex-shrink: 0;
  margin-right: 0.4rem;
}

.premium-lang-select {
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.5rem 1.4rem 0.5rem 0;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.premium-lang-select option {
  background: #0d0d12;
  color: #ffffff;
  padding: 0.5rem;
}

.select-arrow {
  position: absolute;
  right: 0.85rem;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid var(--text-secondary);
  pointer-events: none;
  transition: var(--transition-smooth);
}

/* Mobile Toggle */
.mobile-toggle-btn {
  display: none;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  width: 42px;
  height: 42px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.mobile-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.3);
}

.hamburger-icon {
  width: 18px;
  height: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background: #ffffff;
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger-icon.open span:nth-child(1) {
  transform: translateY(5px) rotate(45deg);
}

.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
}

.hamburger-icon.open span:nth-child(3) {
  transform: translateY(-5px) rotate(-45deg);
}

/* Mobile Drawer */
.mobile-menu-drawer {
  margin-top: 0.75rem;
  padding: 1.25rem;
  border-radius: 8px;
  background: rgba(10, 10, 14, 0.96);
  backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.925rem;
  transition: var(--transition-smooth);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-svg-icon {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
}

.mobile-nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.mobile-lang-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-lang-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.mobile-select-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 0 0.85rem;
}

.mobile-lang-select {
  width: 100%;
  background: transparent;
  border: none;
  color: #ffffff;
  padding: 0.75rem 0.5rem 0.75rem 0;
  font-size: 0.875rem;
  outline: none;
}

.mobile-drawer-enter-active,
.mobile-drawer-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-drawer-enter-from,
.mobile-drawer-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Layout Main Content */
.main-content {
  flex: 1;
}

/* Footer */
.main-footer {
  margin-top: 4rem;
  background: #08080a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem 0 2rem;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-logo {
  font-size: 1.5rem;
  color: #ffffff;
}

.footer-subtitle {
  color: var(--text-dim);
  font-size: 0.875rem;
}

.footer-bottom {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-dim);
}

@media (max-width: 900px) {
  .desktop-only { display: none; }
  .mobile-toggle-btn { display: flex; }
  .desktop-nav { display: none; }
  .search-wrap { width: 100%; }
}
</style>
