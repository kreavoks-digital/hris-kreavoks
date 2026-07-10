<template>
  <Card class="border border-border bg-card overflow-hidden rounded-3xl">
    <div class="relative overflow-x-auto">
      <Table>
        <TableBody>
          <TableSkeleton v-if="loading" :rows="3" :columns="6" />
          <template v-else v-for="(group, key) in groupedAttendance" :key="key">
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
                          <TableHead class="text-right font-semibold">{{ canManageAttendance ? 'Aksi' : '' }}</TableHead>
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
                                <Button v-if="canManageAttendance && (!record.checkOut || record.checkOut === '--:--')" variant="ghost" size="sm" class="h-8 gap-1 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" @click="forgiveAttendance(record.id)">
                                  <CheckCircle2 class="h-4 w-4" />
                                  <span class="hidden sm:inline">Koreksi</span>
                                </Button>
                                <Button v-if="record.logbook" variant="ghost" size="sm" class="h-8 gap-1 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" @click="toggleLogbook(record.id)">
                                  <FileText class="h-4 w-4" />
                                  <span class="hidden sm:inline">{{ expandedLogbooks[record.id] ? 'Tutup' : 'Lihat' }} Logbook</span>
                                  <ChevronRight class="h-4 w-4 transition-transform duration-200" :class="{'rotate-90': expandedLogbooks[record.id]}" />
                                </Button>
                                <AlertDialog v-if="canManageAttendance">
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
                                  <div v-if="canManageAttendance" class="flex gap-2">
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
  <EditLogbookDialog
    v-model:open="showEditDialog"
    :data="editingData"
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { 
  Clock, 
  LogOut as LogOutIcon, 
  CheckCircle2, 
  ClipboardList,
  Trash2,
  ChevronRight,
  Calendar as CalendarIcon,
  FileText,
  Link as LinkIcon,
  Pencil
} from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import TableSkeleton from '~/components/ui/skeleton/TableSkeleton.vue'
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '~/components/ui/table'
import EditLogbookDialog from './EditLogbookDialog.vue'

const {
  loading,
  groupedAttendance,
  expandedGroups,
  expandedLogbooks,
  canViewAll,
  canManageAttendance,
  getStatusLabel,
  toggleGroup,
  toggleLogbook,
  forgiveAttendance,
  deleteRecord,
  deleteLogbook,
  updateLogbook
} = inject('attendanceContext') as any

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
</script>
