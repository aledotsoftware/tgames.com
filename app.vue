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
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
const { locale } = useI18n()
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
</style>
