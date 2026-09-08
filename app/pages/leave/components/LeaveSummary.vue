<template>
  <div class="space-y-6">
    <!-- Stat Cards Overview -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Pengajuan -->
      <Card class="border border-border bg-card rounded-3xl">
        <CardContent class="p-6 flex items-center gap-4">
          <div class="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarDays class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">Total Pengajuan</p>
            <p class="text-2xl font-semibold text-foreground mt-0.5">{{ totalLeaves }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Disetujui -->
      <Card class="border border-border bg-card rounded-3xl">
        <CardContent class="p-6 flex items-center gap-4">
          <div class="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">Disetujui</p>
            <p class="text-2xl font-semibold text-foreground mt-0.5">{{ approvedLeaves }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Menunggu Review -->
      <Card class="border border-border bg-card rounded-3xl">
        <CardContent class="p-6 flex items-center gap-4">
          <div class="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">Menunggu Review</p>
            <p class="text-2xl font-semibold text-foreground mt-0.5">{{ pendingLeaves }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Ditolak -->
      <Card class="border border-border bg-card rounded-3xl">
        <CardContent class="p-6 flex items-center gap-4">
          <div class="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">Ditolak</p>
            <p class="text-2xl font-semibold text-foreground mt-0.5">{{ rejectedLeaves }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Insights & Frequency Section -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Admin View: Frekuensi Izin Karyawan Tertinggi -->
      <Card v-if="isAdmin" class="border border-border bg-card rounded-3xl">
        <CardHeader class="pb-3 pt-6 px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="h-8 w-8 rounded-xl bg-kv-primary/10 text-kv-primary flex items-center justify-center">
                <Users class="h-4 w-4" />
              </div>
              <div>
                <CardTitle class="text-base font-semibold text-foreground">Frekuensi Izin Karyawan</CardTitle>
                <CardDescription class="text-sm text-muted-foreground">Karyawan dengan pengajuan izin terbanyak</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent class="px-6 pb-6 pt-2">
          <div v-if="topEmployeesWithLeaves.length === 0" class="py-8 text-center text-sm text-muted-foreground">
            Belum ada data pengajuan izin.
          </div>
          <div v-else class="divide-y divide-border">
            <div
              v-for="(emp, index) in topEmployeesWithLeaves"
              :key="emp.email"
              class="py-3 flex items-center justify-between first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold text-muted-foreground w-4 text-center">
                  {{ index + 1 }}
                </span>
                <Avatar class="h-9 w-9 border border-border">
                  <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.fullName}`" />
                  <AvatarFallback>{{ emp.fullName ? emp.fullName.charAt(0) : 'U' }}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="text-sm font-medium text-foreground leading-none">{{ emp.fullName }}</p>
                  <p class="text-xs text-muted-foreground mt-1">{{ emp.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="border-border text-foreground font-medium text-xs px-2.5 py-0.5 rounded-3xl">
                  {{ emp.total }} kali diajukan
                </Badge>
                <span class="text-xs text-emerald-600 font-medium">
                  ({{ emp.approved }} disetujui)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Non-Admin View: Rekap Riwayat Izin Pribadi -->
      <Card v-else class="border border-border bg-card rounded-3xl">
        <CardHeader class="pb-3 pt-6 px-6">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-xl bg-kv-primary/10 text-kv-primary flex items-center justify-center">
              <UserCheck class="h-4 w-4" />
            </div>
            <div>
              <CardTitle class="text-base font-semibold text-foreground">Ringkasan Izin Saya</CardTitle>
              <CardDescription class="text-sm text-muted-foreground">Status dan tingkat persetujuan izin Anda</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="px-6 pb-6 pt-2">
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 rounded-2xl bg-muted/40">
              <span class="text-sm text-muted-foreground">Tingkat Persetujuan</span>
              <span class="text-base font-semibold text-foreground">{{ approvalRate }}%</span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-xs text-muted-foreground">
                <span>Rasio Persetujuan</span>
                <span>{{ approvedLeaves }} dari {{ totalLeaves }} disetujui</span>
              </div>
              <div class="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  class="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                  :style="{ width: `${approvalRate}%` }"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Distribusi Kategori Izin -->
      <Card class="border border-border bg-card rounded-3xl">
        <CardHeader class="pb-3 pt-6 px-6">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-xl bg-kv-primary/10 text-kv-primary flex items-center justify-center">
              <PieChart class="h-4 w-4" />
            </div>
            <div>
              <CardTitle class="text-base font-semibold text-foreground">Kategori Izin</CardTitle>
              <CardDescription class="text-sm text-muted-foreground">Pembagian berdasarkan jenis izin</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="px-6 pb-6 pt-2">
          <div v-if="leaves.length === 0" class="py-8 text-center text-sm text-muted-foreground">
            Belum ada kategori izin tercatat.
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="cat in leaveTypeDistribution"
              :key="cat.key"
              class="space-y-1.5"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="text-foreground font-medium">{{ cat.label }}</span>
                <span class="text-muted-foreground text-xs font-semibold">{{ cat.count }} izin ({{ cat.percentage }}%)</span>
              </div>
              <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  :class="[cat.color, 'h-2 rounded-full transition-all duration-300']"
                  :style="{ width: `${cat.percentage}%` }"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users, 
  UserCheck, 
  PieChart 
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import type { LeaveRecord } from '~/types'

const props = defineProps<{
  leaves: LeaveRecord[]
  isAdmin: boolean
}>()

// Total count
const totalLeaves = computed(() => props.leaves.length)

// Status counts
const approvedLeaves = computed(() => {
  return props.leaves.filter(l => l.status?.toLowerCase() === 'approved').length
})

const pendingLeaves = computed(() => {
  return props.leaves.filter(l => l.status?.toLowerCase() === 'pending').length
})

const rejectedLeaves = computed(() => {
  return props.leaves.filter(l => l.status?.toLowerCase() === 'rejected').length
})

// Approval Rate
const approvalRate = computed(() => {
  if (totalLeaves.value === 0) return 0
  return Math.round((approvedLeaves.value / totalLeaves.value) * 100)
})

// Karyawan paling sering izin (Top frequency)
const topEmployeesWithLeaves = computed(() => {
  const map = new Map<string, { fullName: string; email: string; total: number; approved: number; pending: number }>()

  for (const item of props.leaves) {
    const email = item.user?.email || item.user?.fullName || 'unknown'
    const existing = map.get(email)
    const isApproved = item.status?.toLowerCase() === 'approved'
    const isPending = item.status?.toLowerCase() === 'pending'

    if (!existing) {
      map.set(email, {
        fullName: item.user?.fullName || 'Karyawan',
        email: item.user?.email || '-',
        total: 1,
        approved: isApproved ? 1 : 0,
        pending: isPending ? 1 : 0
      })
    } else {
      existing.total++
      if (isApproved) existing.approved++
      if (isPending) existing.pending++
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 4)
})

// Distribusi jenis izin
const leaveTypeDistribution = computed(() => {
  const total = props.leaves.length || 1
  let sick = 0
  let annual = 0
  let emergency = 0
  let other = 0

  for (const item of props.leaves) {
    const rawType = (item.type || '').toLowerCase()
    if (rawType.includes('sick') || rawType.includes('sakit')) {
      sick++
    } else if (rawType.includes('annual') || rawType.includes('cuti')) {
      annual++
    } else if (rawType.includes('emergency') || rawType.includes('darurat')) {
      emergency++
    } else {
      other++
    }
  }

  return [
    {
      label: 'Cuti Sakit',
      key: 'sick',
      count: sick,
      percentage: Math.round((sick / total) * 100),
      color: 'bg-rose-500'
    },
    {
      label: 'Cuti Tahunan',
      key: 'annual',
      count: annual,
      percentage: Math.round((annual / total) * 100),
      color: 'bg-kv-primary'
    },
    {
      label: 'Cuti Darurat',
      key: 'emergency',
      count: emergency,
      percentage: Math.round((emergency / total) * 100),
      color: 'bg-amber-500'
    },
    {
      label: 'Izin Lainnya',
      key: 'other',
      count: other,
      percentage: Math.round((other / total) * 100),
      color: 'bg-slate-400'
    }
  ].filter(c => c.count > 0 || total === 1)
})
</script>
