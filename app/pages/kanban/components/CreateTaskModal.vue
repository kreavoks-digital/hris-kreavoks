<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import {
  X,
  Plus,
  Maximize2,
  Calendar as CalendarIcon,
  UserCircle,
  Flag,
  Tag as TagIcon,
  MoreHorizontal,
  Sparkles,
  Paperclip,
  Bell,
  ChevronDown,
  Check,
  Search,
  Ban,
  ListTodo,
  CheckCircle2
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
import StatusPicker from './StatusPicker.vue'
import type { TaskStatus, TaskPriority, KanbanMember, TaskChecklistItem, KanbanColumnDef } from '../types'
import {
  getActiveUserMember,
  PRIORITY_CONFIGS,
  PRIORITY_OPTIONS
} from '../hooks/useKanban'

const props = defineProps<{
  isOpen: boolean
  defaultStatus?: TaskStatus
  projectId?: string
  columns?: KanbanColumnDef[]
  members?: KanbanMember[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'addStatus', label: string, color?: string): void
  (e: 'submit', taskData: {
    projectId: string
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    startDate?: string
    dueDate: string
    assignees: KanbanMember[]
    tags: string[]
    checklist: TaskChecklistItem[]
  }): void
}>()

// Tabs in top navigation
const navTabs = ['Task', 'Doc', 'Reminder', 'Whiteboard', 'Dashboard']
const activeNavTab = ref('Task')

// Form inputs
const titleInputRef = ref<HTMLInputElement | null>(null)
const title = ref('')
const description = ref('')
const status = ref<TaskStatus>(props.defaultStatus || 'TODO')
const priority = ref<TaskPriority | null>(null)
const startDate = ref('')
const dueDate = ref(new Date().toISOString().slice(0, 10))
const selectedAssignees = ref<KanbanMember[]>([getActiveUserMember()])
const selectedTag = ref('')

// Popover states
const isAssigneePopoverOpen = ref(false)
const isTagPopoverOpen = ref(false)
const assigneeSearch = ref('')
const prioritySearch = ref('')

const tagPresets = ['Frontend', 'Backend', 'UI/UX', 'Bug', 'Feature', 'Security', 'Database']

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'TODO', label: 'TO DO', color: '#64748b' },
  { value: 'IN_PROGRESS', label: 'IN PROGRESS', color: '#4082e6' },
  { value: 'IN_REVIEW', label: 'IN REVIEW', color: '#f59e0b' },
  { value: 'DONE', label: 'COMPLETED', color: '#10b981' }
]

const currentStatusOption = computed(() => {
  return statusOptions.find(s => s.value === status.value) || statusOptions[0]
})

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

const filteredPriorityOptions = computed(() => {
  if (!prioritySearch.value.trim()) return PRIORITY_OPTIONS
  const q = prioritySearch.value.toLowerCase()
  return PRIORITY_OPTIONS.filter(o => o.label.toLowerCase().includes(q))
})

// Sync status when defaultStatus prop changes
watch(
  () => props.defaultStatus,
  (newStatus) => {
    if (newStatus) status.value = newStatus
  }
)

