<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import {
  Check,
  CheckSquare,
  Clock,
  Flag,
  Star,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Trash2,
  X,
  User,
  Tag,
  Plus
} from 'lucide-vue-next'
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
import type { KanbanTask, TaskPriority, KanbanMember } from '../types'
import { PRIORITY_CONFIGS, PRIORITY_OPTIONS } from '../hooks/useKanban'

const props = withDefaults(
  defineProps<{
    task: KanbanTask
    members?: KanbanMember[]
  }>(),
  {
    members: () => []
  }
)

const emit = defineEmits<{
  (e: 'click', task: KanbanTask): void
  (e: 'dragstart', event: DragEvent, taskId: string): void
  (e: 'toggleComplete', taskId: string): void
  (e: 'toggleFavorite', taskId: string): void
  (e: 'rename', taskId: string, newTitle: string): void
  (e: 'addSubtask', taskId: string, subtaskTitle: string): void
  (e: 'updateAssignees', taskId: string, assignees: KanbanMember[]): void
  (e: 'updatePriority', taskId: string, priority: TaskPriority): void
  (e: 'updateDates', taskId: string, startDate?: string, dueDate?: string): void
  (e: 'updateTags', taskId: string, tags: string[]): void
  (e: 'delete', taskId: string): void
}>()

// State
const isEditingTitle = ref(false)
const editedTitle = ref('')
const titleInputRef = ref<HTMLInputElement | null>(null)

// ClickUp-Style Subtask Creator State
const isAddingSubtask = ref(false)
const newSubtaskTitle = ref('')
const subtaskInputRef = ref<HTMLInputElement | null>(null)

// Subtask Quick Actions Draft State
const subtaskAssignee = ref<KanbanMember | null>(null)
const subtaskDate = ref<string>('')
const subtaskPriority = ref<TaskPriority | null>(null)
const subtaskTag = ref<string>('')
const showSubtaskDatePicker = ref(false)
const showSubtaskTagInput = ref(false)

// Popover States
const isMemberPickerOpen = ref(false)
const memberSearch = ref('')
const isPriorityPopoverOpen = ref(false)
const isDatePopoverOpen = ref(false)
const isTagPopoverOpen = ref(false)
const isMenuOpen = ref(false)

// Inline Date Editor state
const editStartDate = ref(props.task.startDate || '')
const editDueDate = ref(props.task.dueDate || '')

// Inline Tag Editor state
const newTagInput = ref('')

// Action group visibility: visible on hover OR when subtask/edit/popover is active
const isActionGroupAlwaysVisible = computed(() => {
  return isAddingSubtask.value || isEditingTitle.value || isMenuOpen.value
})

// Computed
const isCompleted = computed(() => {
  return props.task.status === 'DONE'
})

const priorityConfig = computed(() => {
  return PRIORITY_CONFIGS[props.task.priority] || PRIORITY_CONFIGS.MEDIUM
})

const completedChecklistCount = computed(() => {
  return (props.task.checklist || []).filter(c => c.isCompleted).length
})

const totalChecklistCount = computed(() => {
  return (props.task.checklist || []).length
})

// Formatter Tanggal Ringkas (ala ClickUp: 'Nov 16 - Nov 30' atau 'Nov 16')
function formatCompactDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

const formattedDateDisplay = computed(() => {
  const start = props.task.startDate ? formatCompactDate(props.task.startDate) : null
  const end = props.task.dueDate ? formatCompactDate(props.task.dueDate) : null

  if (start && end) {
    return start === end ? end : `${start} - ${end}`
  }
  return end || start || 'Set dates'
})

const filteredMembers = computed(() => {
  if (!memberSearch.value.trim()) return props.members
  const query = memberSearch.value.toLowerCase()
  return props.members.filter(m =>
    m.name.toLowerCase().includes(query) || (m.position && m.position.toLowerCase().includes(query))
  )
})

function isMemberAssigned(memberId: string): boolean {
  return (props.task.assignees || []).some(a => String(a.id) === String(memberId))
}

