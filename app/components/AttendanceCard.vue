<template>
  <div class="attendance-card">
    <div class="card-header" :style="{ borderColor: getColor(color) }">
      <h3>{{ title }}</h3>
    </div>
    <div class="card-body">
      <p class="count" :style="{ color: getColor(color) }">{{ count }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  count: number;
  color: "green" | "yellow" | "orange" | "red";
}>();

const getColor = (color: string) => {
  const colors: Record<string, string> = {
    green: "#10b981",
    yellow: "#f59e0b",
    orange: "#f97316",
    red: "#ef4444",
  };
  return colors[color] || "#6b7280";
};
</script>

<style scoped>
.attendance-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1rem 1.5rem;
  border-left: 4px solid;
  background: #f9fafb;
}

.card-header h3 {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.count {
  margin: 0;
  font-size: 3rem;
  font-weight: bold;
}
</style>
