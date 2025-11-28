<template>
  <div class="dashboard-card">
    <div class="card-icon">{{ icon }}</div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-value">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  value: number | string;
  icon: string;
}>();
</script>

<style scoped>
.dashboard-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 3rem;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.card-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}
</style>
