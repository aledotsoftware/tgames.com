<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type || 'info'"
        @click="remove(toast.id)"
      >
        <span class="message">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  background: var(--bg-tertiary, #000000);
  color: var(--text-primary, #ffffff);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color, #ffffff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  min-width: 200px;
  max-width: 400px;
}

.toast.success { border-color: var(--accent, #ffffff); }
.toast.error { border-color: #ffffff; }
.toast.warning { border-color: #ffffff; }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
