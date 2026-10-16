<template>
  <div class="w-full overflow-x-auto min-w-0">
    <Table class="min-w-[750px]">
      <TableHeader>
        <TableRow>
          <TableHead class="whitespace-nowrap">Nama Calon Mentor</TableHead>
          <TableHead class="whitespace-nowrap">Keahlian</TableHead>
          <TableHead class="whitespace-nowrap">Pengalaman</TableHead>
          <TableHead class="whitespace-nowrap">Portofolio</TableHead>
          <TableHead class="whitespace-nowrap">Kontak</TableHead>
          <TableHead class="whitespace-nowrap">Status</TableHead>
          <TableHead class="text-right whitespace-nowrap">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableSkeleton v-if="loading" :rows="5" :columns="7" />
        <template v-else-if="applications.length > 0">
          <TableRow v-for="app in applications" :key="app.id" class="hover:bg-accent/50 transition-colors cursor-pointer group" @click="navigateTo(`/employee/mentor-application/${app.id}`)">
            <TableCell>
              <div class="flex flex-col">
                <span class="font-medium text-foreground leading-tight group-hover:underline group-hover:text-kv-primary transition-colors whitespace-nowrap">{{ app.name }}</span>
                <span class="text-xs text-muted-foreground whitespace-nowrap">{{ app.email }}</span>
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
            <TableCell class="text-sm text-muted-foreground whitespace-nowrap">
              {{ app.experience || '0' }} Tahun
            </TableCell>
            <TableCell class="whitespace-nowrap">
              <a v-if="app.portfolioLink" :href="app.portfolioLink" target="_blank" class="text-xs text-kv-primary underline hover:text-kv-primary/80" @click.stop>
                Buka Portofolio
              </a>
              <span v-else class="text-xs text-muted-foreground italic">-</span>
            </TableCell>
            <TableCell class="text-xs text-muted-foreground whitespace-nowrap">
              {{ app.phone || '-' }}
            </TableCell>
            <TableCell class="whitespace-nowrap">
              <!-- Badge status dinamis berdasarkan app.status -->
              <Badge v-if="app.status === 'PENDING'" class="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-800 dark:text-amber-400 whitespace-nowrap">
                Menunggu Approval
              </Badge>
              <Badge v-else-if="app.status === 'APPROVED'" class="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800 dark:text-emerald-400 whitespace-nowrap">
                Disetujui
              </Badge>
              <Badge v-else-if="app.status === 'REJECTED'" class="px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive border border-destructive/20 whitespace-nowrap">
                Ditolak
              </Badge>
            </TableCell>
            <TableCell class="text-right whitespace-nowrap" @click.stop>
              <div v-if="!readonly" class="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Opsi Lainnya"
                      :disabled="verifyingId === app.id"
                    >
                      <Loader2 v-if="verifyingId === app.id" class="h-4 w-4 animate-spin" />
                      <MoreHorizontal v-else class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-44 rounded-2xl p-1.5 shadow-md">
                    <!-- Setujui & Tolak (tampil jika PENDING) -->
                    <template v-if="app.status === 'PENDING'">
                      <DropdownMenuItem
                        class="cursor-pointer gap-2 text-xs py-2 rounded-xl text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                        @click="$emit('review', app.id, 'APPROVED')"
                      >
                        <CheckCircle2 class="h-3.5 w-3.5" />
                        <span>Setujui</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        class="cursor-pointer gap-2 text-xs py-2 rounded-xl text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                        @click="$emit('review', app.id, 'REJECTED')"
                      >
                        <X class="h-3.5 w-3.5" />
                        <span>Tolak</span>
                      </DropdownMenuItem>
                    </template>

                    <!-- Kirim Ulang Email (tampil jika sudah APPROVED atau REJECTED) -->
                    <DropdownMenuItem
                      v-if="app.status !== 'PENDING'"
                      class="cursor-pointer gap-2 text-xs py-2 rounded-xl"
                      @click="$emit('resend-email', app)"
                    >
                      <Mail class="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Kirim Ulang Email</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator class="my-1" />

                    <!-- Hapus Permanen -->
                    <DropdownMenuItem
                      class="cursor-pointer gap-2 text-xs py-2 rounded-xl text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                      @click="$emit('delete', app)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <!-- Readonly: hanya indikator, bisa klik row untuk detail -->
              <span v-else class="text-xs text-muted-foreground italic">View only</span>
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
  </div>
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '~/components/ui/dropdown-menu'
import TableSkeleton from '~/components/ui/skeleton/TableSkeleton.vue'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { CheckCircle2, X, Loader2, Users, Trash2, MoreHorizontal, Mail } from 'lucide-vue-next'
import type { MentorApplication } from '~/pages/employee/api/mentorApplication.api'

defineProps<{
  applications: MentorApplication[]
  verifyingId: string | number | null
  loading: boolean
  readonly?: boolean
}>()

defineEmits<{
  (e: 'review', id: string | number, status: 'APPROVED' | 'REJECTED'): void
  (e: 'delete', app: MentorApplication): void
  (e: 'resend-email', app: MentorApplication): void
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