// Handlers
function handleDragStart(e: DragEvent) {
  emit('dragstart', e, props.task.id)
}

function handleToggleComplete(e: Event) {
  e.stopPropagation()
  emit('toggleComplete', props.task.id)
}

function handleToggleFavorite(e: Event) {
  e.stopPropagation()
  emit('toggleFavorite', props.task.id)
}

function startRename(e?: Event) {
  if (e) e.stopPropagation()
  editedTitle.value = props.task.title
  isEditingTitle.value = true
  nextTick(() => {
    titleInputRef.value?.focus()
    titleInputRef.value?.select()
  })
}

function saveRename(e?: Event) {
  if (e) e.stopPropagation()
  if (editedTitle.value.trim() && editedTitle.value.trim() !== props.task.title) {
    emit('rename', props.task.id, editedTitle.value.trim())
  }
  isEditingTitle.value = false
}

function cancelRename(e?: Event) {
  if (e) e.stopPropagation()
  isEditingTitle.value = false
}

function toggleAddSubtask(e?: Event) {
  if (e) e.stopPropagation()
  isAddingSubtask.value = !isAddingSubtask.value
  if (isAddingSubtask.value) {
    newSubtaskTitle.value = ''
    subtaskAssignee.value = null
    subtaskDate.value = ''
    subtaskPriority.value = null
    subtaskTag.value = ''
    showSubtaskDatePicker.value = false
    showSubtaskTagInput.value = false
    nextTick(() => {
      subtaskInputRef.value?.focus()
    })
  }
}

function saveSubtask(e?: Event) {
  if (e) e.stopPropagation()
  if (newSubtaskTitle.value.trim()) {
    let fullTitle = newSubtaskTitle.value.trim()
    if (subtaskTag.value.trim()) {
      fullTitle += ` #${subtaskTag.value.trim()}`
    }
    emit('addSubtask', props.task.id, fullTitle)
    newSubtaskTitle.value = ''
    subtaskAssignee.value = null
    subtaskDate.value = ''
    subtaskPriority.value = null
    subtaskTag.value = ''
  }
  isAddingSubtask.value = false
}

function cancelSubtask(e?: Event) {
  if (e) e.stopPropagation()
  isAddingSubtask.value = false
  newSubtaskTitle.value = ''
}

// Auto-save Assignees
function toggleAssignee(member: KanbanMember, e: Event) {
  e.stopPropagation()
  const current = [...(props.task.assignees || [])]
  const existsIndex = current.findIndex(a => String(a.id) === String(member.id))
  if (existsIndex >= 0) {
    current.splice(existsIndex, 1)
  } else {
    current.push(member)
  }
  emit('updateAssignees', props.task.id, current)
}

// Auto-save Priority
function handleSelectPriority(priority: TaskPriority, e?: Event) {
  if (e) e.stopPropagation()
  emit('updatePriority', props.task.id, priority)
  isPriorityPopoverOpen.value = false
}

// Auto-save Dates
function openDatePopover(e?: Event) {
  if (e) e.stopPropagation()
  editStartDate.value = props.task.startDate || ''
  editDueDate.value = props.task.dueDate || ''
  isDatePopoverOpen.value = true
}

function handleSaveDates(e?: Event) {
  if (e) e.stopPropagation()
  emit('updateDates', props.task.id, editStartDate.value || undefined, editDueDate.value || undefined)
  isDatePopoverOpen.value = false
}

