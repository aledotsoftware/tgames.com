<template>
  <aside class="category-sidebar">
    <h3 class="font-logo category-title">{{ $t('categories') }}</h3>

    <div v-if="pending" class="loading">{{ $t('loading_catalog') }}</div>

    <nav v-else>
      <ul class="category-list">
        <li v-for="cat in data?.categories" :key="cat" class="category-item">
          <NuxtLink :to="localePath(`/category/${encodeURIComponent(cat)}`)" class="category-link" :class="{ 'active': currentCategory === cat }">
            {{ cat }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
const { data, pending } = await useFetch('/api/categories')
const localePath = useLocalePath()
const route = useRoute()

const currentCategory = computed(() => {
  // If we are on /category/Racing, route.params.slug is 'Racing'
  // But wait, the parameter name depends on the file name.
  // If I create pages/category/[slug].vue, it is slug.
  return route.params.slug ? decodeURIComponent(route.params.slug) : ''
})
</script>

<style scoped>
.category-sidebar {
  padding: 1rem 0;
}

.category-title {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  padding-left: 0.5rem;
}

.category-list {
  list-style: none;
  padding: 0;
}

.category-item {
  margin-bottom: 0.25rem;
}

.category-link {
  display: block;
  padding: 0.5rem;
  color: #888;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 4px;
  font-size: 0.95rem;
}

.category-link:hover {
  color: #fff;
  background-color: #111;
  padding-left: 0.75rem; /* Slight movement effect */
}

.category-link.active {
  color: #fff;
  font-weight: bold;
  background-color: #222;
  border-left: 2px solid #fff;
}

.loading {
  color: #666;
  font-size: 0.9rem;
  padding-left: 0.5rem;
}
</style>
