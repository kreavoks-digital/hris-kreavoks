<template>
  <div class="pagination">
    <button @click="$emit('change', currentPage - 1)" :disabled="currentPage === 1" class="btn-page">← Previous</button>

    <div class="page-numbers">
      <button v-for="page in visiblePages" :key="page" @click="$emit('change', page)" :class="['btn-page', { active: page === currentPage }]">
        {{ page }}
      </button>
    </div>

    <button @click="$emit('change', currentPage + 1)" :disabled="currentPage === totalPages" class="btn-page">Next →</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

defineEmits<{
  change: [page: number];
}>();

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(props.totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-page {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #3b82f6;
}

.btn-page.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
