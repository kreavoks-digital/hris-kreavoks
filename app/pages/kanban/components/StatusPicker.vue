<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover'
import {
  Search,
  Check,
  Plus,
  ChevronDown
} from 'lucide-vue-next'
import type { TaskStatus, KanbanColumnDef } from '../types'
import { hexToRgba, DEFAULT_COLUMNS } from '../hooks/useKanban'

const props = withDefaults(
  defineProps<{
    modelValue?: TaskStatus
    columns?: KanbanColumnDef[]
    disabled?: boolean
    class?: string
  }>(),
  {
    modelValue: 'TODO',
    columns: () => DEFAULT_COLUMNS,
    disabled: false,
    class: ''
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: TaskStatus): void
  (e: 'addStatus', label: string, color?: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const selectedColor = ref('#8b5cf6')

const COLOR_OPTIONS = [
  '#64748b', '#4082e6', '#f59e0b', '#10b981',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
]

const currentColumn = computed<KanbanColumnDef>(() => {
  const found = props.columns?.find(c => c.id === props.modelValue)
  if (found) return found
  return {
    id: props.modelValue || 'TODO',
    label: (props.modelValue || 'TODO').replace(/_/g, ' '),
    color: '#64748b'
  }
})

const filteredColumns = computed(() => {
  if (!searchQuery.value.trim()) return props.columns || []
  const q = searchQuery.value.toLowerCase()
  return (props.columns || []).filter(c =>
    c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
  )
})

const isExactMatch = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return true
  return (props.columns || []).some(c => c.label.toLowerCase() === q)
})

function handleOpenChange(open: boolean) {
  isOpen.value = open
  if (open) {
    searchQuery.value = ''
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

function handleSelect(col: KanbanColumnDef) {
  emit('update:modelValue', col.id)
  isOpen.value = false
}

function handleCreateNewStatus() {
  const query = searchQuery.value.trim()
  if (!query) return

  emit('addStatus', query, selectedColor.value)
  // Format slug id
  const newId = query.toUpperCase().replace(/\s+/g, '_') as TaskStatus
  emit('update:modelValue', newId)

  searchQuery.value = ''
  isOpen.value = false
}
</script>

<template>
  <Popover :open="isOpen" @update:open="handleOpenChange">
    <PopoverTrigger as-child>
      <button
        type="button"
        :disabled="disabled"
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border select-none group"
        :style="{
          backgroundColor: hexToRgba(currentColumn.color, 0.12),
          borderColor: hexToRgba(currentColumn.color, 0.3),
          color: currentColumn.color
        }"
        :class="props.class"
      >
        <span
          class="w-2.5 h-2.5 rounded-sm shrink-0 transition-transform group-hover:scale-110"
          :style="{ backgroundColor: currentColumn.color }"
        />
        <span class="truncate font-semibold tracking-wide">
          {{ currentColumn.label }}
        </span>
        <ChevronDown
          class="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>
    </PopoverTrigger>

    <PopoverContent
      align="start"
      class="w-64 p-2 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl z-[1050] animate-in fade-in-0 zoom-in-95"
      :side-offset="6"
    >
      <!-- Search Input -->
      <div class="relative mb-2">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Cari atau buat status..."
          class="w-full text-xs rounded-xl border border-border/40 bg-background pl-8 pr-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          @keydown.enter.prevent="!isExactMatch && handleCreateNewStatus()"
        />
      </div>

      <div class="text-[11px] font-semibold text-muted-foreground px-2 py-1 select-none">
        Pilih Status
      </div>

      <!-- Status List -->
      <div class="max-h-48 overflow-y-auto space-y-1 pr-0.5">
        <button
          v-for="col in filteredColumns"
          :key="col.id"
          type="button"
          class="flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-all cursor-pointer group"
          :style="{
            backgroundColor: col.id === modelValue ? hexToRgba(col.color, 0.14) : 'transparent',
            color: col.id === modelValue ? col.color : 'inherit'
          }"
          :class="col.id !== modelValue ? 'hover:bg-accent' : ''"
          @click="handleSelect(col)"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="w-2.5 h-2.5 rounded-sm shrink-0"
              :style="{ backgroundColor: col.color }"
            />
            <span class="truncate font-semibold">{{ col.label }}</span>
          </div>

          <Check
            v-if="col.id === modelValue"
            class="w-3.5 h-3.5 shrink-0"
            :style="{ color: col.color }"
          />
        </button>

        <div
          v-if="filteredColumns.length === 0 && isExactMatch"
          class="px-2 py-3 text-center text-xs text-muted-foreground"
        >
          Status tidak ditemukan.
        </div>
      </div>

      <!-- Create New Status Option (Sync to Kanban) -->
      <div
        v-if="searchQuery.trim() && !isExactMatch"
        class="pt-2 mt-2 border-t border-border/40 space-y-2"
      >
        <div class="flex items-center justify-between px-1">
          <span class="text-[10px] text-muted-foreground font-medium">Pilih Warna Status:</span>
          <div class="flex items-center gap-1">
            <button
              v-for="c in COLOR_OPTIONS"
              :key="c"
              type="button"
              class="w-3.5 h-3.5 rounded-full transition-transform cursor-pointer"
              :style="{ backgroundColor: c }"
              :class="selectedColor === c ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'hover:scale-105'"
              @click="selectedColor = c"
            />
          </div>
        </div>

        <button
          type="button"
          class="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer text-white"
          :style="{ backgroundColor: selectedColor }"
          @click="handleCreateNewStatus"
        >
          <Plus class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">Buat status "{{ searchQuery.trim() }}"</span>
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>

