<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <td v-for="column in columns" :key="column.key">
            <template v-if="column.key === 'actions'">
              <div class="actions">
                <button @click="$emit('edit', row)" class="btn-edit">✏️ Edit</button>
                <button @click="$emit('delete', row)" class="btn-delete">🗑️ Hapus</button>
              </div>
            </template>
            <template v-else-if="column.key === 'status'">
              <span :class="['status-badge', row[column.key]]">
                {{ row[column.key] }}
              </span>
            </template>
            <template v-else>
              {{ row[column.key] }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!data || data.length === 0" class="empty-state">
      <p>Tidak ada data</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns: Array<{ key: string; label: string }>;
  data: Array<any>;
}>();

defineEmits<{
  edit: [row: any];
  delete: [row: any];
}>();
</script>

<style scoped>
.data-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

tr:hover {
  background: #f9fafb;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-edit {
  background: #dbeafe;
  color: #1e40af;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #e5e7eb;
  color: #374151;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}
</style>