// Body scroll lock
watch(
  () => props.isOpen,
  (open) => {
    if (process.client) {
      if (open) {
        document.body.style.overflow = 'hidden'
        if (selectedAssignees.value.length === 0) {
          selectedAssignees.value = [getActiveUserMember()]
        }
        nextTick(() => {
          titleInputRef.value?.focus()
        })
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = ''
  }
})

function toggleAssignee(member: KanbanMember) {
  const idx = selectedAssignees.value.findIndex(m => m.id === member.id)
  if (idx >= 0) {
    selectedAssignees.value.splice(idx, 1)
  } else {
    selectedAssignees.value.push(member)
  }
}

function handleSelectPriority(p: TaskPriority) {
  priority.value = p
}

function handleSelectTag(t: string) {
  selectedTag.value = selectedTag.value === t ? '' : t
  isTagPopoverOpen.value = false
}

function resetForm() {
  title.value = ''
  description.value = ''
  status.value = props.defaultStatus || 'TODO'
  priority.value = null
  startDate.value = ''
  dueDate.value = new Date().toISOString().slice(0, 10)
  selectedAssignees.value = [getActiveUserMember()]
  selectedTag.value = ''
}

function handleSubmit() {
  if (!title.value.trim()) return

  const finalAssignees = selectedAssignees.value.length > 0
    ? selectedAssignees.value
    : [getActiveUserMember()]

  emit('submit', {
    projectId: props.projectId || 'prj-1',
    title: title.value.trim(),
    description: description.value.trim(),
    status: status.value,
    priority: priority.value || 'MEDIUM',
    startDate: startDate.value || undefined,
    dueDate: dueDate.value || new Date().toISOString().slice(0, 10),
    assignees: finalAssignees,
    tags: selectedTag.value ? [selectedTag.value] : ['Task'],
    checklist: []
  })

  resetForm()
  emit('close')
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm overflow-hidden animate-in fade-in-0 duration-200"
      @click.self="emit('close')"
      @keydown="handleKeyDown"
    >
      <div
        class="relative w-full max-w-[740px] flex flex-col rounded-3xl border border-border/40 bg-card text-card-foreground shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95"
        @click.stop
      >
        <!-- Top Nav Bar: Tabs & Window Controls (ClickUp style) -->
        <div class="flex items-center justify-between px-5 pt-3.5 border-b border-border/20">
          <div class="flex items-center gap-4 text-xs font-medium">
            <button
              v-for="tab in navTabs"
              :key="tab"
              type="button"
              :disabled="tab !== 'Task'"
              class="pb-3 transition-colors relative flex items-center gap-1.5"
              :class="[
                tab === 'Task'
                  ? (activeNavTab === tab
                    ? 'text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-kv-primary cursor-pointer'
                    : 'text-muted-foreground hover:text-foreground cursor-pointer')
                  : 'text-muted-foreground/40 cursor-not-allowed select-none'
              ]"
              :title="tab !== 'Task' ? `${tab} (Next development / Coming soon)` : undefined"
              @click="tab === 'Task' ? (activeNavTab = tab) : null"
            >
              <span>{{ tab }}</span>
              <span
                v-if="tab !== 'Task'"
                class="text-[9px] px-1.5 py-0.2 rounded-md bg-muted/50 text-muted-foreground/50 border border-border/30 font-normal scale-90"
              >
                Soon
              </span>
            </button>
          </div>

          <div class="flex items-center gap-1 pb-3 text-muted-foreground">
            <button
              type="button"
              class="p-1 rounded-lg hover:bg-muted/60 hover:text-foreground transition-colors"
              title="Expand"
            >
              <Maximize2 class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              class="p-1 rounded-lg hover:bg-muted/60 hover:text-foreground transition-colors"
              title="Close"
              @click="emit('close')"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Main Form Body -->
        <form class="p-5 sm:p-6 space-y-4" @submit.prevent="handleSubmit">
          <!-- Context Selectors (List / Task Breadcrumbs) -->
          <div class="flex items-center gap-2 text-xs">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 text-muted-foreground font-medium border border-border/30 hover:bg-muted/70 cursor-pointer transition-colors">
              <ListTodo class="w-3.5 h-3.5 text-kv-primary" />
              <span>List</span>
              <ChevronDown class="w-3 h-3 text-muted-foreground" />
            </div>

            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 text-muted-foreground font-medium border border-border/30 hover:bg-muted/70 cursor-pointer transition-colors">
              <span class="w-2 h-2 rounded-full bg-kv-primary"></span>
              <span>Task</span>
              <ChevronDown class="w-3 h-3 text-muted-foreground" />
            </div>
          </div>

          <!-- Title Input (Clean ClickUp style) -->
          <div class="pt-1">
            <input
              ref="titleInputRef"
              v-model="title"
              type="text"
              required
              placeholder="Task Name or type '/' for commands"
              class="w-full text-base sm:text-lg font-semibold text-foreground bg-transparent placeholder:text-muted-foreground/50 focus:outline-none"
              @keydown.enter.prevent="handleSubmit"
            />
          </div>

          <!-- Description Input -->
          <div class="relative">
            <textarea
              v-model="description"
              rows="3"
              placeholder="Add description, or write with ✦ AI"
              class="w-full text-xs sm:text-sm text-foreground bg-transparent placeholder:text-muted-foreground/50 focus:outline-none resize-none leading-relaxed"
            ></textarea>

            <button
              type="button"
              class="absolute right-1 bottom-1 text-[11px] font-medium text-kv-primary/80 hover:text-kv-primary flex items-center gap-1 bg-kv-primary/5 hover:bg-kv-primary/10 px-2 py-1 rounded-lg transition-colors"
            >
              <Sparkles class="w-3 h-3 text-kv-primary" />
              <span>Write with AI</span>
            </button>
          </div>

          <!-- Reusable Property Pills Bar (Ala ClickUp) -->
          <div class="flex items-center gap-2 flex-wrap pt-2 border-t border-border/20 text-xs">
            <!-- 1. Status Pill (Soft color with Search & Add Status sync) -->
            <StatusPicker
              v-model="status"
              :columns="columns"
              @add-status="(label, color) => emit('addStatus', label, color)"
            />

            <!-- 2. Assignee Pill (Reusing Popover Member Selection with DiceBear avatar) -->
            <Popover v-model:open="isAssigneePopoverOpen">
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/40 hover:bg-muted/50 text-xs font-medium cursor-pointer transition-all"
                  :class="selectedAssignees.length > 0 ? 'bg-muted/30 text-foreground' : 'text-muted-foreground'"
                >
                  <UserCircle class="w-3.5 h-3.5 text-muted-foreground" />
                  <template v-if="selectedAssignees.length > 0">
                    <div class="flex items-center -space-x-1.5">
                      <img
                        v-for="m in selectedAssignees.slice(0, 2)"
                        :key="m.id"
                        :src="m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`"
                        :alt="m.name"
                        class="w-4 h-4 rounded-full object-cover border border-card bg-muted"
                      />
                    </div>
                    <span>{{ selectedAssignees.length === 1 ? selectedAssignees[0].name : `${selectedAssignees.length} Assignees` }}</span>
                  </template>
                  <span v-else>Assignee</span>
                </button>
              </PopoverTrigger>

              <PopoverContent align="start" class="w-64 p-2 rounded-2xl border border-border bg-popover z-[1050] shadow-xl">
                <div class="relative mb-2">
                  <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    v-model="assigneeSearch"
                    type="text"
                    placeholder="Search people..."
                    class="w-full text-xs rounded-xl border border-border/40 bg-background pl-8 pr-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>
                <div class="text-[11px] font-semibold text-muted-foreground px-2 py-1 select-none">People</div>
                <div class="max-h-48 overflow-y-auto space-y-0.5">
                  <button
                    v-for="member in filteredMembers"
                    :key="member.id"
                    type="button"
                    class="flex items-center justify-between w-full px-2 py-1.5 rounded-xl hover:bg-accent text-left transition-colors cursor-pointer"
                    @click="toggleAssignee(member)"
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
                      v-if="selectedAssignees.some(m => m.id === member.id)"
                      class="w-3.5 h-3.5 text-kv-primary shrink-0"
                    />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <!-- 3. Dates Pill (Reusing TaskDateRangePicker variant) -->
            <TaskDateRangePicker
              v-model:start-date="startDate"
              v-model:due-date="dueDate"
              placeholder="Due date"
            >
              <template #trigger="{ formatted, hasDate }">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/40 hover:bg-muted/50 text-xs font-medium cursor-pointer transition-all"
                  :class="hasDate ? 'bg-muted/30 text-foreground font-semibold' : 'text-muted-foreground'"
                >
                  <CalendarIcon class="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{{ formatted || 'Due date' }}</span>
                </button>
              </template>
            </TaskDateRangePicker>

            <!-- 4. Priority Pill (Reusing Semantic Flags Dropdown) -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/40 hover:bg-muted/50 text-xs font-medium cursor-pointer transition-all"
                  :class="priority ? 'bg-muted/30 text-foreground font-semibold' : 'text-muted-foreground'"
                >
                  <Flag
                    class="w-3.5 h-3.5"
                    :class="priority ? PRIORITY_CONFIGS[priority]?.fillClass : 'text-muted-foreground'"
                  />
                  <span>{{ priority ? PRIORITY_CONFIGS[priority]?.label : 'Priority' }}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" class="w-56 rounded-2xl border border-border bg-popover p-2 shadow-xl z-[1050] animate-in fade-in-0 zoom-in-95">
                <div class="mb-2">
                  <input
                    v-model="prioritySearch"
                    type="text"
                    placeholder="Search priority..."
                    class="w-full text-xs rounded-xl border border-border/40 bg-background px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                    @click.stop
                  />
                </div>
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
                    <span class="text-[10px] text-muted-foreground">{{ opt.shortcut }}</span>
                  </DropdownMenuItem>
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

            <!-- 5. Tags Pill (Reusing Tags Popover) -->
            <Popover v-model:open="isTagPopoverOpen">
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/40 hover:bg-muted/50 text-xs font-medium cursor-pointer transition-all"
                  :class="selectedTag ? 'bg-primary/10 border-primary text-primary font-semibold' : 'text-muted-foreground'"
                >
                  <TagIcon class="w-3.5 h-3.5" :class="selectedTag ? 'text-primary' : 'text-muted-foreground'" />
                  <span>{{ selectedTag || 'Tags' }}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" class="w-56 p-2 rounded-2xl border border-border bg-popover z-[1050] shadow-xl">
                <div class="text-[11px] font-semibold text-muted-foreground px-1 pb-1.5 mb-1 border-b border-border/30">
                  Select Tag
                </div>
                <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  <button
                    v-for="tag in tagPresets"
                    :key="tag"
                    type="button"
                    class="text-xs px-2.5 py-1 rounded-xl border border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                    :class="{ 'bg-primary/10 border-primary text-primary font-semibold': selectedTag === tag }"
                    @click="handleSelectTag(tag)"
                  >
                    {{ tag }}
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <!-- 6. More Options Pill -->
            <button
              type="button"
              class="p-1.5 rounded-xl border border-border/40 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="More options"
            >
              <MoreHorizontal class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Custom Fields Area (ClickUp style) -->
          <div class="pt-3 border-t border-border/20 space-y-2">
            <span class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Fields
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2.5 py-1.5 rounded-xl border border-dashed border-border/50 transition-colors cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Create new field</span>
            </button>
          </div>

          <!-- Bottom Footer Bar -->
          <div class="flex items-center justify-between pt-4 border-t border-border/20">
            <!-- Left: Templates Pill -->
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-1.5 rounded-xl border border-border/40 transition-colors cursor-pointer"
            >
              <Sparkles class="w-3.5 h-3.5 text-muted-foreground" />
              <span>Templates</span>
            </button>

            <!-- Right: Attachment, Notification & Create Task Button -->
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                title="Attach file"
              >
                <Paperclip class="w-4 h-4" />
              </button>

              <button
                type="button"
                class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell class="w-4 h-4" />
                <span class="text-[11px] font-medium">1</span>
              </button>

              <!-- Primary Submit Button (ClickUp split button style) -->
              <div class="inline-flex items-center rounded-xl bg-kv-primary shadow-sm hover:bg-kv-primary/90 transition-all">
                <button
                  type="submit"
                  :disabled="!title.trim()"
                  class="px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Create Task</span>
                </button>
                <div class="w-[1px] h-4 bg-white/20"></div>
                <button
                  type="button"
                  class="px-2 py-2 text-white hover:bg-white/10 rounded-r-xl transition-colors cursor-pointer"
                >
                  <ChevronDown class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
