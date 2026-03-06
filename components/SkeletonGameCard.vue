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
  background-color: #000000;
  border-bottom: 1px solid #ffffff;
  animation: pulse 2s infinite ease-in-out;
}

.skeleton-info {
  padding: 1.25rem;
}

.skeleton-title {
  height: 1rem;
  width: 80%;
  background-color: #000000;
  border: 1px dashed #ffffff;
  border-radius: 4px;
  animation: pulse 2s infinite ease-in-out 0.2s;
}

@keyframes pulse {
  0% { border-color: #ffffff; }
  50% { border-color: transparent; }
  100% { border-color: #ffffff; }
}
</style>
