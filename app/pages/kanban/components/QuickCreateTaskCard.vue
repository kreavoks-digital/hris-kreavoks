<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { Badge } from '@kreavoks/kreaui'
import {
  UserCircle,
  Calendar as CalendarIcon,
  Flag,
  Tag as TagIcon,
  Search,
  X,
  Check,
  Ban
} from 'lucide-vue-next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { TaskDateRangePicker } from '~/components/ui/date-picker'
import type { TaskStatus, TaskPriority, KanbanMember, KanbanTask } from '../types'
import {
  getActiveUserMember,
  PRIORITY_CONFIGS,
  PRIORITY_OPTIONS
} from '../hooks/useKanban'

const props = defineProps<{
  status: TaskStatus
  projectId?: string
  members?: KanbanMember[]
}>()

const emit = defineEmits<{
  (e: 'save', taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>): void
  (e: 'cancel'): void
}>()

const titleInputRef = ref<HTMLInputElement | null>(null)
const title = ref('')
const selectedAssignee = ref<KanbanMember | null>(getActiveUserMember())
const startDate = ref('')
const dueDate = ref('')
const priority = ref<TaskPriority | null>(null)
const selectedTag = ref('')
const prioritySearch = ref('')

const filteredPriorityOptions = computed(() => {
  if (!prioritySearch.value.trim()) return PRIORITY_OPTIONS
  const q = prioritySearch.value.toLowerCase()
  return PRIORITY_OPTIONS.filter(o => o.label.toLowerCase().includes(q))
})

// Assignee search state
const assigneeSearch = ref('')
const isAssigneePopoverOpen = ref(false)
const isDatePopoverOpen = ref(false)
const isTagPopoverOpen = ref(false)

const availableMembers = computed(() => {
  if (props.members && props.members.length > 0) {
    return props.members
  }
  return [getActiveUserMember()]
})

const filteredMembers = computed(() => {
  const list = availableMembers.value
  if (!assigneeSearch.value.trim()) return list
  const q = assigneeSearch.value.toLowerCase()
  return list.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.position.toLowerCase().includes(q)
  )
})

const priorityOptions: { value: TaskPriority; label: string; variant: 'danger' | 'warning' | 'primary' | 'secondary' }[] = [
  { value: 'URGENT', label: 'Urgent', variant: 'danger' },
  { value: 'HIGH', label: 'High', variant: 'warning' },
  { value: 'MEDIUM', label: 'Medium', variant: 'primary' },
  { value: 'LOW', label: 'Low', variant: 'secondary' }
]

const tagPresets = ['Frontend', 'Backend', 'UI/UX', 'Bug', 'Feature', 'Security', 'Database']

onMounted(() => {
  nextTick(() => {
    titleInputRef.value?.focus()
  })
})

function handleSelectAssignee(member: KanbanMember) {
  selectedAssignee.value = member
  isAssigneePopoverOpen.value = false
  assigneeSearch.value = ''
}

function handleSelectPriority(p: TaskPriority) {
  priority.value = p
}

function handleSelectTag(tag: string) {
  selectedTag.value = tag
  isTagPopoverOpen.value = false
}

function handleSave() {
  if (!title.value.trim()) return

  emit('save', {
    projectId: props.projectId || 'prj-1',
    title: title.value.trim(),
    description: '',
    status: props.status,
    priority: priority.value || 'MEDIUM',
    startDate: startDate.value || undefined,
    dueDate: dueDate.value || new Date().toISOString().slice(0, 10),
    assignees: selectedAssignee.value ? [selectedAssignee.value] : [getActiveUserMember()],
    tags: selectedTag.value ? [selectedTag.value] : ['Task'],
    checklist: []
  })
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSave()
  } else if (e.key === 'Escape') {
    emit('cancel')
  }
}
</script>

