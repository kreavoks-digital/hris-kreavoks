<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Badge, Button } from '@kreavoks/kreaui'
import { Plus, MoreHorizontal, Pencil, Palette, Trash2, Check } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '~/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover'
import type { KanbanTask, TaskStatus, KanbanMember, TaskPriority } from '../types'
import { COLUMN_COLOR_PRESETS } from '../hooks/useKanban'
import KanbanCard from './KanbanCard.vue'
import QuickCreateTaskCard from './QuickCreateTaskCard.vue'

const props = withDefaults(
  defineProps<{
    status: TaskStatus
    title: string
    color?: string
    tasks: KanbanTask[]
    projectId?: string
    members?: KanbanMember[]
    colorPresets?: { name: string; value: string }[]
  }>(),
  {
    color: '#64748b',
    colorPresets: () => COLUMN_COLOR_PRESETS
  }
)

const emit = defineEmits<{
  (e: 'taskClick', task: KanbanTask): void
  (e: 'taskMove', taskId: string, newStatus: TaskStatus): void
  (e: 'createTask', status: TaskStatus): void
  (e: 'quickCreate', taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>): void
  (e: 'rename', status: TaskStatus, newLabel: string): void
  (e: 'updateColor', status: TaskStatus, color: string): void
  (e: 'clearTasks', status: TaskStatus): void
  (e: 'toggleComplete', taskId: string): void
  (e: 'toggleFavorite', taskId: string): void
  (e: 'renameTask', taskId: string, newTitle: string): void
  (e: 'addSubtask', taskId: string, subtaskTitle: string): void
  (e: 'updateAssignees', taskId: string, assignees: KanbanMember[]): void
  (e: 'updatePriority', taskId: string, priority: TaskPriority): void
  (e: 'updateDates', taskId: string, startDate?: string, dueDate?: string): void
  (e: 'updateTags', taskId: string, tags: string[]): void
  (e: 'deleteTask', taskId: string): void
}>()

const COLOR_PALETTE = [
  '#475569', '#64748b', '#6366f1', '#3b82f6', '#0ea5e9', '#10b981',
  '#f59e0b', '#ea580c', '#ef4444', '#ec4899', '#a855f7', '#78350f'
]

const isDragOver = ref(false)
const isEditingTitle = ref(false)
const isInlineCreating = ref(false)
const isColorPopoverOpen = ref(false)
const editTitle = ref('')
const titleInputRef = ref<HTMLInputElement | null>(null)

function hexToRgba(hex: string, alpha: number) {
  let c = (hex || '#64748b').replace('#', '')
  if (c.length === 3) {
    c = c.split('').map(ch => ch + ch).join('')
  }
  const num = parseInt(c, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function onQuickTaskSave(data: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) {
  if (!props.projectId) return
  emit('quickCreate', data)
  isInlineCreating.value = false
}

function startRename() {
  editTitle.value = props.title
  isEditingTitle.value = true
  nextTick(() => {
    titleInputRef.value?.focus()
    titleInputRef.value?.select()
  })
}

function handleSaveRename() {
  if (isEditingTitle.value) {
    if (editTitle.value.trim() && editTitle.value.trim() !== props.title) {
      emit('rename', props.status, editTitle.value.trim())
    }
    isEditingTitle.value = false
  }
}

function cancelRename() {
  isEditingTitle.value = false
}

function selectColor(newColor: string) {
  emit('updateColor', props.status, newColor)
  isColorPopoverOpen.value = false
}

function handleClearTasks() {
  if (props.tasks.length === 0) return
  if (confirm(`Apakah Anda yakin ingin mengosongkan tugas di kolom "${props.title}"?`)) {
    emit('clearTasks', props.status)
  }
}

function onDragStart(e: DragEvent, taskId: string) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  if (e.dataTransfer) {
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      emit('taskMove', taskId, props.status)
    }
  }
}
</script>

