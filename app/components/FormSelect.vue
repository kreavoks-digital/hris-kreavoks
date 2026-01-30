<template>
  <div class="form-select">
    <label v-if="label" :for="selectId" class="label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <select :id="selectId" :value="modelValue" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)" :required="required" class="select">
      <option value="">Pilih {{ label }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number;
  label?: string;
  options: Array<{ value: string | number; label: string }>;
  required?: boolean;
  error?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const selectId = `select-${Math.random().toString(36).substring(7)}`;
</script>

<style scoped>
.form-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
}

.select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
}
</style>