<template>
  <div
    class="flex flex-col gap-2.5 rounded-2xl border-2 border-primary/50 bg-card p-3.5 shadow-none transition-all animate-in fade-in-0 zoom-in-95"
  >
    <!-- Top Row: Task Name input & Save Button -->
    <div class="flex items-center justify-between gap-2">
      <input
        ref="titleInputRef"
        v-model="title"
        type="text"
        placeholder="Task Name..."
        class="flex-1 text-xs font-semibold text-foreground bg-transparent placeholder:text-muted-foreground/60 focus:outline-none"
        @keydown="handleKeyDown"
      />

      <div class="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          :disabled="!title.trim()"
          class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-kv-primary text-white hover:bg-kv-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
          @click="handleSave"
        >
          <span>Save</span>
          <span class="text-[10px]">↵</span>
        </button>

        <button
          type="button"
          class="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          title="Batal"
          @click="emit('cancel')"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Options Rows (ala ClickUp / Reference) -->
    <div class="flex flex-col gap-1 pt-1 border-t border-border/20 text-xs text-muted-foreground">
      <!-- 1. Add Assignee -->
      <Popover v-model:open="isAssigneePopoverOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="flex items-center justify-between w-full py-1 px-1.5 rounded-lg hover:bg-muted/40 transition-colors text-left cursor-pointer group"
          >
            <div class="flex items-center gap-2">
              <UserCircle class="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              <template v-if="selectedAssignee">
                <div class="flex items-center gap-1.5">
                  <img
                    :src="selectedAssignee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedAssignee.name)}`"
                    :alt="selectedAssignee.name"
                    class="w-4 h-4 rounded-full object-cover bg-muted"
                  />
                  <span class="text-xs font-medium text-foreground">{{ selectedAssignee.name }}</span>
                </div>
              </template>
              <span v-else class="text-xs">Add assignee</span>
            </div>

            <button
              v-if="selectedAssignee"
              type="button"
              class="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              @click.stop="selectedAssignee = null"
            >
              <X class="w-3 h-3" />
            </button>
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" class="w-60 p-2 rounded-2xl border border-border bg-popover z-50 shadow-none">
          <!-- Search input -->
          <div class="relative mb-2">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              v-model="assigneeSearch"
              type="text"
              placeholder="Search or enter email..."
              class="w-full text-xs rounded-xl border border-border/40 bg-background pl-8 pr-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          <div class="text-[11px] font-semibold text-muted-foreground px-2 py-1 select-none">
            People
          </div>

          <!-- Members list -->
          <div class="max-h-48 overflow-y-auto space-y-0.5">
            <button
              v-for="member in filteredMembers"
              :key="member.id"
              type="button"
              class="flex items-center justify-between w-full px-2 py-1.5 rounded-xl hover:bg-accent text-left transition-colors cursor-pointer"
              @click="handleSelectAssignee(member)"
            >
              <div class="flex items-center gap-2 min-w-0">
                <img
                  :src="member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`"
                  :alt="member.name"
                  class="w-6 h-6 rounded-full object-cover bg-muted shrink-0"
                />
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-xs font-medium text-foreground truncate">{{ member.name }}</span>
                    <span
                      v-if="member.id === getActiveUserMember().id"
                      class="text-[9px] font-semibold text-kv-primary bg-kv-primary/10 px-1 py-0.2 rounded-md shrink-0"
                    >
                      Saya
                    </span>
                  </div>
                  <span class="text-[10px] text-muted-foreground truncate">{{ member.position }}</span>
                </div>
              </div>

              <Check
                v-if="selectedAssignee?.id === member.id"
                class="w-3.5 h-3.5 text-kv-primary shrink-0"
              />
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- 2. Add Dates (Dual Start Date & Due Date with Calendar variant) -->
      <TaskDateRangePicker
        v-model:start-date="startDate"
        v-model:due-date="dueDate"
        placeholder="Add dates"
      />

      <!-- 3. Add Priority (Semantic Color & Shortcut ala ClickUp) -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            class="flex items-center justify-between w-full py-1 px-1.5 rounded-lg hover:bg-muted/40 transition-colors text-left cursor-pointer group"
          >
            <div class="flex items-center gap-2">
              <template v-if="priority">
                <Flag class="w-4 h-4" :class="PRIORITY_CONFIGS[priority]?.fillClass" />
                <span class="text-xs font-medium text-foreground">
                  {{ PRIORITY_CONFIGS[priority]?.label }}
                </span>
              </template>
              <template v-else>
                <Flag class="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                <span class="text-xs">Add priority</span>
              </template>
            </div>

            <button
              v-if="priority"
              type="button"
              class="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              @click.stop="priority = null"
            >
              <X class="w-3 h-3" />
            </button>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" class="w-56 rounded-2xl border border-border bg-popover p-2 shadow-none z-50 animate-in fade-in-0 zoom-in-95">
          <!-- Search input inside priority dropdown -->
          <div class="mb-2">
            <input
              v-model="prioritySearch"
              type="text"
              placeholder="Search..."
              class="w-full text-xs rounded-xl border border-border/40 bg-background px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
              @click.stop
              @keydown.stop
            />
          </div>

          <div class="text-[11px] font-semibold text-muted-foreground px-2 py-1 select-none">
            Priority
          </div>

          <!-- Priority Options with Semantic Color Flags -->
          <div class="space-y-0.5">
            <DropdownMenuItem
              v-for="opt in filteredPriorityOptions"
              :key="opt.value"
              class="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl cursor-pointer hover:bg-accent transition-colors"
              @click="handleSelectPriority(opt.value)"
            >
              <div class="flex items-center gap-2.5">
                <Flag class="w-3.5 h-3.5" :class="opt.fillClass" />
                <span class="font-medium text-foreground">{{ opt.label }}</span>
              </div>
              <span class="text-[10px] text-muted-foreground font-normal">{{ opt.shortcut }}</span>
            </DropdownMenuItem>

            <!-- Clear Priority Option -->
            <DropdownMenuItem
              class="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl cursor-pointer text-muted-foreground hover:bg-accent transition-colors border-t border-border/20 mt-1 pt-1.5"
              @click="priority = null"
            >
              <div class="flex items-center gap-2.5">
                <Ban class="w-3.5 h-3.5 text-muted-foreground" />
                <span>Clear</span>
              </div>
              <span class="text-[10px] text-muted-foreground">Ctrl 0</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- 4. Add Tag -->
      <Popover v-model:open="isTagPopoverOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="flex items-center justify-between w-full py-1 px-1.5 rounded-lg hover:bg-muted/40 transition-colors text-left cursor-pointer group"
          >
            <div class="flex items-center gap-2">
              <TagIcon class="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              <span v-if="selectedTag" class="text-xs font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-lg border border-border/40">
                {{ selectedTag }}
              </span>
              <span v-else class="text-xs">Add tag</span>
            </div>

            <button
              v-if="selectedTag"
              type="button"
              class="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              @click.stop="selectedTag = ''"
            >
              <X class="w-3 h-3" />
            </button>
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" class="w-52 p-2 rounded-2xl border border-border bg-popover z-50 shadow-none">
          <div class="text-[11px] font-semibold text-muted-foreground px-1 pb-1.5 mb-1 border-b border-border/30">
            Pilih Tag
          </div>
          <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            <button
              v-for="tag in tagPresets"
              :key="tag"
              type="button"
              class="text-xs px-2 py-1 rounded-xl border border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
              :class="{ 'bg-primary/10 border-primary text-primary font-medium': selectedTag === tag }"
              @click="handleSelectTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>

