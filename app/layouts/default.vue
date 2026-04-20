<template>
  <div class="min-h-screen bg-slate-50/50 dark:bg-slate-950">
    <!-- Sidebar for Desktop -->
    <aside class="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 hidden lg:block">
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div class="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 class="h-5 w-5" />
            </div>
            <span class="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">KVHRIS</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <NuxtLink v-for="item in navigation" :key="item.name" :to="item.to" 
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 group"
            :class="[route.path === item.to ? 'bg-slate-100 text-primary dark:bg-slate-800 dark:text-slate-50' : 'text-slate-600 dark:text-slate-400']"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0 transition-colors" 
              :class="[route.path === item.to ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300']" 
            />
            {{ item.name }}
          </NuxtLink>
        </nav>

        <!-- Sidebar Footer -->
        <div class="border-t border-slate-200 p-4 dark:border-slate-800">
          <div class="flex items-center gap-3 px-2 py-2">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 ring-2 ring-primary/10 dark:bg-slate-800">
              <span class="text-xs font-bold text-primary">{{ initials }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-semibold truncate max-w-[120px]">{{ user?.fullName || 'User' }}</span>
              <span class="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Administrator</span>
            </div>
          </div>
          <Button variant="ghost" class="w-full justify-start gap-2 mt-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" @click="logout">
            <LogOut class="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="lg:ml-64 flex flex-col min-h-screen">
      <!-- Header -->
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 lg:px-8">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" class="lg:hidden">
            <Menu class="h-5 w-5" />
          </Button>
          <div>
            <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-50">{{ pageTitle }}</h2>
            <!-- Breadcrumbs style -->
            <div class="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              <span>Main</span>
              <ChevronRight class="h-3 w-3" />
              <span class="text-primary">{{ pageTitle }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Notification Bell (Placeholder) -->
          <Button variant="ghost" size="icon" class="relative">
            <Bell class="h-5 w-5 text-slate-500" />
            <span class="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </Button>
          
          <Separator orientation="vertical" class="h-6 mx-1 sm:mx-2" />
          
          <div class="flex items-center gap-3">
             <div class="hidden sm:flex flex-col text-right">
                <span class="text-xs font-semibold">{{ user?.fullName }}</span>
                <span class="text-[10px] text-slate-400">Online</span>
             </div>
             <div class="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                {{ initials }}
             </div>
          </div>
        </div>
      </header>

      <!-- Main Section -->
      <main class="flex-1 p-4 lg:p-8">
        <div class="mx-auto max-w-7xl">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-slate-200 py-6 px-8 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 opacity-50">
          <p class="text-xs text-slate-500 italic">© 2024 Kreavoks Digital Agency - HRIS Ecosystem</p>
          <div class="flex gap-4 text-xs text-slate-500 font-medium uppercase tracking-tighter">
            <span>Support</span>
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  CalendarDays, 
  CircleDollarSign, 
  Building2, 
  LogOut, 
  Bell, 
  Menu,
  ChevronRight,
  UserCircle
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { toast } from 'vue-sonner'

const route = useRoute();
const { user, logout: doLogout } = useAuth();

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: BarChart3 },
  { name: 'Karyawan', to: '/karyawan', icon: Users },
  { name: 'Absensi', to: '/absensi', icon: CheckCircle2 },
  { name: 'Cuti', to: '/cuti', icon: CalendarDays },
  { name: 'Payroll', to: '/payroll', icon: CircleDollarSign },
]

const pageTitle = computed(() => {
  const item = navigation.find(n => n.to === route.path)
  return item ? item.name : 'HRIS'
})

const initials = computed(() => {
  if (!user.value?.fullName) return "?"
  return user.value.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const logout = () => {
  doLogout()
  toast.success('Logged Out', {
    description: 'Anda telah keluar dari sistem'
  })
  navigateTo('/auth/login')
}
</script>
