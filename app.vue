<template>
  <div>
    <header class="navbar">
      <div class="container flex justify-between items-center">
        <NuxtLink :to="localePath('/')" class="logo font-logo">tudexgames</NuxtLink>
        <nav style="flex: 1; display: flex; justify-content: flex-end; align-items: center; margin-left: 2rem; gap: 1rem;">
          
          <div class="lang-switcher">
            <select :value="locale" @change="e => setLocale(e.target.value)" class="lang-select">
              <option v-for="loc in locales" :key="loc.code" :value="loc.code">
                {{ loc.code.toUpperCase() }}
              </option>
            </select>
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
const { locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
</script>

<style>
.lang-select {
  background-color: #111;
  color: #fff;
  border: 1px solid #333;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}
.lang-select:hover {
  border-color: #666;
}
</style>
