<template>
  <div class="min-h-screen bg-background text-foreground">

    <!-- Mobile Overlay -->
    <Transition name="fade">
      <div
        v-if="isMobileOpen"
        class="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        @click="isMobileOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[76px]' : 'w-[240px]',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo Area -->
      <div class="h-16 flex items-center justify-center w-full border-b border-border/50 shrink-0 relative px-3">
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5 overflow-hidden">
          <!-- Collapsed: Mark icon only -->
          <Transition name="logo-switch" mode="out-in">
            <div v-if="isCollapsed" key="collapsed" class="shrink-0">
              <img
                src="/images/logo/kreavoks-hris-collapse-light.svg"
                alt="KV HRIS"
                class="h-8 w-auto dark:hidden"
              />
              <img
                src="/images/logo/kreavoks-hris-collapse-dark.svg"
                alt="KV HRIS"
                class="h-8 w-auto hidden dark:block"
              />
            </div>
            <!-- Expanded: Full logo -->
            <div v-else key="expanded" class="overflow-hidden">
              <img
                src="/images/logo/kreavoks-hris.svg"
                alt="Kreavoks HRIS"
                class="h-5 w-auto dark:hidden"
              />
              <img
                src="/images/logo/kreavoks-hris-white.svg"
                alt="Kreavoks HRIS"
                class="h-5 w-auto hidden dark:block"
              />
            </div>
          </Transition>
        </NuxtLink>

        <!-- Floating Collapse Toggle (Desktop only) -->
        <button
          @click="toggleCollapse"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          class="absolute -right-3 top-[22px] hidden lg:flex w-6 h-6 bg-background border border-border rounded-full items-center justify-center text-muted-foreground hover:text-kv-primary hover:border-kv-primary transition-all shadow-sm z-50"
        >
          <ChevronLeft v-if="!isCollapsed" class="w-3 h-3" />
          <ChevronRight v-else class="w-3 h-3" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-1">
        <template v-for="item in filteredNavigation" :key="item.name">
          <!-- Tooltip wrapper when collapsed -->
          <div class="relative group/nav-item">
            <NuxtLink
              :to="item.to"
              :title="isCollapsed ? item.name : ''"
              :class="[
                'flex items-center gap-3 rounded-xl transition-all duration-200 text-sm font-medium relative overflow-hidden',
                isCollapsed ? 'justify-center w-11 h-11 mx-auto p-0' : 'justify-start px-3 py-2.5',
                route.path === item.to
                  ? 'bg-kv-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  'shrink-0 transition-colors w-5 h-5',
                  route.path === item.to ? 'text-white' : 'text-muted-foreground/70 group-hover:text-accent-foreground'
                ]"
                stroke-width="1.75"
              />
              <!-- Label: only show when not collapsed -->
              <Transition name="sidebar-label">
                <span v-if="!isCollapsed" class="whitespace-nowrap">
                  {{ item.name }}
                </span>
              </Transition>
            </NuxtLink>

            <!-- Collapsed tooltip -->
            <div
              v-if="isCollapsed"
              class="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover/nav-item:opacity-100 pointer-events-none transition-opacity duration-150 z-[60] shadow-lg"
            >
              {{ item.name }}
              <!-- Arrow -->
              <div class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
            </div>
          </div>
        </template>
      </nav>

      <!-- Theme Toggle -->
      <div class="p-3 border-t border-border mt-auto">
        <button
          @click="toggleDark()"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative overflow-hidden',
            isCollapsed ? 'justify-center mx-auto p-0 w-11 h-11' : 'justify-start hover:bg-accent hover:text-accent-foreground text-muted-foreground'
          ]"
          :title="isCollapsed ? 'Toggle Theme' : ''"
        >
          <Sun v-if="!isDark" class="shrink-0 w-5 h-5 text-muted-foreground/70" stroke-width="1.75" />
          <Moon v-else class="shrink-0 w-5 h-5 text-muted-foreground/70" stroke-width="1.75" />
          <Transition name="sidebar-label">
            <span v-if="!isCollapsed" class="whitespace-nowrap">
              {{ isDark ? 'Light Mode' : 'Dark Mode' }}
            </span>
          </Transition>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div
      :class="[
        'flex flex-col min-h-screen transition-all duration-300 ease-in-out',
        isCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[240px]'
      ]"
    >
      <!-- Header -->
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">

        <!-- Left: Mobile hamburger + page title -->
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Button -->
          <button
            @click="isMobileOpen = true"
            class="lg:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:border-kv-primary hover:text-kv-primary transition-all shrink-0"
          >
            <Menu class="h-4 w-4" stroke-width="1.75" />
          </button>

          <!-- Dashboard Specific -->
          <template v-if="route.path === '/dashboard'">
            <h1 class="text-sm md:text-base font-semibold text-foreground">
              Selamat datang kembali,
              <span class="text-kv-primary font-bold">{{ user?.fullName || 'User' }}</span> 👋
            </h1>
          </template>

          <!-- Standard page title + breadcrumb -->
          <template v-else>
            <div class="flex items-center gap-3 md:gap-4">
              <h2 class="text-sm md:text-base font-semibold text-foreground leading-none">{{ pageTitle }}</h2>
              <div class="h-4 w-px bg-border hidden sm:block"></div>
              <div class="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Main</span>
                <ChevronRight class="h-3 w-3" />
                <span class="text-foreground font-medium">{{ pageTitle }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Right: Search, Bell, Profile -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Search Bar (Dashboard Only) -->
          <div v-if="route.path === '/dashboard'" class="relative hidden md:block w-48 lg:w-56">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Cari sesuatu"
              class="pl-9 h-9 text-xs"
            />
          </div>

          <!-- Notification Bell -->
          <Button variant="ghost" size="icon" class="relative h-9 w-9">
            <Bell class="h-4 w-4 text-muted-foreground" />
            <span class="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
          </Button>

          <Separator orientation="vertical" class="h-6" />

          <!-- User Dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger class="flex items-center gap-2.5 px-2 py-1.5 hover:bg-accent rounded-xl transition-all cursor-pointer outline-none border-none bg-transparent">
              <Avatar class="h-8 w-8 border border-border shadow-sm shrink-0">
                <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`" />
                <AvatarFallback class="bg-kv-primary text-primary-foreground font-bold text-xs">{{ initials }}</AvatarFallback>
              </Avatar>
              <div class="hidden md:flex flex-col items-start gap-0">
                <span class="text-xs font-semibold text-foreground leading-tight">{{ user?.fullName || 'User' }}</span>
                <span class="text-[11px] text-muted-foreground leading-tight">{{ user?.position || 'Staff' }}</span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent :side-offset="8" align="end" class="w-56 p-1.5 z-50">
              <div class="px-3 py-2 border-b border-border/50 mb-1">
                <div class="text-sm font-semibold text-foreground">{{ user?.fullName || 'User' }}</div>
                <div class="text-[12px] text-muted-foreground">{{ user?.position || 'Staff' }}</div>
              </div>

              <div class="space-y-0.5">
                <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground rounded-xl group transition-colors">
                  <UserCircle class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span class="text-sm font-medium">Profil Saya</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator class="mx-2 my-1" />

                <DropdownMenuItem class="flex items-center gap-3 px-3 py-2 cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive rounded-xl group transition-colors" @click="logout">
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
      <footer class="border-t border-border py-6 px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-sm text-muted-foreground">© 2024 Kreavoks Digital Agency - HRIS Ecosystem</p>
          <div class="flex gap-4 text-sm text-muted-foreground">
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
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  ChevronLeft,
  UserCircle,
  Search,
  Shield,
  Sun,
  Moon
} from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'
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

const route = useRoute()
const { user, logoutAndRedirect } = useAuth()
const searchQuery = useState('dashboard_search_query', () => '')

// --- Sidebar State ---
const isCollapsed = ref(false)
const isMobileOpen = ref(false)

// --- Theme State ---
const isDark = useDark()
const toggleDark = useToggle(isDark)

// Restore from localStorage on client
onMounted(() => {
  const saved = localStorage.getItem('kvhris-sidebar-collapsed')
  if (saved !== null) {
    isCollapsed.value = saved === 'true'
  }

  // Reset collapse on small screens
  const onResize = () => {
    if (window.innerWidth < 1024) {
      isCollapsed.value = false
    }
  }
  window.addEventListener('resize', onResize)
  onUnmounted(() => window.removeEventListener('resize', onResize))
})

// Close mobile sidebar on route change
watch(() => route.path, () => {
  isMobileOpen.value = false
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('kvhris-sidebar-collapsed', String(isCollapsed.value))
}

// --- Navigation ---
const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: BarChart3 },
  { name: 'Employee', to: '/employee', icon: Users, permission: 'manage_users' },
  { name: 'Attendance', to: '/attendance', icon: CheckCircle2 },
  { name: 'Leave', to: '/leave', icon: CalendarDays, permission: 'manage_users' },
  { name: 'Payroll', to: '/payroll', icon: CircleDollarSign },
  { name: 'RBAC', to: '/rbac', icon: Shield, permission: 'manage_roles' },
]

const filteredNavigation = computed(() => {
  return navigation.filter(item => {
    if (item.permission) {
      return user.value?.permissions?.includes(item.permission)
    }
    return true
  })
})

const pageTitle = computed(() => {
  const item = navigation.find(n => n.to === route.path)
  return item ? item.name : 'HRIS'
})

const initials = computed(() => {
  if (!user.value?.fullName) return '?'
  return user.value.fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const logout = () => {
  logoutAndRedirect()
}
</script>

<style scoped>
/* Fade overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Logo switch */
.logo-switch-enter-active,
.logo-switch-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.logo-switch-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.logo-switch-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Sidebar label fade-in/out */
.sidebar-label-enter-active {
  transition: opacity 0.2s ease 0.05s, transform 0.2s ease 0.05s;
}
.sidebar-label-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.sidebar-label-enter-from {
  opacity: 0;
  transform: translateX(-6px);
}
.sidebar-label-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
