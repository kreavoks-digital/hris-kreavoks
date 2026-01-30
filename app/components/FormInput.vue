<template>
  <div class="form-input">
    <label v-if="label" :for="inputId" class="label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <textarea v-if="type === 'textarea'" :id="inputId" :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" :placeholder="placeholder" :required="required" class="textarea" rows="4" />
    <input v-else :id="inputId" :type="type" :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" :placeholder="placeholder" :required="required" class="input" />
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const inputId = `input-${Math.random().toString(36).substring(7)}`;
</script>

<style scoped>
.form-input {
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

.input,
.textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea {
  resize: vertical;
  font-family: inherit;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
}
</style>
