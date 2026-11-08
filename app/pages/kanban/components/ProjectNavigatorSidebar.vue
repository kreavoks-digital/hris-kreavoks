<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Folder,
  FolderOpen,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-vue-next'
import type { Project } from '~/pages/projects/types'

const props = defineProps<{
  projects: Project[]
  activeProjectId: string | null
  isCollapsed?: boolean
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'selectProject', projectId: string): void
  (e: 'createProject'): void
  (e: 'toggleCollapse'): void
}>()

const searchQuery = ref('')
const expandedFolders = ref<Record<string, boolean>>({})

function toggleFolder(projId: string) {
  expandedFolders.value[projId] = !expandedFolders.value[projId]
}

const filteredProjects = computed(() => {
  if (!searchQuery.value.trim()) return props.projects
  const q = searchQuery.value.toLowerCase().trim()
  return props.projects.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.clientName.toLowerCase().includes(q)
  )
})
</script>

<template>
  <aside
    class="transition-all duration-300 ease-in-out shrink-0 select-none flex flex-col border border-border/60 bg-card rounded-3xl overflow-hidden shadow-none"
    :class="isCollapsed ? 'w-14' : 'w-64 sm:w-72'"
  >
    <!-- 1. Top Header -->
    <div class="p-3 border-b border-border/40 flex items-center justify-between gap-2">
      <!-- Expanded header: Title & Action -->
      <div v-if="!isCollapsed" class="flex items-center gap-2 min-w-0">
        <div class="w-7 h-7 rounded-xl bg-kv-primary/10 text-kv-primary flex items-center justify-center shrink-0">
          <FolderKanban class="w-4 h-4 text-kv-primary" />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-bold text-foreground truncate">Projects & Spaces</span>
          <span class="text-[10px] text-muted-foreground truncate">{{ projects.length }} Proyek Aktif</span>
        </div>
      </div>

      <!-- Collapsed header: icon only -->
      <div v-else class="w-full flex items-center justify-center">
        <button
          type="button"
          class="w-8 h-8 rounded-xl bg-kv-primary/10 text-kv-primary flex items-center justify-center cursor-pointer hover:bg-kv-primary/20 transition-colors"
          title="Buka Navigasi Proyek"
          @click="emit('toggleCollapse')"
        >
          <FolderKanban class="w-4 h-4 text-kv-primary" />
        </button>
      </div>

      <!-- Action Buttons (Expand Mode) -->
      <div v-if="!isCollapsed" class="flex items-center gap-1">
        <!-- Icon Kelola Proyek (di posisi Add sebelumnya) -->
        <button
          type="button"
          class="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Kelola Semua Proyek (/projects)"
          @click="navigateTo('/projects')"
        >
          <Layers class="w-3.5 h-3.5" />
        </button>

        <!-- Toggle Collapse Sidebar -->
        <button
          type="button"
          class="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Sembunyikan Panel"
          @click="emit('toggleCollapse')"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- 2. Search Box (Expanded Only) -->
    <div v-if="!isCollapsed" class="p-2.5 border-b border-border/30">
      <div class="relative">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari proyek..."
          class="w-full text-xs rounded-xl border border-border/40 bg-background pl-8 pr-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>
    </div>

    <!-- 3. Projects List Tree (Ala ClickUp) -->
    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <template v-if="!isCollapsed">
        <div class="px-2 pt-1 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Daftar Proyek Anda</span>
          <span v-if="isLoading" class="animate-pulse text-[9px] text-primary">Memuat...</span>
        </div>

        <!-- Skeleton Loading saat data pertama kali di-fetch -->
        <template v-if="isLoading && projects.length === 0">
          <div v-for="i in 4" :key="i" class="p-2.5 rounded-2xl bg-muted/30 animate-pulse flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <div class="w-2.5 h-2.5 rounded-full bg-muted shrink-0" />
              <div class="space-y-1.5 flex-1">
                <div class="h-3 w-3/4 bg-muted rounded" />
                <div class="h-2 w-1/2 bg-muted/60 rounded" />
              </div>
            </div>
            <div class="w-7 h-4 bg-muted rounded-lg" />
          </div>
        </template>

        <template v-else>
          <div
            v-for="proj in filteredProjects"
            :key="proj.id"
            class="group/item flex flex-col rounded-2xl transition-all"
            :class="proj.id === activeProjectId ? 'bg-primary/10 border border-primary/25 shadow-xs' : 'hover:bg-muted/50'"
          >
            <!-- Main Project Row -->
            <button
              type="button"
              class="flex items-center justify-between gap-2 px-2.5 py-2 w-full text-left cursor-pointer rounded-2xl transition-colors"
              @click="emit('selectProject', proj.id)"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <component
                  :is="proj.id === activeProjectId ? FolderOpen : Folder"
                  class="w-4 h-4 shrink-0 transition-colors"
                  :class="proj.id === activeProjectId ? 'text-primary' : 'text-muted-foreground/80 group-hover/item:text-foreground'"
                />
                <div class="flex flex-col min-w-0">
                  <span
                    class="text-xs truncate font-medium"
                    :class="proj.id === activeProjectId ? 'text-primary font-bold' : 'text-foreground'"
                  >
                    {{ proj.name }}
                  </span>
                  <span class="text-[10px] text-muted-foreground truncate">{{ proj.clientName }}</span>
                </div>
              </div>

              <!-- Task Count / Indicator -->
              <div class="flex items-center gap-1.5 shrink-0">
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-colors"
                  :class="proj.id === activeProjectId ? 'bg-primary/20 text-primary font-bold' : 'bg-muted text-muted-foreground'"
                >
                  {{ proj.totalTasks ?? 0 }}
                </span>
              </div>
            </button>
          </div>

          <!-- Empty Filter State -->
          <div
            v-if="filteredProjects.length === 0"
            class="p-4 text-center text-xs text-muted-foreground"
          >
            Tidak ada proyek ditemukan
          </div>
        </template>
      </template>

      <!-- Collapsed List (Icons Only) -->
      <template v-else>
        <button
          v-for="proj in projects"
          :key="proj.id"
          type="button"
          class="w-10 h-10 mx-auto rounded-xl flex items-center justify-center cursor-pointer transition-all mb-1 border"
          :class="proj.id === activeProjectId ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'"
          :title="proj.name"
          @click="emit('selectProject', proj.id)"
        >
          <span class="text-xs font-bold">{{ proj.name.charAt(0).toUpperCase() }}</span>
        </button>
      </template>
    </div>

    <!-- 4. Bottom Footer Link: Add Project (di posisi Manage Project sebelumnya) -->
    <div v-if="!isCollapsed" class="p-2.5 border-t border-border/30 bg-muted/20">
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-kv-primary hover:bg-kv-primary/10 rounded-2xl border border-kv-primary/20 transition-all cursor-pointer shadow-2xs group/btn"
        title="Buat Proyek Baru"
        @click="emit('createProject')"
      >
        <div class="w-4 h-4 rounded-md bg-kv-primary/15 text-kv-primary flex items-center justify-center group-hover/btn:bg-kv-primary group-hover/btn:text-white transition-colors">
          <Plus class="w-3 h-3 stroke-[3]" />
        </div>
        <span>Tambah Proyek Baru</span>
      </button>
    </div>

    <!-- Collapsed Bottom Footer: Add Project & Kelola Icons -->
    <div v-else class="p-2 border-t border-border/30 bg-muted/20 flex flex-col items-center gap-1.5">
      <button
        type="button"
        class="w-9 h-9 rounded-xl flex items-center justify-center text-kv-primary bg-kv-primary/10 hover:bg-kv-primary/20 transition-colors cursor-pointer"
        title="Tambah Proyek Baru"
        @click="emit('createProject')"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
      </button>
      <button
        type="button"
        class="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        title="Kelola Semua Proyek (/projects)"
        @click="navigateTo('/projects')"
      >
        <Layers class="w-4 h-4" />
      </button>
    </div>
  </aside>
</template>

