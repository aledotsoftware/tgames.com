<template>
  <div>
    <header class="navbar">
      <div class="container flex justify-between items-center">
        <NuxtLink :to="localePath('/')" class="logo font-logo">tudexgames</NuxtLink>
        <nav style="flex: 1; display: flex; justify-content: flex-end; align-items: center; margin-left: 2rem; gap: 1rem;">
          
          <div class="lang-switcher">
            <template v-for="(loc, index) in locales" :key="loc.code">
               <NuxtLink :to="switchLocalePath(loc.code)" :class="{ active: locale === loc.code }">
                 {{ loc.code.toUpperCase() }}
               </NuxtLink>
               <span v-if="index < locales.length - 1" class="separator">|</span>
            </template>
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
const { locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
</script>

<style>
.lang-switcher {
  display: flex;
  gap: 0.3rem;
  font-size: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: 400px;
  line-height: 1.2;
}

.lang-switcher a {
  color: #fff;
  text-decoration: none;
  font-weight: normal;
  opacity: 0.8;
}

.lang-switcher a:hover, .lang-switcher a.active {
  color: #fff;
  font-weight: bold;
  text-decoration: underline;
  opacity: 1;
}

.separator {
  color: #fff;
  opacity: 0.5;
}
</style>
