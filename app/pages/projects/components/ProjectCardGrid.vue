<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card
      v-for="project in projects"
      :key="project.id"
      class="border border-border bg-card p-6 rounded-3xl shadow-none flex flex-col justify-between"
    >
      <div>
        <!-- Top: Category & Health Badge -->
        <div class="flex items-center justify-between gap-2 mb-3">
          <Badge type="label" variant="outline" size="sm">
            {{ formatCategory(project.category) }}
          </Badge>
          <Badge type="label" :variant="getHealthBadgeVariant(project.health)" size="sm">
            {{ formatHealthLabel(project.health) }}
          </Badge>
        </div>

        <!-- Title & Client -->
        <NuxtLink
          :to="`/kanban?project=${project.id}`"
          class="text-base font-semibold text-foreground hover:text-primary transition-colors block line-clamp-1 mb-1"
        >
          {{ project.name }}
        </NuxtLink>
        <p class="text-sm text-muted-foreground line-clamp-2 mb-5">
          {{ project.description || project.clientName }}
        </p>

        <!-- Progress -->
        <div class="space-y-1.5 mb-6">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-foreground">Progres</span>
            <span class="text-muted-foreground">{{ project.progressPercentage }}% ({{ project.completedTasks }}/{{ project.totalTasks }})</span>
          </div>
          <div class="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="getProgressColor(project.health)"
              :style="{ width: `${project.progressPercentage}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Footer: Team & Date & Link -->
      <div class="pt-4 border-t border-border/60 flex items-center justify-between gap-2">
        <MemberAvatarGroup :members="project.members" :max-visible="3" />

        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar class="w-3.5 h-3.5 text-muted-foreground" />
            {{ formatDate(project.dueDate) }}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            :icon="true"
            :icon-left="ChevronRight"
            title="Buka Kanban"
            @click="navigateTo(`/kanban?project=${project.id}`)"
          />
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card } from '~/components/ui/card'
import { Button, Badge } from '@kreavoks/kreaui'
import { Calendar, ChevronRight } from 'lucide-vue-next'
import MemberAvatarGroup from './MemberAvatarGroup.vue'
import type { Project, ProjectHealth, ProjectCategory } from '../types'

defineProps<{
  projects: Project[]
}>()

const getHealthBadgeVariant = (health: ProjectHealth): 'success' | 'warning' | 'error' | 'info' => {
  switch (health) {
    case 'ON_TRACK':
      return 'success'
    case 'AT_RISK':
      return 'warning'
    case 'DELAYED':
      return 'error'
    case 'COMPLETED':
      return 'info'
    default:
      return 'info'
  }
}

const formatHealthLabel = (health: ProjectHealth) => {
  switch (health) {
    case 'ON_TRACK':
      return 'On Track'
    case 'AT_RISK':
      return 'At Risk'
    case 'DELAYED':
      return 'Delayed'
    case 'COMPLETED':
      return 'Selesai'
    default:
      return health
  }
}

const formatCategory = (category: ProjectCategory) => {
  switch (category) {
    case 'WEB':
      return 'Web'
    case 'MOBILE':
      return 'Mobile'
    case 'BRANDING':
      return 'Branding'
    case 'MARKETING':
      return 'Marketing'
    case 'INTERNAL':
      return 'Internal'
    default:
      return category
  }
}

const getProgressColor = (health: ProjectHealth) => {
  switch (health) {
    case 'ON_TRACK':
      return 'bg-emerald-500'
    case 'AT_RISK':
      return 'bg-amber-500'
    case 'DELAYED':
      return 'bg-rose-500'
    case 'COMPLETED':
      return 'bg-sky-500'
    default:
      return 'bg-primary'
  }
}

const formatDate = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${day} ${months[parseInt(month) - 1]}`
  } catch {
    return dateStr
  }
}
</script>

