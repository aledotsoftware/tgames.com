<template>
  <div class="skeleton-card">
    <div class="skeleton-thumb"></div>
    <div class="skeleton-info">
      <div class="skeleton-title"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.skeleton-thumb {
  width: 100%;
  aspect-ratio: 1/1;
  background-color: var(--bg-tertiary);
  animation: pulse 2s infinite ease-in-out;
}

.skeleton-info {
  padding: 1.25rem;
}

.skeleton-title {
  height: 1rem;
  width: 80%;
  background-color: var(--bg-tertiary);
  border-radius: 4px;
  animation: pulse 2s infinite ease-in-out 0.2s;
}

@keyframes pulse {
  0% { opacity: 0.1; }
  50% { opacity: 0.3; }
  100% { opacity: 0.1; }
}
</style>
