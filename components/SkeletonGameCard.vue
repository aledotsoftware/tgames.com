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
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #000;
}

.skeleton-thumb {
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #111;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-info {
  padding: 1rem;
}

.skeleton-title {
  height: 1.5rem;
  width: 70%;
  background-color: #111;
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 0.3; }
  50% { opacity: 0.7; }
  100% { opacity: 0.3; }
}
</style>