// Auto-save Tags
function handleAddTag(e?: Event) {
  if (e) e.stopPropagation()
  const tag = newTagInput.value.trim().replace(/^#/, '')
  if (tag && !props.task.tags.includes(tag)) {
    const updated = [...props.task.tags, tag]
    emit('updateTags', props.task.id, updated)
    newTagInput.value = ''
  }
}

function handleRemoveTag(tagToRemove: string, e?: Event) {
  if (e) e.stopPropagation()
  const updated = props.task.tags.filter(t => t !== tagToRemove)
  emit('updateTags', props.task.id, updated)
}

function handleDeleteTask(e?: Event) {
  if (e) e.stopPropagation()
  if (confirm(`Apakah Anda yakin ingin menghapus tugas "${props.task.title}"?`)) {
    emit('delete', props.task.id)
  }
}
</script>

<template>
  <div
    draggable="true"
    class="group flex flex-col gap-2 rounded-2xl border border-border/40 bg-card p-3.5 cursor-pointer shadow-none transition-all hover:border-primary/50 hover:bg-card/90 select-none relative"
    @dragstart="handleDragStart"
    @click="emit('click', task)"
  >
    <!-- 1. TOP ROW: Task Title (Kiri) + Action Group Buttons (Kanan: Hanya Muncul Saat Hover Area Kanan/Card) -->
    <div class="flex items-center justify-between gap-2 min-h-[28px]">
      <!-- Title / Inline Rename Input (Di Kiri) -->
      <div class="flex-1 min-w-0">
        <div v-if="isEditingTitle" class="flex items-center gap-1.5" @click.stop>
          <input
            ref="titleInputRef"
            v-model="editedTitle"
            type="text"
            class="w-full text-xs font-semibold text-foreground bg-background rounded-lg border border-primary px-2 py-1 focus:outline-none shadow-xs"
            @keydown.enter="saveRename"
            @keydown.esc="cancelRename"
            @blur="saveRename"
          />
          <button
            type="button"
            class="p-1 rounded text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            title="Simpan (Enter)"
            @click="saveRename"
          >
            <Check class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            class="p-1 rounded text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Batal (Esc)"
            @click="cancelRename"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <h4
          v-else
          class="text-xs font-semibold text-foreground leading-snug line-clamp-2 transition-colors cursor-pointer hover:text-primary"
          :class="{ 'line-through text-muted-foreground/60': isCompleted }"
          :title="task.title"
          @click="emit('click', task)"
          @dblclick.stop="startRename"
        >
          {{ task.title }}
        </h4>
      </div>

      <!-- Action Group Bar: HANYA MUNCUL KETIKA DI-HOVER (Atau saat menu/subtask aktif) -->
      <div
        class="flex items-center gap-0.5 rounded-xl border border-border/40 bg-muted/40 p-0.5 shrink-0 transition-opacity duration-200"
        :class="[
          isActionGroupAlwaysVisible
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
        ]"
        @click.stop
      >
        <!-- A. Checkmark: Mark as Completed -->
        <button
          type="button"
          class="p-1 rounded-lg transition-colors cursor-pointer"
          :class="[
            isCompleted
              ? 'text-emerald-500 bg-emerald-500/15'
              : 'text-muted-foreground/70 hover:text-emerald-500 hover:bg-background'
          ]"
          :title="isCompleted ? 'Tandai belum selesai' : 'Mark as complete'"
          @click="handleToggleComplete"
        >
          <Check class="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <!-- B. Add Subtask Button (⊕) with Tooltip -->
        <button
          type="button"
          class="p-1 rounded-lg transition-colors cursor-pointer"
          :class="[
            isAddingSubtask
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40'
              : 'text-muted-foreground/70 hover:text-indigo-600 hover:bg-background'
          ]"
          title="Add subtask"
          @click="toggleAddSubtask"
        >
          <PlusCircle class="w-3.5 h-3.5" />
        </button>

        <!-- C. Rename Button (✎) -->
        <button
          type="button"
          class="p-1 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-background transition-colors cursor-pointer"
          title="Rename"
          @click="startRename"
        >
          <Pencil class="w-3.5 h-3.5" />
        </button>

        <!-- D. More Options (···) -->
        <DropdownMenu v-model:open="isMenuOpen">
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="p-1 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal class="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            class="w-44 rounded-2xl border border-border bg-popover p-1.5 shadow-none z-50 animate-in fade-in-0 zoom-in-95"
          >
            <!-- Toggle Favorite -->
            <DropdownMenuItem
              class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
              @click="handleToggleFavorite"
            >
              <Star
                class="w-3.5 h-3.5"
                :class="task.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'"
              />
              <span>{{ task.isFavorite ? 'Hapus Favorit' : 'Jadikan Favorit' }}</span>
            </DropdownMenuItem>

            <!-- Priority Submenu -->
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                class="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
              >
                <div class="flex items-center gap-2">
                  <Flag class="w-3.5 h-3.5" :class="priorityConfig.fillClass" />
                  <span>Prioritas</span>
                </div>
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent
                class="w-40 p-1.5 rounded-2xl border border-border bg-popover z-50 shadow-none animate-in fade-in-0 zoom-in-95"
              >
                <DropdownMenuItem
                  v-for="opt in PRIORITY_OPTIONS"
                  :key="opt.value"
                  class="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
                  @click="handleSelectPriority(opt.value)"
                >
                  <div class="flex items-center gap-2">
                    <Flag class="w-3.5 h-3.5" :class="opt.fillClass" />
                    <span>{{ opt.label }}</span>
                  </div>
                  <Check v-if="task.priority === opt.value" class="w-3 h-3 text-primary" />
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator class="my-1 border-border/50" />

            <!-- Delete Task -->
            <DropdownMenuItem
              class="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
              @click="handleDeleteTask"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Hapus Tugas</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- 2. SECOND ROW: Meta Badges Ringkas (Assignee, Date, Priority Flag, Tags, Checklist Count) -->
    <div class="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground pt-0.5">
      <!-- A. Assignee Avatar Stack / Member Picker (Auto-save) -->
      <Popover v-model:open="isMemberPickerOpen">
        <PopoverTrigger as-child>
          <div class="flex items-center cursor-pointer group/assignees" @click.stop>
            <div v-if="task.assignees && task.assignees.length > 0" class="flex items-center -space-x-1.5">
              <template v-for="member in task.assignees.slice(0, 3)" :key="member.id">
                <img
                  :src="member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`"
                  :alt="member.name"
                  :title="member.name"
                  class="w-5 h-5 rounded-full border border-card object-cover bg-muted"
                />
              </template>
              <div
                v-if="task.assignees.length > 3"
                class="w-5 h-5 rounded-full border border-card bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-medium"
              >
                +{{ task.assignees.length - 3 }}
              </div>
            </div>
            <div
              v-else
              class="w-5 h-5 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              title="Tugaskan anggota"
            >
              <User class="w-3 h-3" />
            </div>
          </div>
        </PopoverTrigger>

        <!-- Popover Member Picker -->
        <PopoverContent
          align="start"
          class="w-56 p-2 rounded-2xl border border-border bg-popover z-50 shadow-none animate-in fade-in-0 zoom-in-95"
          @click.stop
        >
          <div class="text-[11px] font-bold text-foreground px-1 mb-1.5">
            Tugaskan Anggota
          </div>

          <input
            v-model="memberSearch"
            type="text"
            placeholder="Cari anggota..."
            class="w-full text-xs bg-muted/60 border border-border/50 rounded-xl px-2 py-1 mb-2 focus:outline-none focus:border-primary"
          />

          <div class="max-h-48 overflow-y-auto space-y-1">
            <div
              v-for="member in filteredMembers"
              :key="member.id"
              class="flex items-center justify-between p-1.5 rounded-xl hover:bg-accent cursor-pointer transition-colors"
              @click="toggleAssignee(member, $event)"
            >
              <div class="flex items-center gap-2 min-w-0">
                <img
                  :src="member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`"
                  :alt="member.name"
                  class="w-5 h-5 rounded-full object-cover shrink-0"
                />
                <div class="truncate text-left">
                  <p class="text-xs font-semibold text-foreground truncate">
                    {{ member.name }}
                  </p>
                  <p
                    v-if="member.position && member.position !== member.name"
                    class="text-[10px] text-muted-foreground truncate"
                  >
                    {{ member.position }}
                  </p>
                </div>
              </div>

              <div
                class="w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors"
                :class="[
                  isMemberAssigned(member.id)
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border/60'
                ]"
              >
                <Check v-if="isMemberAssigned(member.id)" class="w-3 h-3 stroke-[3]" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <!-- B. Date Badge Ringkas: 'Nov 16 - Nov 30' atau 'Nov 16' dengan icon Clock (Auto-save) -->
      <Popover v-model:open="isDatePopoverOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border/50 bg-muted/20 hover:bg-muted font-medium text-muted-foreground transition-colors cursor-pointer"
            :title="`Tenggat: ${formattedDateDisplay} (Klik untuk ubah tanggal)`"
            @click="openDatePopover"
          >
            <Clock class="w-3 h-3 text-muted-foreground/70" />
            <span class="text-[11px]">{{ formattedDateDisplay }}</span>
          </button>
        </PopoverTrigger>

        <!-- Popover Date Editor (Auto-save) -->
        <PopoverContent
          align="start"
          class="w-64 p-3 rounded-2xl border border-border bg-popover z-50 shadow-none animate-in fade-in-0 zoom-in-95 space-y-2.5"
          @click.stop
        >
          <div class="text-xs font-bold text-foreground">Ubah Rentang Tanggal</div>

          <div class="space-y-1">
            <label class="text-[10px] font-semibold text-muted-foreground">Start Date</label>
            <input
              v-model="editStartDate"
              type="date"
              class="w-full text-xs bg-muted/60 border border-border/50 rounded-xl px-2 py-1 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-semibold text-muted-foreground">Due Date</label>
            <input
              v-model="editDueDate"
              type="date"
              class="w-full text-xs bg-muted/60 border border-border/50 rounded-xl px-2 py-1 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div class="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              @click="handleSaveDates"
            >
              Simpan
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- C. Priority Flag Badge (Auto-save) -->
      <Popover v-model:open="isPriorityPopoverOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="flex items-center justify-center p-1 rounded-md border border-border/50 bg-muted/20 hover:bg-muted transition-colors cursor-pointer"
            :class="priorityConfig.textClass"
            :title="`Prioritas: ${priorityConfig.label}`"
            @click.stop
          >
            <Flag class="w-3 h-3" :class="priorityConfig.fillClass" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          class="w-36 p-1 rounded-xl border border-border bg-popover z-50 shadow-none animate-in fade-in-0 zoom-in-95"
          @click.stop
        >
          <div class="text-[10px] font-semibold text-muted-foreground px-2 py-1">
            Ubah Prioritas
          </div>
          <button
            v-for="opt in PRIORITY_OPTIONS"
            :key="opt.value"
            type="button"
            class="w-full flex items-center justify-between px-2 py-1 text-xs rounded-lg hover:bg-accent transition-colors text-left cursor-pointer"
            @click="handleSelectPriority(opt.value, $event)"
          >
            <div class="flex items-center gap-1.5">
              <Flag class="w-3 h-3" :class="opt.fillClass" />
              <span>{{ opt.label }}</span>
            </div>
            <Check v-if="task.priority === opt.value" class="w-3 h-3 text-primary" />
          </button>
        </PopoverContent>
      </Popover>

      <!-- D. Tag Badges & Popover Editor (Auto-save) -->
      <Popover v-model:open="isTagPopoverOpen">
        <PopoverTrigger as-child>
          <div class="flex items-center gap-1 cursor-pointer" @click.stop>
            <div
              v-if="task.tags && task.tags.length > 0"
              class="flex items-center gap-1 flex-wrap"
            >
              <span
                v-for="tag in task.tags"
                :key="tag"
                class="flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-border/50 bg-muted/20 text-[10px] font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                <Tag class="w-2.5 h-2.5 opacity-70" />
                <span>{{ tag }}</span>
              </span>
            </div>
            <button
              v-else
              type="button"
              class="p-1 rounded-md border border-border/50 bg-muted/20 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
              title="Tambah tag"
            >
              <Tag class="w-3 h-3" />
            </button>
          </div>
        </PopoverTrigger>

        <!-- Popover Tag Editor (Auto-save) -->
        <PopoverContent
          align="start"
          class="w-56 p-2.5 rounded-2xl border border-border bg-popover z-50 shadow-none animate-in fade-in-0 zoom-in-95 space-y-2"
          @click.stop
        >
          <div class="text-xs font-bold text-foreground">Kelola Tags</div>

          <!-- Existing Tags List -->
          <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1">
            <span
              v-for="tag in task.tags"
              :key="tag"
              class="flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-md text-foreground"
            >
              <span>#{{ tag }}</span>
              <button
                type="button"
                class="hover:text-destructive transition-colors ml-0.5"
                @click="handleRemoveTag(tag, $event)"
              >
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>

          <!-- Add new tag input -->
          <div class="flex items-center gap-1 pt-1">
            <input
              v-model="newTagInput"
              type="text"
              placeholder="Tambah tag baru..."
              class="flex-1 text-xs bg-muted/60 border border-border/50 rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
              @keydown.enter="handleAddTag"
            />
            <button
              type="button"
              class="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              @click="handleAddTag"
            >
              <Plus class="w-3.5 h-3.5" />
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- E. Checklist Counter -->
      <div
        v-if="totalChecklistCount > 0"
        class="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/40 font-medium text-muted-foreground"
        :title="`Subtasks: ${completedChecklistCount}/${totalChecklistCount}`"
      >
        <CheckSquare class="w-3 h-3 text-muted-foreground/70" />
        <span>{{ completedChecklistCount }}/{{ totalChecklistCount }}</span>
      </div>
    </div>

    <!-- 3. CLICKUP-STYLE SUBTASK CREATOR BOX (Muncul Saat Tombol ⊕ Diklik) -->
    <div
      v-if="isAddingSubtask"
      class="rounded-2xl border-2 border-indigo-500/80 bg-background p-3 shadow-sm space-y-2.5 mt-1"
      @click.stop
    >
      <!-- Subtask Input Row + Save ↵ Button -->
      <div class="flex items-center gap-2">
        <input
          ref="subtaskInputRef"
          v-model="newSubtaskTitle"
          type="text"
          placeholder="Subtask Name..."
          class="flex-1 text-xs font-medium text-foreground bg-transparent placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
          @keydown.enter="saveSubtask"
          @keydown.esc="cancelSubtask"
        />
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
          @click="saveSubtask"
        >
          <span>Save</span>
          <span class="text-[10px] opacity-80">↵</span>
        </button>
      </div>

      <!-- Quick Action Triggers (Assignee, Dates, Priority, Tag Ala ClickUp) -->
      <div class="flex flex-col gap-1.5 pt-0.5 text-xs text-muted-foreground/80">
        <!-- 1. Add Assignee -->
        <Popover>
          <PopoverTrigger as-child>
            <button
              type="button"
              class="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors w-fit text-left text-muted-foreground"
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
        <div class="flex items-center gap-2 w-fit">
          <button
            type="button"
            class="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors text-muted-foreground"
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
              class="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors w-fit text-left text-muted-foreground"
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
        <div class="flex items-center gap-2 w-fit">
          <button
            type="button"
            class="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors text-muted-foreground"
            @click="showSubtaskTagInput = !showSubtaskTagInput"
          >
            <Tag class="w-3.5 h-3.5" />
            <span class="text-[11px]">{{ subtaskTag ? `#${subtaskTag}` : 'Add tag' }}</span>
          </button>
          <input
            v-if="showSubtaskTagInput"
            v-model="subtaskTag"
            type="text"
            placeholder="Tag..."
            class="text-[10px] bg-muted/60 border border-border/50 rounded px-1.5 py-0.5 focus:outline-none w-20"
            @keydown.enter="showSubtaskTagInput = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>
