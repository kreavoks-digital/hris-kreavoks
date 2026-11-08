<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@kreavoks/kreaui'
import {
  Plus,
  Search,
  Filter,
  FolderKanban,
  Kanban,
  ChartNoAxesGantt,
  ListTodo,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers
} from 'lucide-vue-next'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { useKanban } from './hooks/useKanban'
import KanbanColumn from './components/KanbanColumn.vue'
import KanbanListView from './components/KanbanListView.vue'
import KanbanCalendarView from './components/KanbanCalendarView.vue'
import TaskDetailModal from './components/TaskDetailModal.vue'
import CreateTaskModal from './components/CreateTaskModal.vue'
import ProjectNavigatorSidebar from './components/ProjectNavigatorSidebar.vue'
import TimelineGanttGrid from '~/pages/timeline/components/TimelineGanttGrid.vue'
import CreateProjectModal from '~/pages/projects/components/CreateProjectModal.vue'
import { useProjects } from '~/pages/projects/hooks/useProjects'
import type { TaskStatus, KanbanTask } from './types'
import type { TimelineItem, TimelineItemStatus, TimelineOwner } from '~/pages/timeline/types'

definePageMeta({
  middleware: 'auth',
  fullWidth: true
})

const route = useRoute()
const router = useRouter()

const {
  tasks,
  columns,
  members,
  projects,
  selectedProjectId,
  selectedProject,
  isLoadingKanban,
  setProjectId,
  colorPresets,
  searchQuery,
  selectedPriority,
  activeTask,
  filteredTasks,
  isCreateModalOpen,
  isDetailModalOpen,
  getTasksByStatus,
  moveTask,
  toggleChecklist,
  toggleTaskComplete,
  toggleTaskFavorite,
  renameTask,
  addSubtask,
  updateTaskAssignees,
  updateTaskPriority,
  updateTaskDates,
  updateTaskTags,
  openDetailModal,
  closeDetailModal,
  addTask,
  deleteTask,
  renameColumn,
  updateColumnColor,
  clearColumnTasks,
  addStatusColumn
} = useKanban()

const { createProject } = useProjects()

const isSidebarCollapsed = ref(false)

// Mobile responsiveness: Otomatis collapse sidebar pada layar kecil/mobile
if (process.client && typeof window !== 'undefined') {
  if (window.innerWidth < 768) {
    isSidebarCollapsed.value = true
  }
}
const isCreateProjectModalOpen = ref(false)
const createStatusTarget = ref<TaskStatus>('TODO')

// Unified View tabs (ala ClickUp): Board, Gantt Timeline, Calendar, List
type ViewTab = 'board' | 'gantt' | 'calendar' | 'list'

const getInitialView = (): ViewTab => {
  const v = route?.query?.view
  if (v === 'gantt' || v === 'timeline' || v === 'g') return 'gantt'
  if (v === 'calendar' || v === 'c') return 'calendar'
  if (v === 'list' || v === 'l') return 'list'
  return 'board'
}

const activeViewTab = ref<ViewTab>(getInitialView())

// Sinkronisasi tab saat param query di URL berubah
watch(
  () => route?.query?.view,
  (newV) => {
    if (newV === 'gantt' || newV === 'timeline' || newV === 'g') {
      activeViewTab.value = 'gantt'
    } else if (newV === 'calendar' || newV === 'c') {
      activeViewTab.value = 'calendar'
    } else if (newV === 'list' || newV === 'l') {
      activeViewTab.value = 'list'
    } else {
      activeViewTab.value = 'board'
    }
  }
)

function handleViewTab(tab: ViewTab) {
  activeViewTab.value = tab
  const query: any = { ...route.query }
  if (tab === 'board') {
    delete query.view
  } else {
    query.view = tab
  }
  router.replace({ query })
}

function handleCreateTask(status: TaskStatus = 'TODO') {
  if (!selectedProject.value) {
    isCreateProjectModalOpen.value = true
    return
  }
  createStatusTarget.value = status
  isCreateModalOpen.value = true
}

