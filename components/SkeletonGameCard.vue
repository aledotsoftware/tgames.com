<template>
  <div class="skeleton-card">
    <div class="skeleton-thumb-wrapper">
      <div class="skeleton-thumb"></div>
    </div>
    <div class="skeleton-info">
      <div class="skeleton-title"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.skeleton-thumb-wrapper {
  aspect-ratio: 1/1;
  border-radius: 13px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}

.skeleton-thumb {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.02) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite linear;
}

.skeleton-info {
  padding: 0.85rem 0.5rem 0.5rem;
}

.skeleton-title {
  height: 0.85rem;
  width: 75%;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  animation: shimmer 1.8s infinite linear 0.2s;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
