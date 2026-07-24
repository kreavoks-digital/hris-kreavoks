<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-kv-black dark:text-slate-50">
          {{ canViewAll ? 'Employee Attendance' : 'My Attendance' }}
        </h1>
        <p class="text-slate-400 mt-1 text-sm">
          {{ canViewAll ? 'Monitor daily attendance and logs of all employees.' : 'Monitor your daily attendance.' }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              :class="cn(
                'w-[240px] justify-start text-left font-normal bg-background border-border rounded-2xl hover:bg-accent',
                !selectedDate && 'text-muted-foreground'
              )"
            >
              <CalendarIcon class="mr-2 h-4 w-4 text-slate-500" />
              {{ selectedDate ? format(new Date(selectedDate), 'dd MMMM yyyy', { locale: idLocale }) : 'Pilih Tanggal' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0 border-border rounded-2xl shadow-sm" align="end">
            <Calendar v-model="dateValue" initial-focus />
          </PopoverContent>
        </Popover>
        <Button v-if="canViewAll" variant="outline" class="gap-2 border-border text-foreground hover:bg-accent" @click="exportAttendance">
          <Download class="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>

    <!-- Summary Grid -->
    <AttendanceSummary :loading="loading" :summary="summary" />

    <!-- Filters Section -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1" v-if="canViewAll">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input v-model="searchQuery" placeholder="Cari nama karyawan..." class="pl-11 bg-background border-border shadow-sm shadow-slate-100/50 dark:shadow-none" />
      </div>
      <div v-else class="flex-1"></div>
      <div class="w-full sm:w-64">
        <Select v-model="filterStatus">
          <SelectTrigger class="bg-background rounded-3xl h-12 border-border px-5 shadow-sm shadow-slate-100/50 dark:shadow-none">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent class="rounded-2xl border-border bg-popover">
            <SelectItem value="none">Semua Status</SelectItem>
            <SelectItem value="present">Hadir</SelectItem>
            <SelectItem value="permission">Izin</SelectItem>
            <SelectItem value="sick">Sakit</SelectItem>
            <SelectItem value="absent">Alfa</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Table Card -->
    <AttendanceTable
      :loading="loading"
      :grouped-attendance="groupedAttendance"
      :expanded-groups="expandedGroups"
      :expanded-logbooks="expandedLogbooks"
      :can-view-all="canViewAll"
      :can-manage-attendance="canManageAttendance"
      :get-status-label="getStatusLabel"
      @toggle-group="toggleGroup"
      @toggle-logbook="toggleLogbook"
      @forgive-attendance="forgiveAttendance"
      @delete-record="deleteRecord"
      @open-edit-dialog="openEditDialog"
      @confirm-delete-logbook="confirmDeleteLogbook"
    />

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-1">
      <div class="flex items-center text-sm text-muted-foreground">
        <p>
          Menampilkan
          <span class="font-medium text-foreground">{{ Math.min((page - 1) * limit + 1, totalItems) }}</span>
          sampai
          <span class="font-medium text-foreground">{{ Math.min(page * limit, totalItems) }}</span>
          dari
          <span class="font-medium text-foreground">{{ totalItems }}</span>
          data
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Pagination">
          <Button
            variant="outline"
            size="icon"
            :disabled="page === 1"
            @click="page--"
            class="h-9 w-9 rounded-xl border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          
          <template v-for="p in totalPages" :key="p">
            <Button
              v-if="p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)"
              variant="outline"
              size="sm"
              @click="page = p"
              class="h-9 w-9 rounded-xl border-border"
              :class="page === p ? 'bg-kv-primary text-white border-transparent hover:bg-kv-primary/95' : 'bg-background hover:bg-accent text-muted-foreground hover:text-foreground'"
            >
              {{ p }}
            </Button>
            <span 
              v-else-if="(p === 2 && page > 4) || (p === totalPages - 1 && page < totalPages - 3)" 
              class="inline-flex items-center px-2 text-sm font-semibold text-muted-foreground"
            >
              ...
            </span>
          </template>

          <Button
            variant="outline"
            size="icon"
            :disabled="page === totalPages"
            @click="page++"
            class="h-9 w-9 rounded-xl border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </div>

    <!-- Edit Logbook Dialog -->
    <EditLogbookDialog
      v-model:open="showEditDialog"
      :data="editingData"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { 
  Download, 
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { parseDate } from '@internationalized/date'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Calendar } from '~/components/ui/calendar'
import { useAttendance } from './hooks/useAttendance'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import EditLogbookDialog from './components/EditLogbookDialog.vue'
import AttendanceSummary from './components/AttendanceSummary.vue'
import AttendanceTable from './components/AttendanceTable.vue'

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const {
  selectedDate,
  searchQuery,
  filterStatus,
  summary,
  groupedAttendance,
  expandedGroups,
  toggleGroup,
  expandedLogbooks,
  toggleLogbook,
  fetchAttendance,
  getStatusLabel,
  exportAttendance,
  loading,
  page,
  limit,
  totalItems,
  totalPages,
  deleteRecord,
  forgiveAttendance,
  updateLogbook,
  deleteLogbook,
  canViewAll,
  canManageAttendance
} = useAttendance()

const showEditDialog = ref(false)
const editingData = ref({
  id: '',
  deskripsi: '',
  kendala: '',
  documentLink: ''
})

const openEditDialog = (logbook: any) => {
  editingData.value = {
    id: logbook.id,
    deskripsi: logbook.activity,
    kendala: logbook.obstacle,
    documentLink: logbook.documentLink || ''
  }
  showEditDialog.value = true
}

const handleSave = (updated: { id: string; activity: string; obstacle: string; documentLink: string }) => {
  updateLogbook(updated.id, {
    activity: updated.activity,
    obstacle: updated.obstacle,
    documentLink: updated.documentLink
  })
  showEditDialog.value = false
}

const confirmDeleteLogbook = async (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus logbook ini?')) {
    await deleteLogbook(id)
  }
}

const dateValue = computed({
  get: () => selectedDate.value ? parseDate(selectedDate.value) : undefined,
  set: (val) => {
    selectedDate.value = val ? val.toString() : ''
  }
})

onMounted(() => {
  fetchAttendance();
});
</script>
