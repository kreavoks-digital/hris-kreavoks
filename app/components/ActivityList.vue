<template>
  <div class="activity-list">
    <div v-for="activity in activities" :key="activity.id" class="activity-item">
      <div class="activity-icon">{{ activity.icon }}</div>
      <div class="activity-content">
        <p class="activity-title">{{ activity.title }}</p>
        <p class="activity-time">{{ formatTime(activity.timestamp) }}</p>
      </div>
    </div>
    <div v-if="!activities || activities.length === 0" class="empty-state">
      <p>Tidak ada aktivitas terbaru</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activities: Array<{
    id: string;
    icon: string;
    title: string;
    timestamp: string;
  }>;
}>();

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("id-ID");
};
</script>

<style scoped>
.activity-list {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 2rem;
}

.activity-content {
  flex: 1;
}

.activity-title {
  margin: 0 0 0.25rem 0;
  font-weight: 500;
  color: #1f2937;
}

.activity-time {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}
</style>
