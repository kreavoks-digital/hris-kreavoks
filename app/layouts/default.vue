<template>
  <div class="min-h-screen bg-background text-foreground overflow-x-clip w-full max-w-full">

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
        'fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width,transform]',
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
          class="absolute -right-3.5 top-[20px] hidden lg:flex w-7 h-7 bg-background border border-border rounded-lg items-center justify-center text-muted-foreground hover:text-kv-primary hover:border-kv-primary transition-all shadow-sm z-50 cursor-pointer"
        >
          <ChevronLeft v-if="!isCollapsed" class="w-4 h-4" stroke-width="2" />
          <ChevronRight v-else class="w-4 h-4" stroke-width="2" />
        </button>
      </div>

      <!-- Navigation -->
      <nav
        ref="sidebarNavRef"
        :class="[
          'flex-1 py-3 px-2 space-y-3',
          isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'
        ]"
      >
        <div
          v-for="(group, gIdx) in filteredNavigationGroups"
          :key="group.title || gIdx"
          class="space-y-1"
        >
          <!-- Group Header Label (Expanded) -->
          <div
            v-if="!isCollapsed && group.title"
            class="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground/70 select-none"
          >
            {{ group.title }}
          </div>
          <!-- Divider for Collapsed Mode (except top group) -->
          <div
            v-else-if="isCollapsed && gIdx > 0"
            class="my-2 mx-2 border-t border-border/50"
          />

          <!-- Items in Group -->
          <template v-for="item in group.items" :key="item.name">
            <!-- Item wrapper -->
            <div class="relative group/nav-item">
              <NuxtLink
                :to="isCollapsed && item.children ? undefined : item.to"
                @click="(e) => handleNavClick(item, e)"
                :class="[
                  'flex items-center gap-3 rounded-xl transition-all duration-200 text-sm font-medium relative overflow-hidden cursor-pointer',
                  isCollapsed ? 'justify-center w-11 h-11 mx-auto p-0' : 'justify-start px-3 py-2.5',
                  (item.children ? route.path.startsWith(item.to) : route.path === item.to)
                    ? 'bg-kv-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  (isCollapsed && activeCollapsedMenu === item.name && !route.path.startsWith(item.to))
                    ? 'bg-accent text-accent-foreground ring-1 ring-border'
                    : ''
                ]"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'shrink-0 transition-colors w-5 h-5',
                    (item.children ? route.path.startsWith(item.to) : route.path === item.to) ? 'text-white' : 'text-muted-foreground/70 group-hover/nav-item:text-accent-foreground'
                  ]"
                  stroke-width="1.75"
                />

                <!-- Adobe Illustrator / Photoshop corner triangle indicator (for collapsed items with children) -->
                <span
                  v-if="isCollapsed && item.children"
                  class="absolute bottom-1 right-1 pointer-events-none transition-all duration-200"
                  :class="[
                    activeCollapsedMenu === item.name
                      ? 'opacity-100 scale-110'
                      : 'opacity-60 group-hover/nav-item:opacity-100'
                  ]"
                  title="Memiliki sub-navigasi"
                >
                  <svg class="w-1.5 h-1.5 fill-current" viewBox="0 0 6 6">
                    <polygon points="6,0 6,6 0,6" />
                  </svg>
                </span>

                <!-- Label: only show when not collapsed -->
                <Transition name="sidebar-label">
                  <span v-if="!isCollapsed" class="whitespace-nowrap flex-1 text-left">
                    {{ item.name }}
                  </span>
                </Transition>
                
                <!-- Chevron for children when expanded -->
                <Transition name="sidebar-label">
                  <div v-if="!isCollapsed && item.children" class="ml-auto opacity-70">
                    <ChevronDown v-if="route.path.startsWith(item.to)" class="w-4 h-4" />
                    <ChevronRight v-else class="w-4 h-4" />
                  </div>
                </Transition>
              </NuxtLink>

              <!-- Sub Navigation (when sidebar is expanded) -->
              <div v-if="!isCollapsed && item.children && route.path.startsWith(item.to)" class="mt-1 flex flex-col pl-9 space-y-1">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.name"
                  :to="child.to"
                  class="px-3 py-2 text-[13px] rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
                  :class="{ 'bg-accent text-foreground font-medium': route.path === child.to }"
                >
                  {{ child.name }}
                </NuxtLink>
              </div>

              <!-- Collapsed Flyout Submenu (Adobe Photoshop/Illustrator style - when isCollapsed && item.children) -->
              <div
                v-if="isCollapsed && item.children"
                :class="[
                  'absolute left-full top-0 ml-3 z-[70] transition-all duration-200 select-none',
                  activeCollapsedMenu === item.name
                    ? 'opacity-100 translate-x-0 pointer-events-auto visible'
                    : 'opacity-0 -translate-x-1.5 pointer-events-none invisible group-hover/nav-item:opacity-100 group-hover/nav-item:translate-x-0 group-hover/nav-item:pointer-events-auto group-hover/nav-item:visible'
                ]"
              >
                <!-- Hover bridge to prevent mouseleave when moving from button across gap -->
                <div class="absolute -left-4 top-0 bottom-0 w-4 pointer-events-auto" />

                <div class="w-56 p-2 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-md">
                  <!-- Flyout Header: Parent icon, title & badge -->
                  <div class="px-2.5 py-1.5 flex items-center justify-between border-b border-border/50 mb-1.5">
                    <div class="flex items-center gap-2 min-w-0">
                      <component :is="item.icon" class="w-4 h-4 text-kv-primary shrink-0" stroke-width="2" />
                      <span class="text-xs font-semibold text-foreground tracking-tight truncate">{{ item.name }}</span>
                    </div>
                    <span class="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md shrink-0">
                      {{ item.children.length }} menu
                    </span>
                  </div>

                  <!-- Children links -->
                  <div class="space-y-0.5">
                    <NuxtLink
                      v-for="child in item.children"
                      :key="child.name"
                      :to="child.to"
                      @click="closeCollapsedMenu"
                      :class="[
                        'flex items-center justify-between px-2.5 py-2 text-xs rounded-xl transition-all duration-150 font-medium group/child',
                        route.path === child.to
                          ? 'bg-kv-primary text-white shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      ]"
                    >
                      <span class="truncate">{{ child.name }}</span>
                      <div
                        v-if="route.path === child.to"
                        class="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-2 shadow-xs"
                      />
                      <ChevronRight
                        v-else
                        class="w-3.5 h-3.5 opacity-0 group-hover/child:opacity-60 transition-opacity shrink-0 ml-2"
                      />
                    </NuxtLink>
                  </div>
                </div>
              </div>

              <!-- Collapsed Tooltip (only for items WITHOUT children) -->
              <div
                v-if="isCollapsed && !item.children"
                class="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-xl whitespace-nowrap opacity-0 group-hover/nav-item:opacity-100 pointer-events-none transition-all duration-150 -translate-x-1 group-hover/nav-item:translate-x-0 z-[60] shadow-lg flex items-center gap-1.5"
              >
                {{ item.name }}
                <!-- Arrow -->
                <div class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
              </div>
            </div>
          </template>
        </div>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div
      :class="[
        'flex flex-col min-h-screen transition-[padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[padding] min-w-0 w-full max-w-full',
        isCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[240px]'
      ]"
    >
      <!-- Header -->
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6 min-w-0 w-full max-w-full">

        <!-- Left: Mobile hamburger + page title -->
        <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
          <!-- Mobile Menu Button -->
          <button
            @click="isMobileOpen = true"
            class="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-kv-primary hover:text-kv-primary transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <Menu class="h-4 w-4" stroke-width="1.75" />
          </button>

          <!-- Dashboard Specific -->
          <template v-if="route.path === '/dashboard'">
            <h1 class="hidden md:block text-sm md:text-base font-semibold text-foreground truncate">
              Selamat datang kembali,
              <span class="text-kv-primary font-bold">{{ user?.fullName || 'User' }}</span> 👋
            </h1>
          </template>

          <!-- Standard breadcrumb (hanya breadcrumbs tanpa duplikat judul page) -->
          <template v-else>
            <nav class="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 flex-1" aria-label="Breadcrumbs">
              <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
                <ChevronRight v-if="idx > 0" class="h-3 w-3 shrink-0 text-muted-foreground/50" />
                <span
                  :class="[
                    'truncate',
                    idx === breadcrumbs.length - 1
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  ]"
                >
                  {{ crumb }}
                </span>
              </template>
            </nav>
          </template>
        </div>

        <!-- Right: Search, Bell, Profile -->
        <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <!-- Global Search Rekan Kerja (ala Microsoft Teams) -->
          <button
            @click="openSearchModal"
            class="flex items-center justify-center sm:justify-start gap-2 h-9 w-9 sm:h-auto sm:w-52 md:w-60 px-0 sm:px-3 py-0 sm:py-1.5 rounded-full sm:rounded-3xl bg-muted/40 hover:bg-muted border border-border text-xs text-muted-foreground transition-colors text-left cursor-pointer shrink-0"
            title="Cari rekan kerja (Ctrl + K)"
          >
            <Search class="h-4 w-4 sm:h-3.5 sm:w-3.5 shrink-0 text-muted-foreground" />
            <span class="hidden sm:inline truncate flex-1">Cari rekan kerja...</span>
            <kbd class="hidden sm:inline-block px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]">Ctrl+K</kbd>
          </button>

          <!-- Notification Bell -->
          <NotificationDropdown />

          <Separator orientation="vertical" class="h-6" />

          <!-- User Dropdown with Teams Presence -->
          <DropdownMenu>
            <DropdownMenuTrigger class="flex items-center gap-2.5 px-2 py-1.5 hover:bg-accent rounded-2xl transition-all cursor-pointer outline-none border-none bg-transparent">
              <div class="relative shrink-0">
                <Avatar class="h-9 w-9 border border-border">
                  <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`" />
                  <AvatarFallback class="bg-kv-primary text-primary-foreground font-bold text-xs">{{ initials }}</AvatarFallback>
                </Avatar>
                <!-- Status indicator dot on avatar -->
                <div class="absolute -bottom-0.5 -right-0.5">
                  <StatusIndicator :status="presence.effectiveStatus" size="md" />
                </div>
              </div>
              <div class="hidden md:flex flex-col items-start gap-0">
                <span class="text-xs font-semibold text-foreground leading-tight">{{ user?.fullName || 'User' }}</span>
                <span class="text-[11px] text-muted-foreground leading-tight">{{ user?.position || 'Staff' }}</span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent :side-offset="8" align="end" class="w-60 p-1.5 z-50 rounded-2xl border border-border bg-popover">
              <div class="px-3 py-2 border-b border-border/50 mb-1">
                <div class="text-sm font-semibold text-foreground">{{ user?.fullName || 'User' }}</div>
                <div class="text-xs text-muted-foreground truncate">{{ user?.email }}</div>
              </div>

              <div class="space-y-0.5">
                <DropdownMenuItem
                  class="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground rounded-xl group transition-colors"
                  @click="user?.id && viewProfile(user.id)"
                >
                  <UserCircle class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span class="text-sm font-medium">Profil Saya</span>
                </DropdownMenuItem>

                <!-- Teams Status Submenu -->
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent rounded-xl group transition-colors">
                    <div class="flex items-center gap-3">
                      <StatusIndicator :status="presence.effectiveStatus" size="sm" />
                      <span class="text-sm font-medium">{{ currentConfig.label }}</span>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent class="w-56 p-1.5 rounded-2xl border border-border bg-popover z-50">
                    <DropdownMenuItem
                      v-for="opt in STATUS_OPTIONS"
                      :key="opt.key"
                      class="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-accent rounded-xl"
                      @click="setStatus(opt.key)"
                    >
                      <StatusIndicator :status="opt.key" size="sm" />
                      <span class="text-sm flex-1">{{ opt.label }}</span>
                      <Check v-if="presence.customStatus === opt.key" class="w-3.5 h-3.5 text-kv-primary" />
                    </DropdownMenuItem>

                    <DropdownMenuSeparator class="my-1 border-border/50" />

                    <DropdownMenuItem
                      class="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-accent rounded-xl text-muted-foreground"
                      @click="resetStatus"
                    >
                      <RotateCcw class="w-3.5 h-3.5" />
                      <span class="text-sm">Reset status (Otomatis)</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <!-- Theme Toggle (Dark / Light Mode) -->
                <DropdownMenuItem
                  class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground rounded-xl group transition-colors"
                  @click="toggleDark()"
                >
                  <div class="flex items-center gap-3">
                    <Sun v-if="!isDark" class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Moon v-else class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span class="text-sm font-medium">Mode Tampilan</span>
                  </div>
                  <span class="text-xs text-muted-foreground font-normal">
                    {{ isDark ? 'Dark' : 'Light' }}
                  </span>
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
      <main class="flex-1 p-4 lg:p-8 min-w-0 w-full max-w-full">
        <div class="mx-auto max-w-7xl min-w-0 w-full">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-border py-6 px-4 lg:px-8 w-full max-w-full">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-sm text-muted-foreground text-center sm:text-left">© 2024 Kreavoks Digital Agency - HRIS Ecosystem</p>
          <div class="flex gap-4 text-sm text-muted-foreground">
            <span>Support</span>
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
  <!-- Global Notification Toast (teleported to body) -->
  <NotificationToast />

  <!-- Global Modals for Colleague Search & Public Profile -->
  <ColleagueSearchModal />
  <PublicProfileModal />
</template>

<script setup lang="ts">
import {
  BarChart3,
  Users,
  CheckCircle2,
  Calendar,
  CalendarDays,
  CircleDollarSign,
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  UserCircle,
  Search,
  Shield,
  Sun,
  Moon,
  FileText,
  RotateCcw,
  Check,
  FolderKanban,
  Kanban,
  ChartNoAxesGantt,
  Folders,
} from 'lucide-vue-next'
import { useDark, useToggle, onClickOutside } from '@vueuse/core'
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '~/components/ui/dropdown-menu'
import NotificationDropdown from '~/components/shared/NotificationDropdown.vue'
import NotificationToast from '~/components/shared/NotificationToast.vue'
import StatusIndicator from '~/components/shared/StatusIndicator.vue'
import ColleagueSearchModal from '~/components/shared/ColleagueSearchModal.vue'
import PublicProfileModal from '~/components/shared/PublicProfileModal.vue'
import { usePresence } from '~/composables/usePresence'
import { useColleagueSearch } from '~/composables/useColleagueSearch'
import { toast } from 'vue-sonner'

const route = useRoute()
const { user, logoutAndRedirect, fetchUser, accessToken } = useAuth()
const searchQuery = useState('dashboard_search_query', () => '')
const { fetchNotifications, setupFcmListener, destroyFcmListener } = useNotifications()

// Presence & Teams Search
const { presence, currentConfig, setStatus, resetStatus, initPresence } = usePresence()
const { openSearchModal, viewProfile } = useColleagueSearch()

const STATUS_OPTIONS = [
  { key: 'AVAILABLE', label: 'Available' },
  { key: 'BUSY', label: 'Busy' },
  { key: 'DND', label: 'Do not disturb' },
  { key: 'BE_RIGHT_BACK', label: 'Be right back' },
  { key: 'AWAY', label: 'Appear away' },
  { key: 'OFFLINE', label: 'Appear offline' },
]

// --- Sidebar State ---
const isCollapsed = useState<boolean>('sidebar_is_collapsed', () => false)
const isMobileOpen = ref(false)

// --- Collapsed Submenu Flyout (Adobe style) ---
const sidebarNavRef = ref<HTMLElement | null>(null)
const activeCollapsedMenu = ref<string | null>(null)

const handleNavClick = (item: any, event: MouseEvent) => {
  if (isCollapsed.value && item.children && item.children.length > 0) {
    event.preventDefault()
    activeCollapsedMenu.value = activeCollapsedMenu.value === item.name ? null : item.name
  }
}

const closeCollapsedMenu = () => {
  activeCollapsedMenu.value = null
}

onClickOutside(sidebarNavRef, () => {
  activeCollapsedMenu.value = null
})

// --- Theme State ---
const isDark = useDark()
const toggleDark = useToggle(isDark)

// Restore from localStorage on client
onMounted(async () => {
  // Inisialisasi presence heartbeat & auto-status
  initPresence()
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

  // Close flyout on Escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      activeCollapsedMenu.value = null
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

  // Sinkronisasi data user & permission terbaru dari server
  if (accessToken.value) {
    await fetchUser()
  }

  // Fetch notifikasi awal & setup FCM foreground listener
  await fetchNotifications()
  setupFcmListener()
})

onUnmounted(() => {
  destroyFcmListener()
})

// Close mobile sidebar and flyout menu on route change
watch(() => route.path, () => {
  isMobileOpen.value = false
  activeCollapsedMenu.value = null
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  activeCollapsedMenu.value = null
  localStorage.setItem('kvhris-sidebar-collapsed', String(isCollapsed.value))
}

// --- Navigation Types & Structure ---
interface NavChild {
  name: string
  to: string
}

interface NavItem {
  name: string
  to: string
  icon: any
  permission?: string
  children?: NavChild[]
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const navigationGroups: NavGroup[] = [
  {
    items: [
      { name: 'Dashboard', to: '/dashboard', icon: BarChart3 },
      { name: 'Calendar', to: '/calendar', icon: Calendar },
      { name: 'Attendance', to: '/attendance', icon: CheckCircle2 },
    ]
  },
  {
    title: 'Projects',
    items: [
      { name: 'Project Tracker', to: '/projects', icon: FolderKanban },
      { name: 'Kanban Board', to: '/projects/kanban', icon: Kanban },
      { name: 'Timeline', to: '/projects/timeline', icon: ChartNoAxesGantt },
      { name: 'Folders', to: '/projects/folders', icon: Folders },
    ]
  },
  {
    title: 'Human Resources',
    items: [
      { name: 'Leave', to: '/leave', icon: CalendarDays, permission: 'manage_users' },
      // { name: 'Payroll', to: '/payroll', icon: CircleDollarSign },
      { 
        name: 'Employee', 
        to: '/employee', 
        icon: Users, 
        permission: 'manage_users',
        children: [
          { name: 'Semua Karyawan', to: '/employee' },
          { name: 'Pending Intern', to: '/employee/intern' },
          { name: 'Pendaftaran Mentor', to: '/employee/mentor' }
        ]
      },
      { 
        name: 'Letters', 
        to: '/letters', 
        icon: FileText, 
        permission: 'manage_letters',
        children: [
          { name: 'Manajemen Surat', to: '/letters' },
          { name: 'Template Surat', to: '/letters/template' },
          { name: 'Certificate Generator', to: '/letters/certificate' }
        ]
      },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'RBAC', to: '/rbac', icon: Shield, permission: 'manage_roles' },
    ]
  }
]

const filteredNavigationGroups = computed(() => {
  const isAdmin = user.value?.role === 'ADMIN'
  const rawPermissions = user.value?.permissions ?? []
  const permissions: string[] = rawPermissions
    .map((p: any) => typeof p === 'string' ? p : p?.name)
    .filter(Boolean)
  const canViewAll = permissions.includes('view_all_features')

  return navigationGroups
    .map(group => {
      const items = group.items.filter(item => {
        // ADMIN → selalu tampil semua
        if (isAdmin || canViewAll) return true

        // Cek permission spesifik untuk item menu tertentu
        if (item.permission) {
          return permissions.includes(item.permission)
        }
        return true
      })
      return {
        ...group,
        items
      }
    })
    .filter(group => group.items.length > 0)
})

// Flattened navigation items untuk page title dan breadcrumbs
const allNavItems = computed(() => {
  const items: NavItem[] = []
  navigationGroups.forEach(group => {
    group.items.forEach(item => {
      items.push(item)
      if (item.children) {
        item.children.forEach(child => {
          items.push({ name: child.name, to: child.to, icon: item.icon })
        })
      }
    })
  })
  return items
})

const pageTitle = computed(() => {
  // Check if page specifies a custom title in its meta
  if (route.meta.title) {
    return route.meta.title as string;
  }
  
  // Find exact match first
  const exactMatch = allNavItems.value.find(n => n.to === route.path);
  if (exactMatch) return exactMatch.name;
  
  // Find prefix match (e.g., /employee/123 matches /employee)
  const pathPrefix = `/${route.path.split('/')[1]}`;
  const prefixMatch = allNavItems.value.find(n => n.to === pathPrefix);
  
  return prefixMatch ? prefixMatch.name : 'HRIS';
})

const breadcrumbs = computed<string[]>(() => {
  if (route.meta.breadcrumb) {
    return Array.isArray(route.meta.breadcrumb)
      ? (route.meta.breadcrumb as string[])
      : [route.meta.breadcrumb as string]
  }

  // 1. Cek kecocokan child item
  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.children) {
        const matchedChild = item.children.find(c => c.to === route.path)
        if (matchedChild) {
          const rootLabel = group.title || 'Main'
          return [rootLabel, item.name, matchedChild.name]
        }
      }
    }
  }

  // 2. Cek kecocokan item utama
  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.to === route.path) {
        const rootLabel = group.title || 'Main'
        return [rootLabel, item.name]
      }
    }
  }

  // 3. Prefix match fallback (e.g., /employee/edit/123)
  const pathPrefix = `/${route.path.split('/')[1]}`
  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.to === pathPrefix) {
        const rootLabel = group.title || 'Main'
        return [rootLabel, pageTitle.value]
      }
    }
  }

  return ['Main', pageTitle.value]
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
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar-label-leave-active {
  transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}
.sidebar-label-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
.sidebar-label-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
