<template>
  <div class="p-8 space-y-8 animate-in fade-in duration-700">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Ringkasan operasional HRIS Kreavoks hari ini.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium">{{ currentTime }}</p>
          <p class="text-xs text-slate-500">{{ currentDate }}</p>
        </div>
        <Separator orientation="vertical" class="h-8 hidden sm:block" />
        <Button variant="outline" size="sm" class="gap-2">
          <Download class="h-4 w-4" />
          Ekspor Laporan
        </Button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in statsItems" :key="stat.title" class="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-slate-600 dark:text-slate-400">
            {{ stat.title }}
          </CardTitle>
          <div :class="[stat.bgClass, 'p-2 rounded-lg text-white group-hover:scale-110 transition-transform']">
            <component :is="stat.icon" class="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold tracking-tight">{{ stat.value }}</div>
          <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span :class="stat.trendColor" class="font-medium">{{ stat.trend }}</span>
            dari periode sebelumnya
          </p>
        </CardContent>
        <div :class="['h-1 w-full', stat.accentClass]"></div>
      </Card>
    </div>

    <!-- Main Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      <!-- Attendance Chart / Summary -->
      <Card class="lg:col-span-4 border-none shadow-md overflow-hidden">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Kehadiran Mingguan</CardTitle>
            <div class="flex items-center gap-2">
              <span class="flex items-center gap-1 text-xs text-slate-500">
                <span class="h-2 w-2 rounded-full bg-blue-500"></span> Hadir
              </span>
              <span class="flex items-center gap-1 text-xs text-slate-500">
                <span class="h-2 w-2 rounded-full bg-slate-200"></span> Absen
              </span>
            </div>
          </div>
          <CardDescription>Grafik kehadiran karyawan selama 7 hari terakhir.</CardDescription>
        </CardHeader>
        <CardContent class="h-[300px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-md m-6 mt-0">
          <div class="text-center text-slate-400">
            <BarChart3 class="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Visualisasi grafik akan muncul di sini</p>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Activities -->
      <Card class="lg:col-span-3 border-none shadow-md">
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>Update aktivitas HR dan karyawan secara real-time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex gap-4 items-start">
              <div :class="[activity.color, 'mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0']">
                <component :is="activity.icon" class="h-4 w-4 text-white" />
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">{{ activity.user }}</p>
                <p class="text-sm text-slate-500">{{ activity.action }}</p>
                <p class="text-xs text-slate-400 pt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" class="w-full mt-6 text-sm text-primary hover:bg-primary/5">
            Lihat Semua Aktivitas
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Users, 
  CheckCircle2, 
  CalendarDays, 
  Clock, 
  Download, 
  BarChart3, 
  UserPlus, 
  FileText, 
  LogOut 
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const currentTime = ref('')
const currentDate = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
}

onMounted(() => {
  updateTime()
  const timer = setInterval(updateTime, 60000)
  onUnmounted(() => clearInterval(timer))
})

const stats = ref({
  totalEmployees: 124,
  presentToday: 118,
  leaveThisMonth: 12,
  pendingApproval: 5,
});

const statsItems = computed(() => [
  {
    title: 'Total Karyawan',
    value: stats.value.totalEmployees,
    icon: Users,
    bgClass: 'bg-blue-600',
    accentClass: 'bg-blue-600',
    trend: '+2.5%',
    trendColor: 'text-emerald-500'
  },
  {
    title: 'Hadir Hari Ini',
    value: stats.value.presentToday,
    icon: CheckCircle2,
    bgClass: 'bg-indigo-600',
    accentClass: 'bg-indigo-600',
    trend: '95.2%',
    trendColor: 'text-emerald-500'
  },
  {
    title: 'Cuti Bulan Ini',
    value: stats.value.leaveThisMonth,
    icon: CalendarDays,
    bgClass: 'bg-rose-500',
    accentClass: 'bg-rose-500',
    trend: '-12%',
    trendColor: 'text-rose-500'
  },
  {
    title: 'Pending Approval',
    value: stats.value.pendingApproval,
    icon: Clock,
    bgClass: 'bg-amber-500',
    accentClass: 'bg-amber-500',
    trend: '5 Baru',
    trendColor: 'text-amber-500'
  }
])

const recentActivities = [
  {
    id: 1,
    user: 'Budi Santoso',
    action: 'Melakukan check-in absensi',
    time: '2 menit yang lalu',
    icon: Clock,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    user: 'Siti Aminah',
    action: 'Mengajukan cuti tahunan',
    time: '15 menit yang lalu',
    icon: CalendarDays,
    color: 'bg-rose-500'
  },
  {
    id: 3,
    user: 'Admin system',
    action: 'Menambahkan karyawan baru: Ahmad Fauzi',
    time: '1 jam yang lalu',
    icon: UserPlus,
    color: 'bg-emerald-500'
  },
  {
    id: 4,
    user: 'Diana Putri',
    action: 'Mengunduh slip gaji Maret 2024',
    time: '3 jam yang lalu',
    icon: FileText,
    color: 'bg-amber-500'
  }
]
</script>
