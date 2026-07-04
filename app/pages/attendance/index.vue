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
    <div class="grid gap-6 md:grid-cols-4">
      <Card v-for="(val, key) in summaryItems" :key="key" class="border border-border bg-card overflow-hidden group rounded-3xl transition-all duration-300 hover:bg-accent/50">
        <CardContent class="p-6 flex items-center gap-4">
          <div :class="[val.color, 'h-11 w-11 rounded-2xl flex items-center justify-center transition-all']">
             <component :is="val.icon" class="h-5 w-5" />
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">{{ val.label }}</p>
            <p class="text-2xl font-semibold text-foreground">{{ val.count }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

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
    <Card class="border border-border bg-card overflow-hidden rounded-3xl">

      
      <div class="relative overflow-x-auto">
        <Table>
          <TableBody>
            <template v-for="(group, key) in groupedAttendance" :key="key">
              <TableRow class="bg-muted/30 border-y border-border" :class="{ 'cursor-pointer hover:bg-accent': canViewAll }" @click="canViewAll && toggleGroup(key as string)">
                <TableCell colspan="6" class="py-3">
                  <div class="flex items-center gap-3">
                    <ChevronRight v-if="canViewAll" :class="{'rotate-90': expandedGroups[key as string]}" class="h-4 w-4 text-slate-400 transition-transform" />
                    <Avatar class="h-9 w-9 border-2 border-white">
                      <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${(key as string).split(' - ')[1] || 'Unknown'}`" />
                      <AvatarFallback>{{ (key as string).split(' - ')[1]?.charAt(0) || 'U' }}</AvatarFallback>
                    </Avatar>
                    <div class="flex flex-col">
                      <span class="font-semibold text-foreground leading-tight">{{ (key as string).split(' - ')[1] || 'Unknown' }}</span>
                      <span class="text-xs text-muted-foreground">NPK: {{ (key as string).split(' - ')[0] || '-' }}</span>
                    </div>
                    <Badge variant="outline" class="ml-auto bg-background shadow-sm border-border text-muted-foreground">{{ group.length }} Riwayat</Badge>
                  </div>
                </TableCell>
              </TableRow>

              <template v-if="!canViewAll || expandedGroups[key as string]">
                <TableRow class="hover:bg-transparent border-b border-border bg-transparent">
                  <TableCell colspan="6" class="p-0">
                    <div class="px-8 py-6">
                      <Table class="bg-background rounded-2xl overflow-hidden border border-border shadow-sm">
                        <TableHeader>
                          <TableRow class="bg-muted/50 hover:bg-muted/50">
                            <TableHead class="font-semibold">Tanggal</TableHead>
                            <TableHead class="font-semibold">Jam Masuk</TableHead>
                            <TableHead class="font-semibold">Jam Keluar</TableHead>
                            <TableHead class="font-semibold">Status</TableHead>
                            <TableHead class="font-semibold">Keterangan</TableHead>
                            <TableHead class="text-right font-semibold">{{ isAdmin ? 'Aksi' : '' }}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <template v-for="record in group" :key="record.id">
                            <TableRow class="hover:bg-accent/50 transition-colors border-border">
                              <TableCell>
                                <div class="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                  <CalendarIcon class="h-3.5 w-3.5 text-slate-400" />
                                  {{ record.date }}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div class="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                                  <Clock class="h-3.5 w-3.5 text-kv-primary" />
                                  {{ record.checkIn || "--:--" }}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div class="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                                  <LogOutIcon class="h-3.5 w-3.5 text-slate-400" />
                                  {{ record.checkOut || "--:--" }}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="secondary"
                                  class="text-sm font-semibold px-2.5 py-0.5 rounded-3xl border-none"
                                  :class="{
                                    'bg-emerald-500/10 text-emerald-600': record.status === 'present',
                                    'bg-amber-500/10 text-amber-600': record.status === 'permission',
                                    'bg-blue-500/10 text-blue-600': record.status === 'sick',
                                    'bg-rose-500/10 text-rose-600': record.status === 'absent'
                                  }"
                                >
                                  {{ getStatusLabel(record.status) }}
                                </Badge>
                              </TableCell>
                              <TableCell class="text-sm text-slate-400 max-w-[150px] truncate">
                                {{ record.notes || record.logbook?.activity || "-" }}
                              </TableCell>
                              <TableCell class="text-right">
                                <div class="flex items-center justify-end gap-1">
                                  <Button v-if="record.logbook" variant="ghost" size="sm" class="h-8 gap-1 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" @click="toggleLogbook(record.id)">
                                    <FileText class="h-4 w-4" />
                                    <span class="hidden sm:inline">{{ expandedLogbooks[record.id] ? 'Tutup' : 'Lihat' }} Logbook</span>
                                    <ChevronRight class="h-4 w-4 transition-transform duration-200" :class="{'rotate-90': expandedLogbooks[record.id]}" />
                                  </Button>
                                  <AlertDialog v-if="isAdmin">
                                    <AlertDialogTrigger as-child>
                                      <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 class="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent class="pointer-events-auto">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus Data Absensi?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Data absensi milik {{ record.employeeName }} akan dihapus permanen. Aksi ini tidak dapat dibatalkan.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel as-child>
                                          <Button variant="outline">Batal</Button>
                                        </AlertDialogCancel>
                                        <AlertDialogAction as-child>
                                          <Button @click="deleteRecord(record.id)" class="bg-rose-500 text-white hover:bg-rose-600">Hapus</Button>
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>

                            <!-- Logbook Row -->
                            <TableRow v-if="record.logbook && expandedLogbooks[record.id]" class="bg-muted/10 border-b border-border">
                              <TableCell colspan="6" class="p-0">
                                <div class="px-6 py-4 flex flex-col gap-3">
                                  <div class="flex items-center justify-between">
                                    <h4 class="text-sm font-semibold flex items-center gap-2">
                                      <FileText class="w-4 h-4 text-blue-500" />
                                      Logbook Harian
                                    </h4>
                                    <div v-if="isAdmin" class="flex gap-2">
                                      <Button variant="ghost" size="sm" class="h-8 text-xs gap-1.5" @click="openEditDialog(record.logbook)">
                                        <Pencil class="w-3.5 h-3.5" /> Edit Logbook
                                      </Button>
                                      <Button variant="ghost" size="sm" class="h-8 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" @click="confirmDeleteLogbook(record.logbook.id)">
                                        <Trash2 class="w-3.5 h-3.5" /> Hapus
                                      </Button>
                                    </div>
                                  </div>
                                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="space-y-1 bg-background p-3 rounded-xl border border-border">
                                      <span class="text-xs font-medium text-muted-foreground">Aktivitas</span>
                                      <p class="text-sm">{{ record.logbook.activity }}</p>
                                    </div>
                                    <div class="space-y-1 bg-background p-3 rounded-xl border border-border">
                                      <span class="text-xs font-medium text-muted-foreground">Kendala</span>
                                      <p class="text-sm">{{ record.logbook.obstacle || 'Tidak Ada' }}</p>
                                    </div>
                                  </div>
                                  <div class="bg-background p-3 rounded-xl border border-border flex items-center justify-between">
                                    <span class="text-xs font-medium text-muted-foreground">Link Bukti Google Drive</span>
                                    <a v-if="record.logbook.documentLink" :href="record.logbook.documentLink" target="_blank" class="text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1.5 text-sm font-medium transition-colors">
                                      <LinkIcon class="w-3.5 h-3.5" /> Buka Link
                                    </a>
                                    <span v-else class="text-sm text-muted-foreground italic">Tidak ada</span>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </template>
                        </TableBody>
                      </Table>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
            </template>

            <TableRow v-if="Object.keys(groupedAttendance).length === 0 && !loading">
              <TableCell colspan="6" class="h-64 text-center">
                <div class="flex flex-col items-center justify-center text-slate-300">
                  <ClipboardList class="h-12 w-12 mb-3 opacity-20" />
                  <p class="text-sm font-medium">Data absensi tidak ditemukan</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>

    <!-- Edit Logbook Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-[500px] border-border rounded-3xl overflow-hidden p-0">
        <DialogHeader class="p-6 pb-0">
          <DialogTitle class="text-xl">Edit Logbook Harian</DialogTitle>
        </DialogHeader>
        <div class="px-6 py-4 grid gap-4">
          <div class="space-y-2">
            <Label for="deskripsi">Aktivitas</Label>
            <Textarea id="deskripsi" v-model="editingData.deskripsi" placeholder="Masukkan aktivitas harian" class="min-h-[100px] resize-none" />
          </div>
          <div class="space-y-2">
            <Label for="kendala">Kendala</Label>
            <Textarea id="kendala" v-model="editingData.kendala" placeholder="Tidak Ada" class="min-h-[100px] resize-none" />
          </div>
          <div class="space-y-2">
            <Label for="documentLink">Link Bukti Google Drive</Label>
            <Input id="documentLink" type="url" v-model="editingData.documentLink" placeholder="https://drive.google.com/..." class="bg-background border-border" />
          </div>
        </div>
        <DialogFooter class="p-6 pt-2 bg-muted/30">
          <Button variant="outline" @click="showEditDialog = false">Batal</Button>
          <Button @click="handleSave">Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { 
  Download, 
  Search, 
  Clock, 
  LogOut as LogOutIcon, 
  CheckCircle2, 
  UserMinus, 
  AlertCircle, 
  XCircle,
  ClipboardList,
  Trash2,
  ChevronRight,
  Calendar as CalendarIcon,
  FileText,
  Link as LinkIcon,
  Pencil
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
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '~/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const {
  selectedDate,
  searchQuery,
  filterStatus,
  summary,
  filteredAttendance,
  groupedAttendance,
  expandedGroups,
  toggleGroup,
  expandedLogbooks,
  toggleLogbook,
  fetchAttendance,
  getStatusLabel,
  exportAttendance,
  loading,
  deleteRecord,
  updateLogbook,
  deleteLogbook,
  isAdmin,
  canViewAll
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

const handleSave = () => {
  if (!editingData.value.id || !editingData.value.deskripsi.trim()) return
  
  updateLogbook(editingData.value.id, {
    activity: editingData.value.deskripsi,
    obstacle: editingData.value.kendala,
    documentLink: editingData.value.documentLink
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

const summaryItems = computed(() => ({
  present: { 
    label: 'Hadir', 
    count: summary.value.present, 
    icon: CheckCircle2, 
    color: 'bg-kv-primary/10 text-kv-primary'
  },
  permission: { 
    label: 'Izin', 
    count: summary.value.permission, 
    icon: AlertCircle, 
    color: 'bg-amber-500/10 text-amber-600'
  },
  sick: { 
    label: 'Sakit', 
    count: summary.value.sick, 
    icon: UserMinus, 
    color: 'bg-blue-500/10 text-blue-600'
  },
  absent: { 
    label: 'Alfa', 
    count: summary.value.absent, 
    icon: XCircle, 
    color: 'bg-muted text-muted-foreground'
  }
}))

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'present': return 'default'
    case 'permission': return 'secondary'
    case 'sick': return 'outline'
    case 'absent': return 'destructive'
    default: return 'outline'
  }
}

onMounted(() => {
  fetchAttendance();
});
</script>
