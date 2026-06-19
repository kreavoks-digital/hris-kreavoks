<template>
  <div class="min-h-screen bg-slate-50/50 dark:bg-slate-950">
    <!-- Sidebar for Desktop -->
    <aside class="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 hidden lg:block">
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div class="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Building2 class="h-5 w-5" />
            </div>
            <span class="text-xl font-semibold text-kv-black dark:text-slate-50">KVHRIS</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <NuxtLink v-for="item in filteredNavigation" :key="item.name" :to="item.to" 
            class="flex items-center gap-3 rounded-3xl px-3 py-2 text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800 group"
            :class="[route.path === item.to ? 'bg-kv-primary/10 text-kv-primary dark:bg-slate-800 dark:text-slate-50 font-medium' : 'text-slate-500 dark:text-slate-400']"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0 transition-colors" 
              :class="[route.path === item.to ? 'text-kv-primary' : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300']" 
            />
            {{ item.name }}
          </NuxtLink>
        </nav>

        <!-- Sidebar Navigation End -->
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="lg:ml-64 flex flex-col min-h-screen">
      <!-- Header -->
      <!-- Header -->
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 lg:px-8">
        <!-- Dashboard Specific Header (Left) -->
        <template v-if="route.path === '/dashboard'">
          <div class="flex items-center gap-4">
            <Button variant="ghost" size="icon" class="lg:hidden">
              <Menu class="h-5 w-5" />
            </Button>
            <h1 class="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
              Selamat datang kembali di dashboard, 
              <span class="text-kv-primary font-bold">{{ user?.fullName || 'User' }}</span> 👋
            </h1>
          </div>
        </template>
        
        <!-- Standard Header (Left) -->
        <template v-else>
          <div class="flex items-center gap-4">
            <Button variant="ghost" size="icon" class="lg:hidden">
              <Menu class="h-5 w-5" />
            </Button>
            <div>
              <h2 class="text-sm font-medium text-kv-black dark:text-slate-50">{{ pageTitle }}</h2>
              <!-- Breadcrumbs style -->
              <div class="flex items-center gap-1 text-sm text-slate-400">
                <span>Main</span>
                <ChevronRight class="h-2.5 w-2.5" />
                <span class="text-kv-primary">{{ pageTitle }}</span>
              </div>
            </div>
          </div>
        </template>

        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Search Bar (Dashboard Only) -->
          <div v-if="route.path === '/dashboard'" class="relative hidden md:block w-48 lg:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
            <Input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari sesuatu" 
              class="pl-9 h-9 text-xs"
            />
          </div>

          <!-- Notification Bell -->
          <Button variant="ghost" size="icon" class="relative">
            <Bell class="h-5 w-5 text-slate-500" />
            <span class="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </Button>
          
          <Separator orientation="vertical" class="h-6 mx-1 sm:mx-2" />
          
          <DropdownMenu>
            <DropdownMenuTrigger class="flex items-center gap-3 px-3 py-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer outline-none border-none bg-transparent">
              <Avatar class="h-9 w-9 border border-slate-200 shadow-sm shrink-0">
                <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`" />
                <AvatarFallback class="bg-kv-primary text-white font-bold text-sm">{{ initials }}</AvatarFallback>
              </Avatar>
              <div class="hidden md:flex flex-col items-start gap-0">
                <span class="text-sm font-semibold text-kv-black dark:text-slate-100 leading-tight">{{ user?.fullName || 'User' }}</span>
                <span class="text-[12px] text-slate-400 leading-tight">{{ user?.position || 'Staff' }}</span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent :side-offset="8" align="end" class="w-56 p-1.5 z-50">
              <div class="px-3 py-2 border-b border-slate-50 dark:border-slate-800/50 mb-1">
                <div class="text-sm font-semibold text-kv-black dark:text-slate-100">{{ user?.fullName || 'User' }}</div>
                <div class="text-[12px] text-slate-400">{{ user?.position || 'Staff' }}</div>
              </div>

              <div class="space-y-0.5">
                <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800 focus:text-kv-primary rounded-3xl group transition-colors">
                  <UserCircle class="h-4 w-4 text-slate-400 group-hover:text-kv-primary transition-colors" />
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Profil Saya</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator class="mx-2 my-1" />

                <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 cursor-pointer text-rose-500 focus:bg-rose-50 focus:text-rose-600 rounded-3xl group transition-colors" @click="logout">
                  <LogOut class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  <span class="text-sm font-medium">Log out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>


      <!-- Main Section -->
      <main class="flex-1 p-4 lg:p-8">
        <div class="mx-auto max-w-7xl">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-slate-100 py-6 px-8 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-sm text-slate-400">© 2024 Kreavoks Digital Agency - HRIS Ecosystem</p>
          <div class="flex gap-4 text-sm text-slate-400">
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
  UserCircle,
  Search,
  Shield
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { Input } from '~/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { toast } from 'vue-sonner'

const route = useRoute();
const { user, logout: doLogout } = useAuth();
const searchQuery = useState('dashboard_search_query', () => '')


const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: BarChart3 },
  { name: 'Karyawan', to: '/karyawan', icon: Users, permission: 'manage_users' },
  { name: 'Absensi', to: '/absensi', icon: CheckCircle2 },
  { name: 'Cuti', to: '/cuti', icon: CalendarDays },
  { name: 'Payroll', to: '/payroll', icon: CircleDollarSign },
  { name: 'RBAC', to: '/rbac', icon: Shield, permission: 'manage_roles' },
]

const filteredNavigation = computed(() => {
  return navigation.filter(item => {
    if (item.permission) {
      return user.value?.permissions?.includes(item.permission);
    }
    return true;
  });
});

const pageTitle = computed(() => {
  const item = navigation.find(n => n.to === route.path)
  return item ? item.name : 'HRIS'
})

const initials = computed(() => {
  if (!user.value?.fullName) return "?"
  return user.value.fullName
    .split(' ')
    .map((n: string) => n[0])
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
