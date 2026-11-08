<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-kv-black dark:text-slate-50">Project Tracker</h1>
        <p class="text-slate-400 mt-1 text-sm">
          Pantau kesehatan, progres, dan alokasi tim seluruh proyek di ekosistem Kreavoks.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :icon-left="RefreshCw"
          title="Muat Ulang Data"
          :class="{ 'animate-spin': isLoading }"
          @click="fetchProjects"
        />
        <Button
          variant="primary"
          size="sm"
          :icon-left="Plus"
          label="Buat Proyek"
          @click="isCreateModalOpen = true"
        />
      </div>
    </div>

    <!-- Metric Summary Cards -->
    <ProjectStatsCards :metrics="metrics" />

    <!-- Filters & View Switcher Toolbar -->
    <Card class="bg-card border border-border rounded-3xl p-4 shadow-none">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-[200px]">
          <Search class="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            v-model="searchQuery"
            placeholder="Cari nama proyek atau klien..."
            class="pl-11 h-11 text-sm rounded-3xl border-border bg-background"
          />
        </div>

        <!-- Filters (Health & Category) -->
        <div class="flex flex-wrap items-center gap-2">
          <Select v-model="healthFilter">
            <SelectTrigger class="w-[140px] h-11 text-sm rounded-3xl border-border bg-background px-4">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl border-border bg-popover z-50 shadow-none">
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="ON_TRACK">On Track</SelectItem>
              <SelectItem value="AT_RISK">At Risk</SelectItem>
              <SelectItem value="DELAYED">Delayed</SelectItem>
              <SelectItem value="COMPLETED">Selesai</SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="categoryFilter">
            <SelectTrigger class="w-[140px] h-11 text-sm rounded-3xl border-border bg-background px-4">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl border-border bg-popover z-50 shadow-none">
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              <SelectItem v-for="cat in projectCategories" :key="cat.key" :value="cat.key">
                {{ cat.label }}
              </SelectItem>
              <div class="pt-1 mt-1 border-t border-border/50 px-1">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  class="w-full justify-start text-xs text-primary h-8 px-2 hover:no-underline font-medium gap-1.5"
                  @click="navigateTo('/projects/categories')"
                >
                  <Settings2 class="w-3.5 h-3.5" />
                  <span>Kelola Kategori</span>
                </Button>
              </div>
            </SelectContent>
          </Select>

          <!-- View Mode Switcher -->
          <div class="flex items-center gap-1.5 pl-1">
            <Button
              type="button"
              :variant="viewMode === 'table' ? 'primary' : 'outline'"
              size="sm"
              :icon="true"
              :icon-left="List"
              title="Tampilan Tabel"
              @click="viewMode = 'table'"
            />
            <Button
              type="button"
              :variant="viewMode === 'grid' ? 'primary' : 'outline'"
              size="sm"
              :icon="true"
              :icon-left="LayoutGrid"
              title="Tampilan Grid"
              @click="viewMode = 'grid'"
            />
          </div>
        </div>
      </div>
    </Card>

    <!-- Loading State -->
    <Card
      v-if="isLoading"
      class="border border-border bg-card rounded-3xl p-12 text-center shadow-none flex flex-col items-center justify-center min-h-[280px]"
    >
      <div class="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3 animate-spin">
        <RefreshCw class="h-5 w-5" />
      </div>
      <p class="text-sm font-medium text-muted-foreground">Memuat daftar proyek dari database...</p>
    </Card>

    <!-- Projects Content: Table or Grid -->
    <div v-else-if="filteredProjects.length > 0">
      <ProjectTableView
        v-if="viewMode === 'table'"
        :projects="filteredProjects"
        @change-health="updateProjectHealth"
        @delete-project="deleteProject"
      />
      <ProjectCardGrid
        v-else
        :projects="filteredProjects"
      />
    </div>

    <!-- Empty State -->
    <Card
      v-else
      class="border border-border bg-card rounded-3xl p-12 text-center shadow-none flex flex-col items-center justify-center min-h-[280px]"
    >
      <div class="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
        <FolderKanban class="h-6 w-6" />
      </div>
      <h3 class="text-base font-semibold text-foreground mb-1">Tidak ada proyek yang sesuai</h3>
      <p class="text-sm text-muted-foreground max-w-sm mb-4">
        Coba sesuaikan kata kunci pencarian atau reset filter.
      </p>
      <Button
        variant="outline"
        size="sm"
        label="Reset Filter"
        @click="resetFilters"
      />
    </Card>

    <!-- Create Project Modal -->
    <CreateProjectModal
      v-model:open="isCreateModalOpen"
      :members="members"
      @created="createProject"
    />
  </div>
</template>

<script setup lang="ts">
import { Card } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Button } from '@kreavoks/kreaui'
import { Plus, Search, List, LayoutGrid, FolderKanban, RefreshCw, Settings2 } from 'lucide-vue-next'

import ProjectStatsCards from './components/ProjectStatsCards.vue'
import ProjectTableView from './components/ProjectTableView.vue'
import ProjectCardGrid from './components/ProjectCardGrid.vue'
import CreateProjectModal from './components/CreateProjectModal.vue'

import { useProjects } from './hooks/useProjects'
import { useProjectCategories } from './hooks/useProjectCategories'

definePageMeta({
  title: 'Project Tracker',
  layout: 'default',
  middleware: 'auth'
})

const { categories: projectCategories } = useProjectCategories()
const route = useRoute()

onMounted(() => {
  if (route.query.category) {
    categoryFilter.value = String(route.query.category)
  }
})

const {
  projects,
  members,
  isLoading,
  fetchProjects,
  searchQuery,
  healthFilter,
  categoryFilter,
  viewMode,
  isCreateModalOpen,
  filteredProjects,
  metrics,
  createProject,
  updateProjectHealth,
  deleteProject,
  resetFilters
} = useProjects()
</script>
