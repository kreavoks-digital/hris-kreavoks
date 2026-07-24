<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="w-[120px] whitespace-nowrap">NPK</TableHead>
        <TableHead>Karyawan</TableHead>
        <TableHead>Institusi</TableHead>
        <TableHead>Departemen</TableHead>
        <TableHead>Posisi</TableHead>
        <template v-if="activeTab === 'all'">
          <TableHead class="whitespace-nowrap">Masa Kerja</TableHead>
          <TableHead class="whitespace-nowrap w-[140px]">Sisa Hari Kerja</TableHead>
          <TableHead class="whitespace-nowrap">Status</TableHead>
        </template>
        <template v-else>
          <TableHead>No. Telepon</TableHead>
          <TableHead>Status</TableHead>
        </template>
        <TableHead class="text-right">Aksi</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableSkeleton v-if="loading" :rows="5" :columns="activeTab === 'all' ? 8 : 7" />
      <template v-else-if="employees.length > 0">
        <TableRow v-for="emp in employees" :key="emp.id" class="hover:bg-accent/50 transition-colors">
          <TableCell class="font-medium text-muted-foreground whitespace-nowrap">{{ emp.npk || '-' }}</TableCell>
          <TableCell>
            <div class="flex items-center gap-3">
              <Avatar class="h-9 w-9 border-2 border-card">
                <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`" />
                <AvatarFallback>{{ emp.name.charAt(0) }}</AvatarFallback>
              </Avatar>
              <div class="flex flex-col">
                <span class="font-medium text-foreground leading-tight">{{ emp.name }}</span>
                <span class="text-sm text-muted-foreground">{{ emp.email }}</span>
              </div>
            </div>
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ (emp as any).institution || '-' }}</TableCell>
          <TableCell>
            <Badge variant="outline" class="font-medium bg-accent text-accent-foreground border-border whitespace-nowrap">
              {{ emp.department }}
            </Badge>
          </TableCell>
          <TableCell class="text-foreground text-sm whitespace-nowrap">{{ emp.position }}</TableCell>

          <!-- All tab columns -->
          <template v-if="activeTab === 'all'">
            <TableCell>
              <div v-if="emp.startDate && !emp.startDate.startsWith('9999')" class="flex flex-col text-xs space-y-1">
                <span class="text-foreground whitespace-nowrap">{{ format(new Date(emp.startDate), 'dd MMM yyyy', { locale: idLocale }) }} -</span>
                <span class="text-foreground whitespace-nowrap" v-if="emp.endDate && !emp.endDate.startsWith('9999')">{{ format(new Date(emp.endDate), 'dd MMM yyyy', { locale: idLocale }) }}</span>
                <span class="text-muted-foreground italic whitespace-nowrap" v-else>Pilih Tanggal</span>
              </div>
              <span v-else class="text-sm text-muted-foreground italic">-</span>
            </TableCell>
            <TableCell>
              <div v-if="emp.endDate && !emp.endDate.startsWith('9999') && emp.startDate">
                <span class="font-medium text-sm" :class="getRemainingDaysClass(emp)">
                  {{ getRemainingDays(emp) }} Hari
                </span>
              </div>
              <span v-else class="text-sm text-muted-foreground italic">-</span>
            </TableCell>
          </template>

          <!-- Pending tab columns -->
          <template v-else>
            <TableCell class="text-sm text-muted-foreground">{{ emp.phone || '-' }}</TableCell>
          </template>

          <!-- Status -->
          <TableCell>
            <Badge
              class="px-3 py-1 rounded-3xl text-sm font-medium border-transparent"
              :class="{
                'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20': emp.status === 'ACTIVE',
                'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20': emp.status === 'TERMINATED',
                'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20': emp.status === 'SUSPENDED',
                'bg-slate-500/15 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20': emp.status === 'RESIGNED',
                'bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20': emp.status === 'GRADUATE',
              }"
            >
              {{
                emp.status === 'ACTIVE' ? 'Aktif' :
                emp.status === 'TERMINATED' ? 'Terminated' :
                emp.status === 'SUSPENDED' ? (activeTab === 'pending' ? 'Menunggu Verifikasi' : 'Suspended') :
                emp.status === 'RESIGNED' ? 'Resigned' :
                emp.status === 'GRADUATE' ? 'Lulus' : emp.status
              }}
            </Badge>
          </TableCell>

          <!-- Actions -->
          <TableCell class="text-right">
            <div class="flex justify-end gap-2">
              <!-- Verifikasi button (pending tab only) -->
              <Button
                v-if="activeTab === 'pending'"
                variant="outline"
                size="sm"
                @click="$emit('verify', emp)"
                :disabled="verifyingId === emp.id"
                class="h-8 gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:border-emerald-800"
              >
                <Loader2 v-if="verifyingId === emp.id" class="h-3.5 w-3.5 animate-spin" />
                <CheckCircle2 v-else class="h-3.5 w-3.5" />
                Verifikasi
              </Button>
              <!-- Tolak button (pending tab only) -->
              <Button
                v-if="activeTab === 'pending'"
                variant="ghost"
                size="icon"
                @click="$emit('delete', emp)"
                class="h-8 w-8 text-destructive hover:bg-destructive/10"
                title="Tolak & Hapus"
              >
                <X class="h-4 w-4" />
              </Button>
              <!-- Normal actions (all tab) -->
              <template v-else>
                <Button variant="ghost" size="icon" @click="$emit('edit', emp)" class="h-8 w-8 text-kv-primary hover:bg-kv-primary/10">
                  <Edit2 class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" @click="$emit('delete', emp)" class="h-8 w-8 text-destructive hover:bg-destructive/10">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </template>
            </div>
          </TableCell>
        </TableRow>
      </template>

      <!-- Empty Row Handling -->
      <TableRow v-else>
        <TableCell :colspan="activeTab === 'all' ? 9 : 8" class="h-64 text-center">
          <div class="flex flex-col items-center justify-center text-muted-foreground">
            <template v-if="activeTab === 'pending'">
              <CheckCircle2 class="h-12 w-12 mb-2 opacity-20 text-emerald-500" />
              <p class="font-medium">Tidak ada pendaftar yang menunggu verifikasi</p>
              <p class="text-sm mt-1">Semua akun sudah terverifikasi</p>
            </template>
            <template v-else>
              <Users class="h-12 w-12 mb-2 opacity-20" />
              <p>Tidak ada data karyawan ditemukan</p>
              <Button variant="link" @click="$emit('reset-filters')" class="mt-2">Hapus Filter</Button>
            </template>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '~/components/ui/table'
import TableSkeleton from '~/components/ui/skeleton/TableSkeleton.vue'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Edit2, Trash2, CheckCircle2, X, Loader2, Users } from 'lucide-vue-next'
import { format, differenceInBusinessDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const props = defineProps<{
  employees: any[]
  activeTab: 'all' | 'pending' | 'mentor'
  verifyingId: string | number | null
  loading: boolean
}>()

defineEmits<{
  (e: 'verify', emp: any): void
  (e: 'edit', emp: any): void
  (e: 'delete', emp: any): void
  (e: 'reset-filters'): void
}>()

const getRemainingDays = (emp: any) => {
  if (typeof emp.remainingDays === 'number') return emp.remainingDays
  if (!emp.startDate || !emp.endDate) return 0
  const totalBusinessDays = differenceInBusinessDays(new Date(emp.endDate), new Date(emp.startDate)) + 1
  const attendedDays = emp.presentCount || 0
  const remaining = totalBusinessDays - attendedDays
  return remaining > 0 ? remaining : 0
}

const getRemainingDaysClass = (emp: any) => {
  const days = getRemainingDays(emp)
  if (days <= 0) return 'text-rose-600 dark:text-rose-400'
  if (days <= 30) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}
</script>
