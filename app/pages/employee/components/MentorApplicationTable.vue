<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Nama Calon Mentor</TableHead>
        <TableHead>Keahlian</TableHead>
        <TableHead>Pengalaman</TableHead>
        <TableHead>Portofolio</TableHead>
        <TableHead>Kontak</TableHead>
        <TableHead>Status</TableHead>
        <TableHead class="text-right">Aksi</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableSkeleton v-if="loading" :rows="5" :columns="7" />
      <template v-else-if="applications.length > 0">
        <TableRow v-for="app in applications" :key="app.id" class="hover:bg-accent/50 transition-colors cursor-pointer group" @click="navigateTo(`/employee/mentor-application/${app.id}`)">
          <TableCell>
            <div class="flex flex-col">
              <span class="font-medium text-foreground leading-tight group-hover:underline group-hover:text-kv-primary transition-colors">{{ app.name }}</span>
              <span class="text-xs text-muted-foreground">{{ app.email }}</span>
            </div>
          </TableCell>
          <TableCell class="text-sm text-foreground font-medium max-w-[250px]">
            <div v-if="app.expertise" class="flex flex-wrap gap-1.5">
              <Badge 
                v-for="(skill, index) in parseExpertise(app.expertise)" 
                :key="index" 
                variant="secondary" 
                class="font-normal text-[11px] px-2 py-0.5 whitespace-nowrap bg-muted hover:bg-muted/80 text-foreground"
              >
                {{ skill }}
              </Badge>
            </div>
            <span v-else class="text-muted-foreground italic">-</span>
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ app.experience || '0' }} Tahun
          </TableCell>
          <TableCell>
            <a v-if="app.portfolioLink" :href="app.portfolioLink" target="_blank" class="text-xs text-kv-primary underline hover:text-kv-primary/80" @click.stop>
              Buka Portofolio
            </a>
            <span v-else class="text-xs text-muted-foreground italic">-</span>
          </TableCell>
          <TableCell class="text-xs text-muted-foreground">
            {{ app.phone || '-' }}
          </TableCell>
          <TableCell>
            <!-- Badge status dinamis berdasarkan app.status -->
            <Badge v-if="app.status === 'PENDING'" class="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-800 dark:text-amber-400">
              Menunggu Approval
            </Badge>
            <Badge v-else-if="app.status === 'APPROVED'" class="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800 dark:text-emerald-400">
              Disetujui
            </Badge>
            <Badge v-else-if="app.status === 'REJECTED'" class="px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive border border-destructive/20">
              Ditolak
            </Badge>
          </TableCell>
          <TableCell class="text-right" @click.stop>
            <div class="flex justify-end gap-2">
              <!-- Tombol Setujui & Tolak hanya tampil jika masih PENDING -->
              <template v-if="app.status === 'PENDING'">
                <Button
                  variant="outline"
                  size="sm"
                  @click="$emit('review', app.id, 'APPROVED')"
                  :disabled="verifyingId === app.id"
                  class="h-8 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:border-emerald-800"
                >
                  <Loader2 v-if="verifyingId === app.id" class="h-3.5 w-3.5 animate-spin" />
                  <CheckCircle2 v-else class="h-3.5 w-3.5" />
                  Setujui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  @click="$emit('review', app.id, 'REJECTED')"
                  :disabled="verifyingId === app.id"
                  class="h-8 gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:border-rose-800"
                >
                  <X class="h-3.5 w-3.5" />
                  Tolak
                </Button>
              </template>
              
              <!-- Tombol Delete Permanent -->
              <Button
                variant="ghost"
                size="icon"
                @click="$emit('delete', app)"
                :disabled="verifyingId === app.id"
                class="h-8 w-8 text-destructive hover:bg-destructive/10"
                title="Hapus Permanen"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </template>

      <!-- Empty Row Handling -->
      <TableRow v-else>
        <TableCell :colspan="7" class="h-64 text-center">
          <div class="flex flex-col items-center justify-center text-muted-foreground">
            <Users class="h-12 w-12 mb-2 opacity-20 text-kv-primary" />
            <p class="font-medium">Tidak ada pendaftaran mentor masuk</p>
            <p class="text-sm mt-1">Belum ada mentor mendaftar via Kreavoks Portal</p>
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
import { CheckCircle2, X, Loader2, Users, Trash2 } from 'lucide-vue-next'
import type { MentorApplication } from '~/pages/employee/api/mentorApplication.api'

defineProps<{
  applications: MentorApplication[]
  verifyingId: string | number | null
  loading: boolean
}>()

defineEmits<{
  (e: 'review', id: string | number, status: 'APPROVED' | 'REJECTED'): void
  (e: 'delete', app: MentorApplication): void
}>()

const parseExpertise = (expertiseStr: string | null | undefined): string[] => {
  if (!expertiseStr) return []
  try {
    const parsed = JSON.parse(expertiseStr)
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => typeof item === 'object' ? (item.name || 'Unknown') : String(item))
    }
    return [String(parsed)]
  } catch (e) {
    // Fallback if it's a regular comma-separated string
    return expertiseStr.split(',').map(s => s.trim()).filter(Boolean)
  }
}
</script>
