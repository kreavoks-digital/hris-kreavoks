<template>
  <div class="flex gap-1 p-1 bg-muted rounded-xl w-fit flex-wrap">
    <button
      @click="$emit('switch-tab', 'all')"
      :class="[
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        activeTab === 'all'
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      ]"
    >
      Semua Karyawan
    </button>
    <button
      @click="$emit('switch-tab', 'pending')"
      :class="[
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
        activeTab === 'pending'
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      ]"
    >
      Pending Intern
      <span
        v-if="pendingInternCount > 0"
        class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold ml-1"
      >
        {{ pendingInternCount }}
      </span>
    </button>
    <button
      @click="$emit('switch-tab', 'mentor')"
      :class="[
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
        activeTab === 'mentor'
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      ]"
    >
      Pendaftaran Mentor
      <span
        v-if="pendingMentorCount > 0"
        class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-kv-primary text-white text-[10px] font-bold ml-1"
      >
        {{ pendingMentorCount }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeTab: 'all' | 'pending' | 'mentor'
  pendingInternCount: number
  pendingMentorCount: number
}>()

defineEmits<{
  (e: 'switch-tab', tab: 'all' | 'pending' | 'mentor'): void
}>()
</script>
