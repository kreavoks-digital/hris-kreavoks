<template>
  <div class="p-8 space-y-8 animate-in fade-in duration-700">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-kv-black dark:text-slate-50">Dashboard</h1>
        <p class="text-slate-400 mt-1">Ringkasan operasional HRIS Kreavoks hari ini.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium">{{ currentTime }}</p>
          <p class="text-sm text-slate-400">{{ currentDate }}</p>
        </div>
        <Separator orientation="vertical" class="h-8 hidden sm:block" />
        <Button variant="outline" size="sm" class="gap-2 border-slate-200 text-slate-600">
          <Download class="h-4 w-4 text-kv-primary" />
          Ekspor Laporan
        </Button>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in statsItems" :key="stat.title" class="overflow-hidden border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 transition-all duration-300 group rounded-3xl">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-slate-400">
            {{ stat.title }}
          </CardTitle>
          <div :class="[stat.colorClass, 'p-2.5 rounded-2xl transition-colors']">
            <component :is="stat.icon" class="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent class="pb-4">
          <div class="flex items-end justify-between gap-2">
            <div>
              <div class="text-3xl font-semibold text-kv-black dark:text-slate-50">{{ stat.value }}</div>
              <p class="text-sm text-slate-400 mt-1 flex items-center gap-1">
                <span :class="stat.trendColor" class="font-medium text-sm">{{ stat.trend }}</span>
              </p>
            </div>
            <!-- Sparkline -->
            <div class="h-10 w-24 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 100 30" class="h-full w-full overflow-visible">
                <path
                  :d="stat.sparklinePath"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :class="stat.sparklineColor"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      <Card class="lg:col-span-4 border border-slate-100 dark:border-slate-800 overflow-hidden rounded-3xl">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-kv-black dark:text-slate-50">Kehadiran Mingguan</CardTitle>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-kv-primary"></span>
                <span class="text-sm text-slate-400">Hadir</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-slate-200"></span>
                <span class="text-sm text-slate-400">Absen</span>
              </div>
            </div>
          </div>
          <CardDescription class="text-slate-400">Grafik kehadiran karyawan selama 7 hari terakhir.</CardDescription>
        </CardHeader>
        <CardContent class="h-[300px] p-6 pt-0">
          <div class="w-full h-full relative group">
            <svg viewBox="0 0 700 240" class="w-full h-full overflow-visible">
              <!-- Grid Lines -->
              <line x1="0" y1="0" x2="700" y2="0" class="stroke-slate-100 dark:stroke-slate-800" stroke-width="1" />
              <line x1="0" y1="80" x2="700" y2="80" class="stroke-slate-100 dark:stroke-slate-800" stroke-width="1" />
              <line x1="0" y1="160" x2="700" y2="160" class="stroke-slate-100 dark:stroke-slate-800" stroke-width="1" />
              <line x1="0" y1="240" x2="700" y2="240" class="stroke-slate-100 dark:stroke-slate-800" stroke-width="1" />

              <!-- Gradient Definition -->
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#4082E6" stop-opacity="0.2" />
                  <stop offset="100%" stop-color="#4082E6" stop-opacity="0" />
                </linearGradient>
              </defs>

              <!-- Line Chart Area -->
              <path
                d="M 0 200 L 100 120 L 200 150 L 300 80 L 400 100 L 500 40 L 600 60 L 700 20 L 700 240 L 0 240 Z"
                fill="url(#chartGradient)"
              />

              <!-- Line Chart Stroke -->
              <path
                d="M 0 200 L 100 120 L 200 150 L 300 80 L 400 100 L 500 40 L 600 60 L 700 20"
                fill="none"
                stroke="#4082E6"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class=""
              />

              <!-- Data Points -->
              <circle cx="0" cy="200" r="4" fill="white" stroke="#4082E6" stroke-width="2" />
              <circle cx="100" cy="120" r="4" fill="white" stroke="#4082E6" stroke-width="2" />
              <circle cx="200" cy="150" r="4" fill="white" stroke="#4082E6" stroke-width="2" />
              <circle cx="300" cy="80" r="4" fill="white" stroke="#4082E6" stroke-width="2" />
              <circle cx="400" cy="100" r="4" fill="white" stroke="#4082E6" stroke-width="2" />
              <circle cx="500" cy="40" r="4" fill="white" stroke="#4082E6" stroke-width="2" />
              <circle cx="600" cy="60" r="4" fill="white" stroke="#4082E6" stroke-width="2" />
              <circle cx="700" cy="20" r="4" fill="white" stroke="#4082E6" stroke-width="2" />
            </svg>
            
            <!-- X-Axis Labels -->
            <div class="flex justify-between mt-4 text-sm text-slate-400 font-medium font-sans">
              <span>Senin</span>
              <span>Selasa</span>
              <span>Rabu</span>
              <span>Kamis</span>
              <span>Jumat</span>
              <span>Sabtu</span>
              <span>Minggu</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Activities -->
      <Card class="lg:col-span-3 border-none">
        <CardHeader>
          <CardTitle class="text-kv-black">Aktivitas Terbaru</CardTitle>
          <CardDescription class="text-slate-400">Update aktivitas HR dan karyawan secara real-time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex gap-4 items-start">
              <div :class="[activity.color, 'mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-kv-primary/10']">
                <component :is="activity.icon" class="h-4 w-4 text-kv-primary" />
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">{{ activity.user }}</p>
                <p class="text-sm text-slate-400">{{ activity.action }}</p>
                <p class="text-sm text-slate-300 pt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" class="w-full mt-6 text-sm text-kv-primary hover:bg-kv-primary/5">
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
    colorClass: 'bg-kv-primary/10 text-kv-primary',
    trend: '+2.5% increase',
    trendColor: 'text-emerald-500',
    sparklinePath: 'M 0 25 L 20 15 L 40 20 L 60 10 L 80 15 L 100 5',
    sparklineColor: 'text-kv-primary'
  },
  {
    title: 'Hadir Hari Ini',
    value: stats.value.presentToday,
    icon: CheckCircle2,
    colorClass: 'bg-emerald-500/10 text-emerald-600',
    trend: '95.2% rate',
    trendColor: 'text-emerald-500',
    sparklinePath: 'M 0 20 L 20 18 L 40 15 L 60 12 L 80 8 L 100 5',
    sparklineColor: 'text-emerald-500'
  },
  {
    title: 'Cuti Bulan Ini',
    value: stats.value.leaveThisMonth,
    icon: CalendarDays,
    colorClass: 'bg-amber-500/10 text-amber-600',
    trend: '-12% decrease',
    trendColor: 'text-rose-500',
    sparklinePath: 'M 0 5 L 20 10 L 40 8 L 60 15 L 80 12 L 100 20',
    sparklineColor: 'text-amber-500/70'
  },
  {
    title: 'Pending Approval',
    value: stats.value.pendingApproval,
    icon: Clock,
    colorClass: 'bg-blue-500/10 text-blue-600',
    trend: '5 New entries',
    trendColor: 'text-blue-500',
    sparklinePath: 'M 0 15 L 20 15 L 40 15 L 60 20 L 80 18 L 100 15',
    sparklineColor: 'text-blue-300'
  }
])

const recentActivities = [
  {
    id: 1,
    user: 'Budi Santoso',
    action: 'Melakukan check-in absensi',
    time: '2 menit yang lalu',
    icon: Clock,
    color: 'bg-kv-primary/10'
  },
  {
    id: 2,
    user: 'Siti Aminah',
    action: 'Mengajukan cuti tahunan',
    time: '15 menit yang lalu',
    icon: CalendarDays,
    color: 'bg-kv-primary/5'
  },
  {
    id: 3,
    user: 'Admin system',
    action: 'Menambahkan karyawan baru: Ahmad Fauzi',
    time: '1 jam yang lalu',
    icon: UserPlus,
    color: 'bg-kv-primary/10'
  },
  {
    id: 4,
    user: 'Diana Putri',
    action: 'Mengunduh slip gaji Maret 2024',
    time: '3 jam yang lalu',
    icon: FileText,
    color: 'bg-kv-primary/5'
  }
]
</script>
