<template>
  <div class="error-page">
    <div class="content">
      <h1 class="error-code font-logo">{{ error.statusCode }}</h1>
      <h2 class="error-title">{{ title }}</h2>
      <p class="error-desc">{{ message }}</p>
      <button @click="handleError" class="btn-home">
        {{ $t('go_home') }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const { t } = useI18n()
const localePath = useLocalePath()

const handleError = () => clearError({ redirect: localePath('/') })

const title = computed(() => {
  if (props.error.statusCode === 404) return t('error_404_title')
  return t('error_500_title')
})

const message = computed(() => {
  if (props.error.statusCode === 404) return t('error_404_desc')
  return t('error_500_desc')
})
</script>

<style scoped>
.error-page {
  background-color: #000; /* Binary Palette */
  color: #fff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
}

.content {
  max-width: 600px;
}

.error-code {
  font-size: 6rem;
  line-height: 1;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-desc {
  font-size: 1.1rem;
  color: #ffffff;
  margin-bottom: 2rem;
}

.btn-home {
  border: 2px solid #fff;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  background: transparent;
  color: #fff;
}

.btn-home:hover {
  background-color: #fff;
  color: #000;
}
</style>