<template>
  <div
    class="group/col flex flex-col rounded-3xl p-3.5 min-w-[285px] max-w-[340px] w-[300px] h-fit transition-all border shadow-none shrink-0"
    :style="{
      backgroundColor: hexToRgba(color, 0.05),
      borderColor: isDragOver ? color : hexToRgba(color, 0.18)
    }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Column Header -->
    <div class="flex items-center justify-between px-1 py-0.5 mb-2.5 min-h-[36px]">
      <!-- Title & Status Color Area -->
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <!-- 1. EDIT MODE: Bordered box with Bullet Color Picker & Save Check (Ref Image 1 & 2) -->
        <div
          v-if="isEditingTitle"
          class="flex items-center gap-2 rounded-xl border-2 border-primary/60 bg-background px-2.5 py-1 w-full max-w-[210px] shadow-xs"
        >
          <!-- Bullet square button (opens color picker) -->
          <Popover v-model:open="isColorPopoverOpen">
            <PopoverTrigger as-child>
              <button
                type="button"
                class="w-3.5 h-3.5 rounded-md shrink-0 cursor-pointer hover:scale-110 transition-transform shadow-xs"
                :style="{ backgroundColor: color }"
                title="Pilih warna status"
              />
            </PopoverTrigger>

            <PopoverContent align="start" class="w-60 p-3 rounded-2xl border border-border bg-popover z-50 shadow-none">
              <div class="text-[11px] font-semibold text-muted-foreground mb-2 px-0.5">
                Color
              </div>
              <div class="grid grid-cols-6 gap-2">
                <button
                  v-for="c in COLOR_PALETTE"
                  :key="c"
                  type="button"
                  class="w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer border-2"
                  :style="{
                    backgroundColor: c,
                    borderColor: color === c ? 'hsl(var(--foreground))' : 'transparent'
                  }"
                  @click="selectColor(c)"
                >
                  <Check v-if="color === c" class="w-3 h-3 text-white" />
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <!-- Input for renaming -->
          <input
            ref="titleInputRef"
            v-model="editTitle"
            type="text"
            class="flex-1 text-xs font-semibold text-foreground bg-transparent focus:outline-none min-w-0"
            @keydown.enter="handleSaveRename"
            @keydown.esc="cancelRename"
          />

          <!-- Check button to save rename -->
          <button
            type="button"
            class="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
            title="Simpan (Enter)"
            @click="handleSaveRename"
          >
            <Check class="w-3.5 h-3.5 text-kv-primary" />
          </button>
        </div>

        <!-- 2. NORMAL MODE: Bullet Color Picker + Status Name + Count -->
        <div v-else class="flex items-center gap-2 min-w-0">
          <!-- Bullet square color (click to open color picker directly anytime) -->
          <Popover>
            <PopoverTrigger as-child>
              <button
                type="button"
                class="w-3.5 h-3.5 rounded-md shrink-0 cursor-pointer hover:scale-110 transition-transform shadow-xs"
                :style="{ backgroundColor: color }"
                title="Klik untuk ubah warna status"
              />
            </PopoverTrigger>

            <PopoverContent align="start" class="w-60 p-3 rounded-2xl border border-border bg-popover z-50 shadow-none">
              <div class="text-[11px] font-semibold text-muted-foreground mb-2 px-0.5">
                Color
              </div>
              <div class="grid grid-cols-6 gap-2">
                <button
                  v-for="c in COLOR_PALETTE"
                  :key="c"
                  type="button"
                  class="w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer border-2"
                  :style="{
                    backgroundColor: c,
                    borderColor: color === c ? 'hsl(var(--foreground))' : 'transparent'
                  }"
                  @click="selectColor(c)"
                >
                  <Check v-if="color === c" class="w-3 h-3 text-white" />
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <!-- Status Title (double-click to rename) -->
          <h3
            class="text-xs font-bold text-foreground select-none truncate cursor-pointer hover:text-primary transition-colors"
            :title="`Klik ganda untuk rename: ${title}`"
            @dblclick="startRename"
          >
            {{ title }}
          </h3>

          <!-- Task count -->
          <span class="text-xs font-semibold text-muted-foreground/75 shrink-0 ml-0.5">
            {{ tasks.length }}
          </span>
        </div>
      </div>

      <!-- Action buttons: More Actions & Add Task (+) — ONLY VISIBLE ON HOVER -->
      <div
        class="opacity-0 group-hover/col:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex items-center gap-1 shrink-0"
      >
        <!-- More Actions Dropdown Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors cursor-pointer"
              title="Opsi kolom status"
            >
              <MoreHorizontal class="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            class="w-48 rounded-2xl border border-border bg-popover p-1.5 shadow-none z-50 animate-in fade-in-0 zoom-in-95"
          >
            <!-- Rename Status -->
            <DropdownMenuItem
              class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
              @click="startRename"
            >
              <Pencil class="w-3.5 h-3.5 text-muted-foreground" />
              <span>Ubah Nama Status</span>
            </DropdownMenuItem>

            <!-- Color Palette Submenu -->
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                class="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
              >
                <div class="flex items-center gap-2">
                  <Palette class="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Warna Status</span>
                </div>
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent
                class="w-56 p-2.5 rounded-2xl border border-border bg-popover z-50 shadow-none animate-in fade-in-0 zoom-in-95"
              >
                <div class="text-[11px] font-semibold text-muted-foreground mb-2 px-0.5">
                  Pilih Warna Aksen
                </div>
                <div class="grid grid-cols-6 gap-2">
                  <button
                    v-for="c in COLOR_PALETTE"
                    :key="c"
                    type="button"
                    class="w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer border-2"
                    :style="{
                      backgroundColor: c,
                      borderColor: color === c ? 'hsl(var(--foreground))' : 'transparent'
                    }"
                    @click="selectColor(c)"
                  >
                    <Check v-if="color === c" class="w-3 h-3 text-white" />
                  </button>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator class="my-1 border-border/50" />

            <!-- Clear Tasks in Column -->
            <DropdownMenuItem
              class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
              @click="handleClearTasks"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Bersihkan Kolom</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- + Button (Add Task Quick Inline) -->
        <button
          type="button"
          class="p-1.5 rounded-xl transition-colors cursor-pointer"
          :class="projectId ? 'text-muted-foreground hover:text-foreground hover:bg-background/80' : 'text-muted-foreground/30 cursor-not-allowed'"
          :disabled="!projectId"
          :title="projectId ? 'Tambah tugas di kolom ini' : 'Pilih proyek terlebih dahulu'"
          @click="projectId ? (isInlineCreating = !isInlineCreating) : null"
        >
          <Plus class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Cards Container (Height auto fits tasks) -->
    <div class="flex flex-col gap-3">
      <!-- Quick Inline Task Creator Card (Reference from user) -->
      <QuickCreateTaskCard
        v-if="isInlineCreating && projectId"
        :status="status"
        :project-id="projectId"
        :members="members"
        @save="onQuickTaskSave"
        @cancel="isInlineCreating = false"
      />

      <template v-if="tasks.length > 0">
        <KanbanCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :members="members"
          @click="emit('taskClick', task)"
          @dragstart="onDragStart"
          @toggle-complete="id => emit('toggleComplete', id)"
          @toggle-favorite="id => emit('toggleFavorite', id)"
          @rename="(id, title) => emit('renameTask', id, title)"
          @add-subtask="(id, title) => emit('addSubtask', id, title)"
          @update-assignees="(id, assignees) => emit('updateAssignees', id, assignees)"
          @update-priority="(id, prio) => emit('updatePriority', id, prio)"
          @update-dates="(id, start, due) => emit('updateDates', id, start, due)"
          @update-tags="(id, tags) => emit('updateTags', id, tags)"
          @delete="id => emit('deleteTask', id)"
        />
      </template>

      <!-- Quick Add Task bottom trigger — ONLY VISIBLE IF PROJECT EXISTS -->
      <button
        v-if="!isInlineCreating && projectId"
        type="button"
        class="opacity-0 group-hover/col:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer w-full justify-start select-none mt-1 hover:brightness-95 border border-transparent"
        :style="{
          backgroundColor: hexToRgba(color, 0.14),
          color: color
        }"
        @click="isInlineCreating = true"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Task</span>
      </button>
    </div>
  </div>
</template>