// ─── GANTT TIMELINE INTEGRATION (Zero-Latency Reaktif) ────────────────────────
const currentMonthDate = ref(new Date('2026-11-01T00:00:00'))

const currentMonthLabel = computed(() => {
  return currentMonthDate.value.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
})

const totalDays = computed(() => {
  const y = currentMonthDate.value.getFullYear()
  const m = currentMonthDate.value.getMonth()
  return new Date(y, m + 1, 0).getDate()
})

const rangeStart = computed(() => {
  const y = currentMonthDate.value.getFullYear()
  const m = currentMonthDate.value.getMonth()
  return new Date(y, m, 1, 0, 0, 0)
})

const daysHeader = computed(() => {
  const days = []
  const start = rangeStart.value
  const count = totalDays.value
  for (let i = 0; i < count; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push({
      dayNumber: d.getDate(),
      dayName: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()],
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      dateStr: d.toISOString().slice(0, 10)
    })
  }
  return days
})

function prevMonth() {
  const d = new Date(currentMonthDate.value)
  d.setMonth(d.getMonth() - 1)
  currentMonthDate.value = d
}

function nextMonth() {
  const d = new Date(currentMonthDate.value)
  d.setMonth(d.getMonth() + 1)
  currentMonthDate.value = d
}

// Transformasi filteredTasks menjadi format Gantt Timeline secara reaktif
const timelineItems = computed<TimelineItem[]>(() => {
  return filteredTasks.value.map(t => {
    const startDate = t.startDate || t.createdAt || '2026-11-01'
    const endDate = t.dueDate || startDate

    let progress = 0
    if (t.status === 'DONE') {
      progress = 100
    } else if (Array.isArray(t.checklist) && t.checklist.length > 0) {
      const completed = t.checklist.filter(c => c.isCompleted).length
      progress = Math.round((completed / t.checklist.length) * 100)
    } else if (t.status === 'IN_PROGRESS') {
      progress = 40
    }

    let status: TimelineItemStatus = 'ON_TRACK'
    if (t.status === 'DONE') {
      status = 'COMPLETED'
    } else if (t.priority === 'URGENT' || t.priority === 'HIGH') {
      status = 'AT_RISK'
    }

    const owner: TimelineOwner = (t.assignees && t.assignees.length > 0)
      ? {
          id: t.assignees[0].id,
          name: t.assignees[0].name,
          avatar: t.assignees[0].avatar
        }
      : {
          id: 'me',
          name: 'Staff',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User`
        }

    const assignees: TimelineOwner[] = (t.assignees && t.assignees.length > 0)
      ? t.assignees.map(a => ({ id: a.id, name: a.name, avatar: a.avatar }))
      : []

    return {
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      type: (t.checklist && t.checklist.length > 2) ? 'PHASE' : 'TASK',
      startDate,
      endDate,
      progress,
      status,
      owner,
      assignees,
      tags: t.tags,
      priority: t.priority
    }
  })
})

function calculateBarPosition(startDateStr: string, endDateStr: string) {
  const itemStart = new Date(`${startDateStr}T00:00:00`).getTime()
  const itemEnd = new Date(`${endDateStr}T23:59:59`).getTime()
  const timelineStart = rangeStart.value.getTime()
  const msPerDay = 1000 * 60 * 60 * 24

  const startOffsetDays = Math.max(0, (itemStart - timelineStart) / msPerDay)
  const durationDays = Math.max(1, (itemEnd - itemStart) / msPerDay)

  const leftPercent = Math.min(100, (startOffsetDays / totalDays.value) * 100)
  const widthPercent = Math.min(100 - leftPercent, (durationDays / totalDays.value) * 100)

  return {
    left: `${leftPercent}%`,
    width: `${Math.max(widthPercent, 3)}%`
  }
}

function getStatusVariant(status: TimelineItemStatus): 'success' | 'warning' | 'error' | 'primary' | 'secondary' {
  switch (status) {
    case 'COMPLETED':
      return 'primary'
    case 'ON_TRACK':
      return 'success'
    case 'AT_RISK':
      return 'warning'
    case 'DELAYED':
      return 'error'
    default:
      return 'secondary'
  }
}

function handleTimelineItemClick(item: TimelineItem) {
  const target = tasks.value.find(t => t.id === item.id)
  if (target) {
    openDetailModal(target)
  }
}

function getStatusLabel(status: TimelineItemStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'Completed'
    case 'ON_TRACK':
      return 'On Track'
    case 'AT_RISK':
      return 'At Risk'
    case 'DELAYED':
      return 'Delayed'
    default:
      return status
  }
}
</script>

<template>
  <div class="flex gap-3 items-start min-h-[calc(100vh-110px)] w-full">
    <!-- Left Panel: Project Navigator Sidebar (Ala ClickUp Spaces) -->
    <ProjectNavigatorSidebar
      :projects="projects"
      :active-project-id="selectedProjectId"
      :is-collapsed="isSidebarCollapsed"
      :is-loading="isLoadingKanban"
      @select-project="setProjectId"
      @create-project="isCreateProjectModalOpen = true"
      @toggle-collapse="isSidebarCollapsed = !isSidebarCollapsed"
    />

    <!-- Right Panel: Main Unified Workspace (Ala ClickUp) -->
    <main class="flex-1 flex flex-col min-w-0 space-y-3">
      <!-- 1. Breadcrumb & View Tabs Header (Ala ClickUp) -->
      <div class="rounded-2xl border border-border/40 bg-card p-3 shadow-none space-y-2.5">
        <!-- Top Breadcrumb Row -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div class="flex items-center gap-2 text-xs min-w-0 flex-wrap">
            <span class="text-muted-foreground flex items-center gap-1.5 font-medium">
              <FolderKanban class="w-3.5 h-3.5 text-kv-primary" />
              <span>Workspace</span>
            </span>
            <ChevronRight class="w-3 h-3 text-muted-foreground/60" />
            <div class="flex items-center gap-2 min-w-0">
              <template v-if="isLoadingKanban && !selectedProject">
                <div class="w-2.5 h-2.5 rounded-full bg-muted animate-pulse" />
                <div class="h-4 w-36 bg-muted rounded-md animate-pulse" />
              </template>
              <template v-else>
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  :style="{ backgroundColor: selectedProject?.color || '#4082e6' }"
                />
                <span class="font-bold text-foreground truncate text-sm">
                  {{ selectedProject?.name || 'Pilih Proyek' }}
                </span>
              </template>
            </div>
          </div>

          <!-- Quick Action Button -->
          <div class="flex items-center gap-2">
            <Button
              v-if="!selectedProject"
              variant="primary"
              size="sm"
              @click="isCreateProjectModalOpen = true"
            >
              <Plus class="w-4 h-4 mr-1.5" />
              Buat Proyek
            </Button>
            <Button
              v-else
              variant="primary"
              size="sm"
              @click="handleCreateTask('TODO')"
            >
              <Plus class="w-4 h-4 mr-1.5" />
              Tambah Tugas
            </Button>
          </div>
        </div>

        <!-- ClickUp-Style View Switcher Tabs (Board, Gantt Timeline, List) -->
        <div class="flex items-center gap-1 pt-2 border-t border-border/30 text-xs">
          <!-- 1. Board View -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
            :class="activeViewTab === 'board' ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
            @click="handleViewTab('board')"
          >
            <Kanban class="w-3.5 h-3.5" />
            <span>Board</span>
          </button>

          <!-- 2. Gantt Timeline View -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
            :class="activeViewTab === 'gantt' ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
            @click="handleViewTab('gantt')"
          >
            <ChartNoAxesGantt class="w-3.5 h-3.5" />
            <span>Gantt Timeline</span>
          </button>

          <!-- 3. Calendar View (Reuse dari Calendar Module) -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
            :class="activeViewTab === 'calendar' ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
            @click="handleViewTab('calendar')"
          >
            <Calendar class="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>

          <!-- 4. List View -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
            :class="activeViewTab === 'list' ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
            @click="handleViewTab('list')"
          >
            <ListTodo class="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      <!-- 2. Toolbar: Filters & Search (Common across all views) -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 rounded-2xl border border-border/40 bg-card p-2.5 shadow-none">
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Cari tugas di proyek ini..."
            class="pl-9 h-9 text-xs rounded-xl border-border bg-background"
          />
        </div>

        <div class="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
          <!-- Priority Filter -->
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter class="w-3.5 h-3.5" />
            <span>Prioritas:</span>
          </div>

          <Select v-model="selectedPriority">
            <SelectTrigger class="w-[140px] h-9 text-xs rounded-xl border-border bg-background px-3">
              <SelectValue placeholder="Semua Prioritas" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl border-border bg-popover z-50 shadow-none">
              <SelectItem value="ALL">Semua Prioritas</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <!-- Month Navigator (Khusus View Gantt Timeline) -->
          <div
            v-if="activeViewTab === 'gantt'"
            class="flex items-center gap-1 border border-border/40 bg-muted/20 px-2 py-1 rounded-xl text-xs font-semibold text-foreground ml-1"
          >
            <button
              type="button"
              class="p-0.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
              @click="prevMonth"
            >
              <ChevronLeft class="w-3.5 h-3.5" />
            </button>

            <span class="px-1.5 text-center capitalize text-xs">
              {{ currentMonthLabel }}
            </span>

            <button
              type="button"
              class="p-0.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Bulan Berikutnya"
              @click="nextMonth"
            >
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- 3. DYNAMIC VIEWS CONTAINER (Tergantung Tab yang Dipilih) -->

      <!-- GUARD: Jika Belum Ada Proyek Sama Sekali atau Belum Ada yang Dipilih -->
      <div
        v-if="!isLoadingKanban && (projects.length === 0 || !selectedProject)"
        class="rounded-3xl border border-dashed border-border/70 bg-card p-8 sm:p-14 text-center flex flex-col items-center justify-center min-h-[460px] space-y-4"
      >
        <div class="h-16 w-16 rounded-3xl bg-kv-primary/10 text-kv-primary flex items-center justify-center shadow-xs">
          <FolderKanban class="h-8 w-8 text-kv-primary" />
        </div>

        <div class="max-w-md space-y-1.5">
          <h3 class="text-base font-bold text-foreground">
            {{ projects.length === 0 ? 'Belum Ada Proyek di Workspace' : 'Pilih atau Buat Proyek Terlebih Dahulu' }}
          </h3>
          <p class="text-xs text-muted-foreground leading-relaxed">
            {{ projects.length === 0
              ? 'Untuk mulai menambahkan tugas, mengelola kanban, dan memantau linimasa kerja tim, Anda harus membuat proyek terlebih dahulu.'
              : 'Silakan pilih salah satu proyek dari panel navigasi di sebelah kiri, atau buat proyek baru untuk mulai mengelola tugas.'
            }}
          </p>
        </div>

        <div class="flex items-center gap-2.5 pt-2 flex-wrap justify-center">
          <Button
            variant="primary"
            size="sm"
            class="h-9 px-4 rounded-xl text-xs font-semibold"
            @click="isCreateProjectModalOpen = true"
          >
            <Plus class="w-4 h-4 mr-1.5" />
            {{ projects.length === 0 ? 'Buat Proyek Pertama Anda' : 'Buat Proyek Baru' }}
          </Button>

          <Button
            v-if="projects.length > 0 && !selectedProject"
            variant="outline"
            size="sm"
            class="h-9 px-4 rounded-xl text-xs font-semibold"
            @click="setProjectId(projects[0].id)"
          >
            Pilih Proyek: {{ projects[0].name }}
          </Button>
        </div>
      </div>

      <!-- Jika Proyek Telah Dipilih: Render Tampilan Aktif -->
      <template v-else>
        <!-- VIEW A: BOARD VIEW (Kanban Columns) -->
        <div
          v-if="activeViewTab === 'board'"
          class="flex gap-3 overflow-x-auto pb-4 items-start flex-1 min-h-[480px]"
        >
          <KanbanColumn
            v-for="col in columns"
            :key="col.id"
            :status="col.id"
            :title="col.label"
            :color="col.color"
            :color-presets="colorPresets"
            :tasks="getTasksByStatus(col.id)"
            :project-id="selectedProjectId || undefined"
            :members="members"
            @task-click="openDetailModal"
            @task-move="moveTask"
            @create-task="handleCreateTask"
            @quick-create="addTask"
            @rename="renameColumn"
            @update-color="updateColumnColor"
            @clear-tasks="clearColumnTasks"
            @toggle-complete="toggleTaskComplete"
            @toggle-favorite="toggleTaskFavorite"
            @rename-task="renameTask"
            @add-subtask="addSubtask"
            @update-assignees="updateTaskAssignees"
            @update-priority="updateTaskPriority"
            @update-dates="updateTaskDates"
            @update-tags="updateTaskTags"
            @delete-task="deleteTask"
          />
        </div>

        <!-- VIEW B: GANTT TIMELINE VIEW -->
        <div v-else-if="activeViewTab === 'gantt'" class="flex-1 min-h-[480px]">
          <div
            v-if="timelineItems.length === 0"
            class="rounded-3xl border border-border/40 bg-card p-12 text-center flex flex-col items-center justify-center min-h-[360px]"
          >
            <div class="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
              <ChartNoAxesGantt class="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 class="text-base font-semibold text-foreground mb-1">
              Belum ada tugas terjadwal di proyek ini
            </h3>
            <p class="text-xs text-muted-foreground max-w-sm mb-4">
              Tambahkan tugas baru dan tentukan target deadline agar otomatis terpetakan di chart Gantt ini.
            </p>
            <Button
              variant="primary"
              size="sm"
              @click="handleCreateTask('TODO')"
            >
              <Plus class="w-3.5 h-3.5 mr-1.5" />
              Tambah Tugas Sekarang
            </Button>
          </div>

          <TimelineGanttGrid
            v-else
            :items="timelineItems"
            :days-header="daysHeader"
            :calculate-bar-position="calculateBarPosition"
            :get-status-variant="getStatusVariant"
            :get-status-label="getStatusLabel"
            @item-click="handleTimelineItemClick"
            @toggle-complete="toggleTaskComplete"
          />
        </div>

        <!-- VIEW C: CALENDAR VIEW (Monthly Calendar Grid Ala Calendar Module) -->
        <div v-else-if="activeViewTab === 'calendar'" class="flex-1 min-h-[480px]">
          <KanbanCalendarView
            :tasks="filteredTasks"
            :columns="columns"
            @task-click="openDetailModal"
            @create-task="handleCreateTask"
            @toggle-complete="toggleTaskComplete"
          />
        </div>

        <!-- VIEW D: LIST VIEW (ClickUp-Style Grouped List) -->
        <div v-else-if="activeViewTab === 'list'" class="flex-1 min-h-[480px]">
          <KanbanListView
            :columns="columns"
            :tasks="filteredTasks"
            :members="members"
            @task-click="openDetailModal"
            @create-task="handleCreateTask"
            @toggle-checklist="toggleChecklist"
            @toggle-complete="toggleTaskComplete"
            @rename-task="renameTask"
            @add-subtask="addSubtask"
          />
        </div>
      </template>
    </main>

    <!-- Modals -->
    <TaskDetailModal
      :task="activeTask"
      :is-open="isDetailModalOpen"
      :columns="columns"
      :members="members"
      @close="closeDetailModal"
      @toggle-checklist="toggleChecklist"
      @update-status="moveTask"
      @update-priority="updateTaskPriority"
      @update-assignees="updateTaskAssignees"
      @update-dates="updateTaskDates"
      @update-tags="updateTaskTags"
      @delete-task="deleteTask"
      @add-status="addStatusColumn"
    />

    <CreateTaskModal
      :is-open="isCreateModalOpen"
      :default-status="createStatusTarget"
      :project-id="selectedProjectId || undefined"
      :columns="columns"
      :members="members"
      @close="isCreateModalOpen = false"
      @submit="addTask"
      @add-status="addStatusColumn"
    />

    <CreateProjectModal
      v-model:open="isCreateProjectModalOpen"
      :members="members"
      @created="createProject"
    />
  </div>
</template>
