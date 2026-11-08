<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { Badge, Button } from '@kreavoks/kreaui'
import {
  X,
  Calendar,
  CheckSquare,
  Trash2,
  User,
  Sparkles,
  Send,
  Plus,
  Clock,
  Flag,
  Tag as TagIcon,
  CheckCircle2,
  Check,
  MessageSquare,
  UserPlus
} from 'lucide-vue-next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover'
import { Checkbox } from '~/components/ui/checkbox'
import { TaskDateRangePicker } from '~/components/ui/date-picker'
import StatusPicker from './StatusPicker.vue'
import type { KanbanTask, TaskStatus, TaskPriority, KanbanColumnDef, KanbanMember } from '../types'
import { PRIORITY_CONFIGS, PRIORITY_OPTIONS, getActiveUserMember } from '../hooks/useKanban'
import { kanbanApi } from '../api/kanban.api'
import { useAuth } from '~/composables/useAuth'

const props = withDefaults(
  defineProps<{
    task: KanbanTask | null
    isOpen: boolean
    columns?: KanbanColumnDef[]
    members?: KanbanMember[]
  }>(),
  {
    columns: () => [],
    members: () => []
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggleChecklist', taskId: string, checklistId: string): void
  (e: 'updateStatus', taskId: string, status: TaskStatus): void
  (e: 'updatePriority', taskId: string, priority: TaskPriority): void
  (e: 'updateAssignees', taskId: string, assignees: KanbanMember[]): void
  (e: 'updateDates', taskId: string, startDate?: string, dueDate?: string): void
  (e: 'updateTags', taskId: string, tags: string[]): void
  (e: 'deleteTask', taskId: string): void
  (e: 'addStatus', label: string, color?: string): void
}>()

const newComment = ref('')
const newChecklistTitle = ref('')
const newTagInput = ref('')
const isAddingTag = ref(false)
const memberSearch = ref('')
const isMemberPickerOpen = ref(false)
const isPriorityPickerOpen = ref(false)

const { user } = useAuth()
const activeUser = getActiveUserMember()

// Real comments feed terhubung langsung ke backend
const comments = ref<Array<{
  id: number | string
  author: string
  avatar: string
  time: string
  text: string
  userId?: number
}>>([])
const isLoadingComments = ref(false)
const isSendingComment = ref(false)

function formatCommentTime(dateStr: string): string {
  if (!dateStr) return 'Baru saja'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diffSec < 60) return 'Baru saja'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} menit yang lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam yang lalu`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} hari yang lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function loadComments() {
  if (!props.task?.id) {
    comments.value = []
    return
  }
  isLoadingComments.value = true
  try {
    const res = await kanbanApi.getComments(props.task.id)
    comments.value = res.map(c => ({
      id: c.id,
      author: c.user?.name || 'User',
      avatar: c.user?.avatar || '',
      time: formatCommentTime(c.createdAt),
      text: c.content,
      userId: c.userId
    }))
  } catch (err) {
    console.error('Gagal mengambil komentar:', err)
  } finally {
    isLoadingComments.value = false
  }
}

watch(
  () => [props.isOpen, props.task?.id],
  ([open, taskId]) => {
    if (open && taskId) {
      loadComments()
    }
  },
  { immediate: true }
)

const priorityConfig = computed(() => {
  if (!props.task) return PRIORITY_CONFIGS.MEDIUM
  return PRIORITY_CONFIGS[props.task.priority] || PRIORITY_CONFIGS.MEDIUM
})

// Deduplikasi assignees: pastikan tidak ada double-double!
const uniqueAssignees = computed<KanbanMember[]>(() => {
  if (!props.task || !props.task.assignees) return []
  const seen = new Set<string>()
  const list: KanbanMember[] = []
  for (const a of props.task.assignees) {
    const key = String(a.id || a.name)
    if (!seen.has(key)) {
      seen.add(key)
      list.push(a)
    }
  }
  return list
})

const filteredMembers = computed(() => {
  if (!memberSearch.value.trim()) return props.members
  const query = memberSearch.value.toLowerCase()
  return props.members.filter(m =>
    m.name.toLowerCase().includes(query) || (m.position && m.position.toLowerCase().includes(query))
  )
})

function isMemberAssigned(memberId: string): boolean {
  return uniqueAssignees.value.some(a => String(a.id) === String(memberId))
}

function toggleAssignee(member: KanbanMember) {
  if (!props.task) return
  const current = [...uniqueAssignees.value]
  const idx = current.findIndex(a => String(a.id) === String(member.id))
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(member)
  }
  props.task.assignees = current
  emit('updateAssignees', props.task.id, current)
}

function removeAssignee(memberId: string) {
  if (!props.task) return
  const current = uniqueAssignees.value.filter(a => String(a.id) !== String(memberId))
  props.task.assignees = current
  emit('updateAssignees', props.task.id, current)
}

const completedChecklistCount = computed(() => {
  if (!props.task) return 0
  return (props.task.checklist || []).filter(c => c.isCompleted).length
})

function handleChecklistClick(checklistId: string) {
  if (props.task) {
    emit('toggleChecklist', props.task.id, checklistId)
  }
}

function handleAddChecklistItem() {
  if (!props.task || !newChecklistTitle.value.trim()) return
  if (!props.task.checklist) props.task.checklist = []
  props.task.checklist.push({
    id: `chk-${Date.now()}`,
    title: newChecklistTitle.value.trim(),
    isCompleted: false
  })
  newChecklistTitle.value = ''
}

function handleStatusUpdate(val: any) {
  if (props.task && val) {
    props.task.status = val as TaskStatus
    emit('updateStatus', props.task.id, val as TaskStatus)
  }
}

function handleSelectPriority(priority: TaskPriority) {
  if (props.task) {
    props.task.priority = priority
    emit('updatePriority', props.task.id, priority)
    isPriorityPickerOpen.value = false
  }
}

function handleDatesChange() {
  if (props.task) {
    emit('updateDates', props.task.id, props.task.startDate, props.task.dueDate)
  }
}

function handleAddTag() {
  if (!props.task || !newTagInput.value.trim()) return
  const tag = newTagInput.value.trim().replace(/^#/, '')
  if (!props.task.tags) props.task.tags = []
  if (!props.task.tags.includes(tag)) {
    props.task.tags.push(tag)
    emit('updateTags', props.task.id, props.task.tags)
  }
  newTagInput.value = ''
  isAddingTag.value = false
}

function handleRemoveTag(tagToRemove: string) {
  if (!props.task || !props.task.tags) return
  props.task.tags = props.task.tags.filter(t => t !== tagToRemove)
  emit('updateTags', props.task.id, props.task.tags)
}

async function handleSendComment() {
  const trimmed = newComment.value.trim()
  if (!trimmed || !props.task?.id || isSendingComment.value) return

  isSendingComment.value = true
  try {
    const created = await kanbanApi.addComment(props.task.id, trimmed)
    if (created) {
      comments.value.push({
        id: created.id,
        author: created.user?.name || activeUser.name,
        avatar: created.user?.avatar || activeUser.avatar || '',
        time: 'Baru saja',
        text: created.content,
        userId: created.userId
      })
      newComment.value = ''
    }
  } catch (err) {
    console.error('Gagal mengirim komentar:', err)
  } finally {
    isSendingComment.value = false
  }
}

async function handleDeleteComment(commentId: number | string) {
  if (!props.task?.id) return
  const numId = typeof commentId === 'number' ? commentId : parseInt(String(commentId), 10)
  if (isNaN(numId)) return

  if (confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
    try {
      const ok = await kanbanApi.deleteComment(props.task.id, numId)
      if (ok) {
        comments.value = comments.value.filter(c => c.id !== commentId)
      }
    } catch (err) {
      console.error('Gagal menghapus komentar:', err)
    }
  }
}

function handleDelete() {
  if (props.task && confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
    emit('deleteTask', props.task.id)
  }
}

// Body scroll lock
watch(
  () => props.isOpen,
  (open) => {
    if (typeof document !== 'undefined') {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && task"
      class="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm overflow-hidden"
      @click.self="emit('close')"
    >
      <!-- Large Workspace Modal Container -->
      <div
        class="relative w-[95vw] max-w-[1420px] h-[92vh] max-h-[920px] flex flex-col rounded-3xl border border-border/40 bg-card shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 my-auto"
        @click.stop
      >
        <!-- Top Bar / Breadcrumb Header (Tanpa Project Code & ID mentah) -->
        <div class="flex items-center justify-between px-6 py-3.5 border-b border-border/20 bg-muted/10 shrink-0">
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span class="font-medium hover:text-foreground cursor-pointer">Projects</span>
            <span>/</span>
            <span class="font-medium hover:text-foreground cursor-pointer">Kanban Board</span>
            <span>/</span>
            <span class="font-semibold text-foreground truncate max-w-[280px]">
              {{ task.title }}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              title="Hapus Tugas"
              class="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              @click="handleDelete"
            >
              <Trash2 class="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Tutup Modal (Esc)"
              @click="emit('close')"
            >
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <!-- Main Workspace: Split 2 Columns on Desktop, Scrollable Stack on Mobile -->
        <div class="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_420px]">
          <!-- Left Column: Task Details, Fields, Checklist -->
          <div class="overflow-y-auto p-6 lg:p-8 space-y-6">
            <!-- Title -->
            <div class="space-y-1">
              <h2 class="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                {{ task.title }}
              </h2>
            </div>

            <!-- AI Assistant Banner (ClickUp style) -->
            <div class="flex items-center gap-2.5 p-3 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-primary font-medium">
              <Sparkles class="w-4 h-4 shrink-0" />
              <span class="flex-1">Ringkasan Tugas: Tugas ini berada di sprint aktif dan memerlukan perhatian pada review implementasi.</span>
            </div>

            <!-- Properties Grid (Konsisten & Interaktif) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-muted/20 p-4 border border-border/20 text-xs">
              <!-- 1. Status Field (Interaktif) -->
              <div class="flex items-center justify-between gap-2">
                <span class="text-muted-foreground flex items-center gap-2 w-28 shrink-0 font-medium">
                  <CheckCircle2 class="w-4 h-4 text-muted-foreground" />
                  Status
                </span>
                <div class="flex-1 max-w-[210px]">
                  <StatusPicker
                    :model-value="task ? task.status : 'TODO'"
                    :columns="columns"
                    @update:model-value="handleStatusUpdate"
                    @add-status="(label, color) => emit('addStatus', label, color)"
                  />
                </div>
              </div>

              <!-- 2. Priority Field (Interaktif Popover) -->
              <div class="flex items-center justify-between gap-2">
                <span class="text-muted-foreground flex items-center gap-2 w-28 shrink-0 font-medium">
                  <Flag class="w-4 h-4 text-muted-foreground" />
                  Prioritas
                </span>
                <div class="flex-1">
                  <Popover v-model:open="isPriorityPickerOpen">
                    <PopoverTrigger as-child>
                      <button
                        type="button"
                        class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-border/50 bg-background hover:bg-muted transition-colors cursor-pointer"
                        :class="priorityConfig.textClass"
                      >
                        <Flag class="w-3.5 h-3.5" :class="priorityConfig.fillClass" />
                        <span class="font-semibold text-xs">{{ priorityConfig.label }}</span>
                      </button>
                    </PopoverTrigger>

                    <PopoverContent align="start" class="w-40 p-1.5 rounded-2xl border border-border bg-popover z-[1050] shadow-2xl animate-in fade-in-0 zoom-in-95">
                      <div class="text-[10px] font-semibold text-muted-foreground px-2 py-1">Pilih Prioritas</div>
                      <button
                        v-for="opt in PRIORITY_OPTIONS"
                        :key="opt.value"
                        type="button"
                        class="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl hover:bg-accent transition-colors text-left cursor-pointer"
                        @click="handleSelectPriority(opt.value)"
                      >
                        <div class="flex items-center gap-2">
                          <Flag class="w-3.5 h-3.5" :class="opt.fillClass" />
                          <span>{{ opt.label }}</span>
                        </div>
                        <Check v-if="task.priority === opt.value" class="w-3.5 h-3.5 text-primary" />
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <!-- 3. Dates Field (Interaktif TaskDateRangePicker) -->
              <div class="flex items-center justify-between gap-2">
                <span class="text-muted-foreground flex items-center gap-2 w-28 shrink-0 font-medium">
                  <Calendar class="w-4 h-4 text-muted-foreground" />
                  Tanggal
                </span>
                <div class="flex-1 max-w-[210px]">
                  <TaskDateRangePicker
                    v-model:start-date="task.startDate"
                    v-model:due-date="task.dueDate"
                    placeholder="Atur tanggal"
                    class="bg-background border border-border/40 hover:bg-muted/30"
                    @update:start-date="handleDatesChange"
                    @update:due-date="handleDatesChange"
                  />
                </div>
              </div>

              <!-- 4. Assignee Field (Avatar Stack Max 5 + '+N' Indicator Konsisten) -->
              <div class="flex items-center justify-between gap-2">
                <span class="text-muted-foreground flex items-center gap-2 w-28 shrink-0 font-medium">
                  <User class="w-4 h-4 text-muted-foreground" />
                  Assignee
                </span>
                <div class="flex items-center gap-2">
                  <Popover v-model:open="isMemberPickerOpen">
                    <PopoverTrigger as-child>
                      <div class="flex items-center gap-2 cursor-pointer group/assigneeTrigger">
                        <!-- Avatar Stack (Max 5, sisanya +N) -->
                        <div v-if="uniqueAssignees.length > 0" class="flex items-center -space-x-2">
                          <template v-for="m in uniqueAssignees.slice(0, 5)" :key="m.id">
                            <img
                              :src="m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`"
                              :alt="m.name"
                              :title="m.name"
                              class="w-7 h-7 rounded-full border-2 border-card object-cover bg-muted hover:scale-110 transition-transform"
                            />
                          </template>
                          <div
                            v-if="uniqueAssignees.length > 5"
                            class="w-7 h-7 rounded-full border-2 border-card bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold hover:scale-110 transition-transform"
                            :title="`${uniqueAssignees.length - 5} anggota lainnya`"
                          >
                            +{{ uniqueAssignees.length - 5 }}
                          </div>
                        </div>

                        <!-- Button Trigger (Tugaskan / Kelola) -->
                        <button
                          type="button"
                          class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-dashed border-border/70 hover:border-primary hover:text-primary transition-colors text-muted-foreground text-xs cursor-pointer"
                        >
                          <UserPlus class="w-3.5 h-3.5" />
                          <span>{{ uniqueAssignees.length === 0 ? 'Tugaskan' : 'Kelola' }}</span>
                        </button>
                      </div>
                    </PopoverTrigger>

                    <PopoverContent align="start" class="w-64 p-2.5 rounded-2xl border border-border bg-popover z-[1050] shadow-2xl animate-in fade-in-0 zoom-in-95">
                      <div class="flex items-center justify-between px-1 mb-1.5">
                        <span class="text-xs font-bold text-foreground">Tugaskan Anggota</span>
                        <span class="text-[10px] text-muted-foreground">{{ uniqueAssignees.length }} terpilih</span>
                      </div>
                      <input
                        v-model="memberSearch"
                        type="text"
                        placeholder="Cari anggota..."
                        class="w-full text-xs bg-muted/60 border border-border/50 rounded-xl px-2 py-1 mb-2 focus:outline-none focus:border-primary"
                      />
                      <div class="max-h-52 overflow-y-auto space-y-1">
                        <div
                          v-for="member in filteredMembers"
                          :key="member.id"
                          class="flex items-center justify-between p-1.5 rounded-xl hover:bg-accent cursor-pointer transition-colors"
                          @click="toggleAssignee(member)"
                        >
                          <div class="flex items-center gap-2 min-w-0">
                            <img
                              :src="member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`"
                              :alt="member.name"
                              class="w-5 h-5 rounded-full object-cover shrink-0"
                            />
                            <div class="truncate text-left">
                              <p class="text-xs font-semibold text-foreground truncate">{{ member.name }}</p>
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
                </div>
              </div>

              <!-- 5. Tags Field (Interaktif) -->
              <div class="flex items-center justify-between gap-2 sm:col-span-2 pt-1 border-t border-border/20">
                <span class="text-muted-foreground flex items-center gap-2 w-28 shrink-0 font-medium">
                  <TagIcon class="w-4 h-4 text-muted-foreground" />
                  Tags
                </span>
                <div class="flex flex-wrap items-center gap-1.5 flex-1">
                  <span
                    v-for="tag in task.tags"
                    :key="tag"
                    class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted text-[11px] font-medium text-foreground border border-border/30 group"
                  >
                    <span>#{{ tag }}</span>
                    <button
                      type="button"
                      class="text-muted-foreground hover:text-destructive transition-colors ml-0.5 opacity-60 group-hover:opacity-100"
                      @click="handleRemoveTag(tag)"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </span>

                  <!-- Inline Add Tag -->
                  <div v-if="isAddingTag" class="flex items-center gap-1">
                    <input
                      v-model="newTagInput"
                      type="text"
                      placeholder="Nama tag..."
                      class="text-xs bg-background border border-primary/50 rounded-lg px-2 py-0.5 focus:outline-none w-24"
                      @keydown.enter="handleAddTag"
                      @keydown.esc="isAddingTag = false"
                    />
                    <button
                      type="button"
                      class="p-1 rounded text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      @click="handleAddTag"
                    >
                      <Check class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      class="p-1 rounded text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                      @click="isAddingTag = false"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    v-else
                    type="button"
                    class="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary px-2 py-0.5 rounded-lg border border-dashed border-border/60 hover:border-primary transition-colors"
                    @click="isAddingTag = true"
                  >
                    <Plus class="w-3 h-3" />
                    <span>Tag</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Description Section -->
            <div class="space-y-2">
              <h4 class="text-xs font-semibold text-muted-foreground">
                Deskripsi Tugas
              </h4>
              <div class="p-3.5 rounded-2xl bg-muted/10 border border-border/20 text-xs text-foreground leading-relaxed whitespace-pre-line min-h-[70px]">
                {{ task.description || 'Belum ada deskripsi detail untuk tugas ini.' }}
              </div>
            </div>

            <!-- Checklist / Subtasks Section -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <CheckSquare class="w-4 h-4 text-muted-foreground" />
                  Checklist ({{ completedChecklistCount }}/{{ task.checklist.length }})
                </h4>
                <span class="text-[11px] text-muted-foreground">
                  {{ task.checklist.length > 0 ? Math.round((completedChecklistCount / task.checklist.length) * 100) : 0 }}% Selesai
                </span>
              </div>

              <!-- Checklist Items -->
              <div class="space-y-1.5">
                <div
                  v-for="item in task.checklist"
                  :key="item.id"
                  class="flex items-center gap-2.5 rounded-xl border border-border/20 px-3 py-2 text-xs text-foreground cursor-pointer hover:bg-muted/30 transition-colors group select-none"
                  @click="handleChecklistClick(item.id)"
                >
                  <Checkbox
                    :checked="item.isCompleted"
                    class="h-4 w-4 rounded-md shrink-0 pointer-events-none"
                  />
                  <span
                    class="flex-1 transition-colors"
                    :class="{ 'line-through text-muted-foreground': item.isCompleted }"
                  >
                    {{ item.title }}
                  </span>
                </div>

                <!-- Add Subtask Input -->
                <div class="flex items-center gap-2 pt-1">
                  <input
                    v-model="newChecklistTitle"
                    type="text"
                    placeholder="Tambah subtask baru..."
                    class="flex-1 text-xs rounded-xl border border-border/40 bg-background px-3 py-1.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                    @keydown.enter="handleAddChecklistItem"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    class="h-8 text-xs shrink-0"
                    :disabled="!newChecklistTitle.trim()"
                    @click="handleAddChecklistItem"
                  >
                    <Plus class="w-3.5 h-3.5 mr-1" />
                    Tambah
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Comments & Activity Feed (ClickUp style sidebar) -->
          <div class="border-t lg:border-t-0 lg:border-l border-border/20 flex flex-col bg-muted/10 min-h-[360px] lg:min-h-0 overflow-hidden">
            <!-- Feed Header Tabs -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-background/50">
              <span class="text-xs font-semibold text-foreground">Aktivitas & Diskusi</span>
              <span class="text-[11px] text-muted-foreground">{{ comments.length }} komentar</span>
            </div>

            <!-- Activity / Comments List (Murni tanpa komentar mock hardcode) -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <!-- Audit Log Entry -->
              <div class="text-[11px] text-muted-foreground text-center py-1 border-b border-border/20">
                Tugas dibuat pada {{ task.createdAt }}
              </div>

              <!-- Loading Comments State -->
              <div v-if="isLoadingComments" class="py-6 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span class="text-[11px]">Memuat diskusi tim...</span>
              </div>

              <!-- Comment Items -->
              <template v-else-if="comments.length > 0">
                <div
                  v-for="cmt in comments"
                  :key="cmt.id"
                  class="flex flex-col gap-1 p-3 rounded-2xl bg-card border border-border/30 text-xs shadow-none group/cmt"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5">
                      <img
                        v-if="cmt.avatar"
                        :src="cmt.avatar"
                        class="w-4 h-4 rounded-full object-cover"
                      />
                      <div
                        v-else
                        class="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold"
                      >
                        {{ cmt.author.charAt(0) }}
                      </div>
                      <span class="font-semibold text-foreground">{{ cmt.author }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="text-[10px] text-muted-foreground">{{ cmt.time }}</span>
                      <!-- Tombol Hapus Komentar jika pemilik atau admin -->
                      <button
                        v-if="cmt.userId === user?.id || (user?.role && String(user.role).includes('ADMIN'))"
                        type="button"
                        class="opacity-0 group-hover/cmt:opacity-100 p-0.5 text-muted-foreground hover:text-rose-500 transition-opacity cursor-pointer"
                        title="Hapus komentar"
                        @click="handleDeleteComment(cmt.id)"
                      >
                        <Trash2 class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p class="text-muted-foreground leading-relaxed mt-0.5 break-words">
                    {{ cmt.text }}
                  </p>
                </div>
              </template>

              <!-- Clean Empty State (Jika belum ada komentar) -->
              <div
                v-else
                class="flex flex-col items-center justify-center text-center py-12 px-4 space-y-2"
              >
                <div class="w-9 h-9 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                  <MessageSquare class="w-4 h-4" />
                </div>
                <p class="text-xs font-semibold text-foreground">Belum ada diskusi</p>
                <p class="text-[11px] text-muted-foreground max-w-[200px]">
                  Tulis catatan atau update tugas di bawah untuk berdiskusi dengan tim secara real-time.
                </p>
              </div>
            </div>

            <!-- Comment Input Box at Bottom -->
            <div class="p-3 border-t border-border/20 bg-background/80 flex flex-col gap-2">
              <textarea
                v-model="newComment"
                rows="2"
                placeholder="Tulis komentar atau update tugas..."
                class="w-full text-xs rounded-xl border border-border/40 bg-background p-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                :disabled="isSendingComment"
                @keydown.enter.ctrl.prevent="handleSendComment"
              ></textarea>
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-muted-foreground">Tekan Ctrl+Enter untuk kirim</span>
                <Button
                  variant="primary"
                  size="sm"
                  class="h-7 text-xs px-2.5"
                  :disabled="!newComment.trim() || isSendingComment"
                  @click="handleSendComment"
                >
                  <Send class="w-3 h-3 mr-1" />
                  <span>{{ isSendingComment ? 'Mengirim...' : 'Kirim' }}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
