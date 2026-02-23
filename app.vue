<template>
  <div>
    <header class="navbar">
      <div class="container flex justify-between items-center">
        <NuxtLink :to="localePath('/')" class="logo font-logo">tudexgames</NuxtLink>
        <nav style="flex: 1; display: flex; justify-content: flex-end; align-items: center; margin-left: 2rem; gap: 1rem;">
          
          <div class="lang-switcher" style="display: flex; gap: 0.5rem; font-size: 0.8rem;">
            <NuxtLink :to="switchLocalePath('en')" :class="{ active: locale === 'en' }">EN</NuxtLink>
            <span style="color: #444;">|</span>
            <NuxtLink :to="switchLocalePath('es')" :class="{ active: locale === 'es' }">ES</NuxtLink>
            <span style="color: #444;">|</span>
            <NuxtLink :to="switchLocalePath('it')" :class="{ active: locale === 'it' }">IT</NuxtLink>
          </div>

          <SearchBar />
        </nav>
      </div>
    </header>

    <main class="container">
      <div class="layout-wrapper">
        <CategorySidebar class="sidebar-col" />
        <div class="content-col">
          <NuxtPage />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
const { locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
</script>

<style>
.lang-switcher a {
  color: #888;
  text-decoration: none;
  transition: color 0.2s;
}
.lang-switcher a:hover, .lang-switcher a.active {
  color: #fff;
  font-weight: bold;
}

.layout-wrapper {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding-bottom: 2rem;
}

.sidebar-col {
  width: 250px;
  flex-shrink: 0;
  border-right: 1px solid #222;
  padding-right: 1rem;
}

.content-col {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .layout-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-col {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #222;
    padding-right: 0;
    padding-bottom: 1rem;
  }
}
</style>
