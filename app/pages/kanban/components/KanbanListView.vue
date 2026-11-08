<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Badge } from '@kreavoks/kreaui'
import {
  Clock,
  Flag,
  CheckSquare,
  Plus,
  Check,
  Tag as TagIcon,
  PlusCircle,
  Pencil,
  X,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-vue-next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover'
import type { KanbanTask, KanbanColumnDef, KanbanMember, TaskStatus, TaskPriority } from '../types'
import { PRIORITY_CONFIGS, PRIORITY_OPTIONS } from '../hooks/useKanban'

const props = defineProps<{
  columns: KanbanColumnDef[]
  tasks: KanbanTask[]
  members: KanbanMember[]
}>()

const emit = defineEmits<{
  (e: 'taskClick', task: KanbanTask): void
  (e: 'createTask', status: TaskStatus): void
  (e: 'toggleComplete', taskId: string): void
  (e: 'toggleChecklist', taskId: string, checklistId: string): void
  (e: 'renameTask', taskId: string, newTitle: string): void
  (e: 'addSubtask', taskId: string, subtaskTitle: string): void
}>()

// Inline Rename State
const editingTaskId = ref<string | null>(null)
const editedTitle = ref('')

// ClickUp-Style Subtask Creator State (Image 1)
const activeSubtaskTaskId = ref<string | null>(null)
const newSubtaskTitle = ref('')
const subtaskAssignee = ref<KanbanMember | null>(null)
const subtaskDate = ref<string>('')
const subtaskPriority = ref<TaskPriority | null>(null)
const subtaskTag = ref<string>('')
const showSubtaskDatePicker = ref(false)

// Expanded tasks for subtask view
const expandedTaskIds = ref<Set<string>>(new Set())

function toggleExpandTask(taskId: string, e?: Event) {
  if (e) e.stopPropagation()
  if (expandedTaskIds.value.has(taskId)) {
    expandedTaskIds.value.delete(taskId)
  } else {
    expandedTaskIds.value.add(taskId)
  }
}

function getPriorityConfig(priority: TaskPriority | string) {
  return PRIORITY_CONFIGS[priority as TaskPriority] || PRIORITY_CONFIGS.MEDIUM
}

function getColumnTasks(status: TaskStatus) {
  return props.tasks.filter(t => t.status === status)
}

function formatCompactDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function getDateDisplay(startDate?: string, dueDate?: string): string {
  const start = startDate ? formatCompactDate(startDate) : null
  const end = dueDate ? formatCompactDate(dueDate) : null
  if (start && end) {
    return start === end ? end : `${start} - ${end}`
  }
  return end || start || ''
}

// Rename Handlers
function startRename(task: KanbanTask, e?: Event) {
  if (e) e.stopPropagation()
  editingTaskId.value = task.id
  editedTitle.value = task.title
}

function saveRename(task: KanbanTask) {
  if (!editingTaskId.value) return
  const trimmed = editedTitle.value.trim()
  if (trimmed && trimmed !== task.title) {
    emit('renameTask', task.id, trimmed)
  }
  editingTaskId.value = null
}

function cancelRename() {
  editingTaskId.value = null
}

// Subtask Handlers (Image 1)
function openSubtaskCreator(taskId: string, e?: Event) {
  if (e) e.stopPropagation()
  if (activeSubtaskTaskId.value === taskId) {
    activeSubtaskTaskId.value = null
    return
  }
  activeSubtaskTaskId.value = taskId
  newSubtaskTitle.value = ''
  subtaskAssignee.value = null
  subtaskDate.value = ''
  subtaskPriority.value = null
  subtaskTag.value = ''
  showSubtaskDatePicker.value = false
  // expand task so subtasks are visible
  expandedTaskIds.value.add(taskId)
}

function saveSubtask(taskId: string) {
  const trimmed = newSubtaskTitle.value.trim()
  if (!trimmed) {
    activeSubtaskTaskId.value = null
    return
  }
  emit('addSubtask', taskId, trimmed)
  newSubtaskTitle.value = ''
  activeSubtaskTaskId.value = null
}

function cancelSubtask() {
  activeSubtaskTaskId.value = null
  newSubtaskTitle.value = ''
}
</script>

<template>
  <div class="space-y-4 w-full">
    <div
      v-for="col in columns"
      :key="col.id"
      class="rounded-3xl border border-border/40 bg-card overflow-hidden shadow-none"
    >
      <!-- Group Header per Status (Ala ClickUp List View) -->
      <div
        class="flex items-center justify-between px-4 py-2.5 bg-muted/20 border-b border-border/30 select-none"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
            :style="{ backgroundColor: col.color }"
          />
          <span class="text-xs font-bold text-foreground tracking-wide uppercase">
            {{ col.label }}
          </span>
          <span
            class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
          >
            {{ getColumnTasks(col.id).length }}
          </span>
        </div>

        <button
          type="button"
          class="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer hover:bg-muted px-2 py-1 rounded-lg transition-colors"
          @click="emit('createTask', col.id)"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Tambah Tugas</span>
        </button>
      </div>

      <!-- Task Rows in Group -->
      <div v-if="getColumnTasks(col.id).length > 0" class="divide-y divide-border/20">
        <template v-for="task in getColumnTasks(col.id)" :key="task.id">
          <!-- Main Task Row -->
          <div
            class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/10 transition-colors cursor-pointer group"
            @click="emit('taskClick', task)"
          >
            <!-- Left: Checkbox Mark Completed + Expand + Title / Rename + Hover Actions + Tags + Description -->
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <!-- Expand subtask toggle if has checklist -->
              <button
                v-if="task.checklist && task.checklist.length > 0"
                type="button"
                class="p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Lihat subtasks"
                @click="toggleExpandTask(task.id, $event)"
              >
                <ChevronDown
                  v-if="expandedTaskIds.has(task.id)"
                  class="w-3.5 h-3.5"
                />
                <ChevronRight
                  v-else
                  class="w-3.5 h-3.5"
                />
              </button>

              <!-- Checkbox Mark as Completed (Konsisten) -->
              <button
                type="button"
                class="w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                :class="[
                  task.status === 'DONE'
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                    : 'border-border/70 hover:border-emerald-500 hover:bg-emerald-500/10 text-transparent hover:text-emerald-500'
                ]"
                :title="task.status === 'DONE' ? 'Tandai belum selesai' : 'Tandai selesai'"
                @click.stop="emit('toggleComplete', task.id)"
              >
                <Check class="w-3 h-3 stroke-[3]" />
              </button>

              <div class="flex flex-col min-w-0 flex-1">
                <!-- Title & Hover Actions -->
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Inline Rename Input -->
                  <div
                    v-if="editingTaskId === task.id"
                    class="flex items-center gap-1.5"
                    @click.stop
                  >
                    <input
                      v-model="editedTitle"
                      type="text"
                      class="text-xs font-semibold text-foreground bg-background rounded-lg border border-primary px-2 py-1 focus:outline-none shadow-xs"
                      @keydown.enter="saveRename(task)"
                      @keydown.esc="cancelRename"
                      @blur="saveRename(task)"
                    />
                    <button
                      type="button"
                      class="p-1 rounded text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title="Simpan"
                      @click="saveRename(task)"
                    >
                      <Check class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      class="p-1 rounded text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Batal"
                      @click="cancelRename"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <!-- Standard Title -->
                  <span
                    v-else
                    class="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate"
                    :class="{ 'line-through text-muted-foreground/60': task.status === 'DONE' }"
                  >
                    {{ task.title }}
                  </span>

                  <!-- Hover Action Buttons: Add Subtask (⊕) & Rename (✎) (Image 1) -->
                  <div
                    class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    @click.stop
                  >
                    <!-- Add subtask with tooltip -->
                    <button
                      type="button"
                      class="p-1 rounded-md text-muted-foreground hover:text-indigo-600 hover:bg-muted transition-colors cursor-pointer"
                      title="Add subtask"
                      @click="openSubtaskCreator(task.id, $event)"
                    >
                      <PlusCircle class="w-3.5 h-3.5" />
                    </button>

                    <!-- Rename -->
                    <button
                      type="button"
                      class="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Rename"
                      @click="startRename(task, $event)"
                    >
                      <Pencil class="w-3 h-3" />
                    </button>
                  </div>

                  <!-- Tags Badges (Konsisten) -->
                  <div v-if="task.tags && task.tags.length > 0" class="flex items-center gap-1">
                    <span
                      v-for="tag in task.tags"
                      :key="tag"
                      class="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-muted/60 text-muted-foreground border border-border/30"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                </div>

                <span v-if="task.description" class="text-[11px] text-muted-foreground truncate max-w-lg mt-0.5">
                  {{ task.description }}
                </span>
              </div>
            </div>

            <!-- Right Meta Items: Checklist, Priority, Date, Assignees (Konsisten) -->
            <div class="flex items-center gap-3.5 shrink-0 text-xs">
              <!-- Checklist Count -->
              <div
                v-if="task.checklist && task.checklist.length > 0"
                class="flex items-center gap-1 text-[11px] text-muted-foreground"
                :title="`${task.checklist.filter(c => c.isCompleted).length} dari ${task.checklist.length} checklist selesai`"
              >
                <CheckSquare class="w-3.5 h-3.5" />
                <span>{{ task.checklist.filter(c => c.isCompleted).length }}/{{ task.checklist.length }}</span>
              </div>

              <!-- Priority Flag Badge -->
              <Badge
                type="label"
                :variant="getPriorityConfig(task.priority).badgeVariant"
                size="sm"
              >
                <span class="flex items-center gap-1">
                  <Flag class="w-3 h-3" :class="getPriorityConfig(task.priority).fillClass" />
                  <span>{{ getPriorityConfig(task.priority).label }}</span>
                </span>
              </Badge>

              <!-- Date Range Ringkas dengan Icon Clock (Konsisten sesuai Gambar 2) -->
              <div
                v-if="task.dueDate || task.startDate"
                class="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[95px]"
              >
                <Clock class="w-3.5 h-3.5 text-muted-foreground/70" />
                <span>{{ getDateDisplay(task.startDate, task.dueDate) }}</span>
              </div>

              <!-- Assignees Avatar Stack: Max 4 + '+N' Indicator (Konsisten) -->
              <div class="flex items-center -space-x-1.5 min-w-[60px] justify-end">
                <template v-if="task.assignees && task.assignees.length > 0">
                  <template v-for="a in task.assignees.slice(0, 4)" :key="a.id">
                    <img
                      :src="a.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(a.name)}`"
                      :alt="a.name"
                      :title="a.name"
                      class="w-6 h-6 rounded-full border-2 border-background object-cover bg-muted"
                    />
                  </template>
                  <div
                    v-if="task.assignees.length > 4"
                    class="w-6 h-6 rounded-full border-2 border-background bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-semibold"
                    :title="`${task.assignees.length - 4} anggota lainnya`"
                  >
                    +{{ task.assignees.length - 4 }}
                  </div>
                </template>
                <div
                  v-else
                  class="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] text-muted-foreground/60"
                  title="Belum ditugaskan"
                >
                  -
                </div>
              </div>
            </div>
          </div>

          <!-- ClickUp-Style Subtask Creator Box (Gambar 1) jika tombol ⊕ diklik -->
          <div
            v-if="activeSubtaskTaskId === task.id"
            class="mx-8 my-2 rounded-2xl border-2 border-indigo-500/80 bg-background p-3 shadow-xs space-y-2.5"
            @click.stop
          >
            <!-- Subtask Input Row + Save ↵ Button -->
            <div class="flex items-center gap-2">
              <input
                v-model="newSubtaskTitle"
                type="text"
                placeholder="Subtask Name..."
                class="flex-1 text-xs font-medium text-foreground bg-transparent placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
                autofocus
                @keydown.enter="saveSubtask(task.id)"
                @keydown.esc="cancelSubtask"
              />
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
                @click="saveSubtask(task.id)"
              >
                <span>Save</span>
                <span class="text-[10px] opacity-80">↵</span>
              </button>
              <button
                type="button"
                class="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Batal"
                @click="cancelSubtask"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Quick Action Triggers (Assignee, Dates, Priority, Tag Ala ClickUp) -->
            <div class="flex items-center gap-4 pt-0.5 text-xs text-muted-foreground/80 flex-wrap">
              <!-- 1. Add Assignee -->
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors text-muted-foreground"
                  >
                    <User class="w-3.5 h-3.5" />
                    <span class="text-[11px]">
                      {{ subtaskAssignee ? subtaskAssignee.name : 'Add assignee' }}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" class="w-48 p-1.5 rounded-xl border border-border bg-popover z-50">
                  <div class="text-[10px] font-semibold text-muted-foreground px-2 py-1">Pilih Assignee</div>
                  <div
                    v-for="m in members"
                    :key="m.id"
                    class="flex items-center gap-2 px-2 py-1 text-xs rounded-lg hover:bg-accent cursor-pointer"
                    @click="subtaskAssignee = m"
                  >
                    <img :src="m.avatar" class="w-4 h-4 rounded-full" />
                    <span class="truncate">{{ m.name }}</span>
                  </div>
                </PopoverContent>
              </Popover>

              <!-- 2. Add Dates -->
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  class="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors text-muted-foreground"
                  @click="showSubtaskDatePicker = !showSubtaskDatePicker"
                >
                  <Clock class="w-3.5 h-3.5" />
                  <span class="text-[11px]">{{ subtaskDate || 'Add dates' }}</span>
                </button>
                <input
                  v-if="showSubtaskDatePicker"
                  v-model="subtaskDate"
                  type="date"
                  class="text-[10px] bg-muted/60 border border-border/50 rounded px-1 py-0.5 focus:outline-none"
                />
              </div>

              <!-- 3. Add Priority -->
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors text-muted-foreground"
                  >
                    <Flag class="w-3.5 h-3.5" />
                    <span class="text-[11px]">
                      {{ subtaskPriority ? PRIORITY_CONFIGS[subtaskPriority].label : 'Add priority' }}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" class="w-36 p-1 rounded-xl border border-border bg-popover z-50">
                  <div
                    v-for="opt in PRIORITY_OPTIONS"
                    :key="opt.value"
                    class="flex items-center gap-2 px-2 py-1 text-xs rounded-lg hover:bg-accent cursor-pointer"
                    @click="subtaskPriority = opt.value"
                  >
                    <Flag class="w-3 h-3" :class="opt.fillClass" />
                    <span>{{ opt.label }}</span>
                  </div>
                </PopoverContent>
              </Popover>

              <!-- 4. Add Tag -->
              <button
                type="button"
                class="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors text-muted-foreground"
              >
                <TagIcon class="w-3.5 h-3.5" />
                <span class="text-[11px]">Add tag</span>
              </button>
            </div>
          </div>

          <!-- Expanded Subtask Rows (Jika dibuka) -->
          <template v-if="expandedTaskIds.has(task.id) && task.checklist && task.checklist.length > 0">
            <div
              v-for="item in task.checklist"
              :key="item.id"
              class="flex items-center justify-between gap-3 pl-12 pr-4 py-2 bg-muted/5 hover:bg-muted/15 transition-colors text-xs border-t border-border/10"
              @click.stop
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  class="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  :class="[
                    item.isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
                      : 'border-border/70 hover:border-emerald-500 text-transparent hover:text-emerald-500'
                  ]"
                  @click="emit('toggleChecklist', task.id, item.id)"
                >
                  <Check class="w-2.5 h-2.5 stroke-[3]" />
                </button>
                <span
                  class="text-[11px] text-foreground truncate"
                  :class="{ 'line-through text-muted-foreground/60': item.isCompleted }"
                >
                  {{ item.title }}
                </span>
              </div>

              <span class="text-[10px] text-muted-foreground/60">Subtask</span>
            </div>
          </template>
        </template>
      </div>

      <!-- Empty State for Column -->
      <div v-else class="px-4 py-3 text-xs text-muted-foreground/60 italic">
        Belum ada tugas dengan status {{ col.label }}.
      </div>
    </div>
  </div>
</template>
