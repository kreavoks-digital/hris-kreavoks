<template>
  <Card class="border border-border bg-card overflow-hidden rounded-3xl shadow-none">
    <div class="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/50 hover:bg-muted/50 border-b border-border">
            <TableHead class="font-semibold text-sm text-foreground">Project Name</TableHead>
            <TableHead class="font-semibold text-sm text-foreground">Kategori</TableHead>
            <TableHead class="font-semibold text-sm text-foreground">Status</TableHead>
            <TableHead class="font-semibold text-sm text-foreground">Progres Task</TableHead>
            <TableHead class="font-semibold text-sm text-foreground">Project Lead</TableHead>
            <TableHead class="font-semibold text-sm text-foreground">Tim</TableHead>
            <TableHead class="font-semibold text-sm text-foreground">Deadline</TableHead>
            <TableHead class="text-right font-semibold text-sm text-foreground">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="project in projects"
            :key="project.id"
            class="hover:bg-accent/40 transition-colors border-b border-border last:border-0"
          >
            <!-- Project Name & Client -->
            <TableCell class="py-4">
              <div class="flex flex-col">
                <NuxtLink
                  :to="`/kanban?project=${project.id}`"
                  class="font-medium text-sm text-foreground hover:text-primary transition-colors truncate max-w-[260px]"
                  :title="project.name"
                >
                  {{ project.name }}
                </NuxtLink>
                <span class="text-xs text-muted-foreground mt-0.5 truncate max-w-[260px]">
                  {{ project.clientName }}
                </span>
              </div>
            </TableCell>

            <!-- Category -->
            <TableCell class="py-4">
              <Badge type="label" variant="outline" size="sm">
                {{ formatCategory(project.category) }}
              </Badge>
            </TableCell>

            <!-- Health Status -->
            <TableCell class="py-4">
              <Badge type="label" :variant="getHealthBadgeVariant(project.health)" size="sm">
                {{ formatHealthLabel(project.health) }}
              </Badge>
            </TableCell>

            <!-- Progress bar -->
            <TableCell class="py-4">
              <div class="flex flex-col gap-1.5 w-full max-w-[170px]">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-medium text-foreground">{{ project.progressPercentage }}%</span>
                  <span class="text-muted-foreground">{{ project.completedTasks }}/{{ project.totalTasks }} task</span>
                </div>
                <div class="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="getProgressColor(project.health)"
                    :style="{ width: `${project.progressPercentage}%` }"
                  />
                </div>
              </div>
            </TableCell>

            <!-- Lead -->
            <TableCell class="py-4">
              <div class="flex items-center gap-2">
                <Avatar class="h-7 w-7 border border-border">
                  <AvatarImage :src="project.lead.avatar" :alt="project.lead.name" />
                  <AvatarFallback class="text-xs">{{ project.lead.name.substring(0, 2).toUpperCase() }}</AvatarFallback>
                </Avatar>
                <span class="text-sm font-medium text-foreground truncate max-w-[120px]" :title="project.lead.name">
                  {{ project.lead.name }}
                </span>
              </div>
            </TableCell>

            <!-- Team Members -->
            <TableCell class="py-4">
              <MemberAvatarGroup :members="project.members" :max-visible="3" />
            </TableCell>

            <!-- Deadline -->
            <TableCell class="py-4">
              <div class="flex items-center gap-1.5 text-sm text-foreground/80">
                <Calendar class="h-3.5 w-3.5 text-muted-foreground" />
                <span>{{ formatDate(project.dueDate) }}</span>
              </div>
            </TableCell>

            <!-- Action Dropdown -->
            <TableCell class="py-4 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    :icon="true"
                    :icon-left="MoreHorizontal"
                    title="Menu opsi proyek"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-48 p-1.5 rounded-2xl bg-popover border border-border z-50 shadow-none">
                  <DropdownMenuItem
                    class="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-accent"
                    @click="navigateTo(`/kanban?project=${project.id}`)"
                  >
                    <Kanban class="w-4 h-4 text-muted-foreground" />
                    <span>Buka Kanban</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    class="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-accent"
                    @click="navigateTo(`/kanban?project=${project.id}&view=gantt`)"
                  >
                    <ChartNoAxesGantt class="w-4 h-4 text-muted-foreground" />
                    <span>Buka Timeline</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator class="my-1 border-border/50" />

                  <DropdownMenuItem
                    v-if="project.health !== 'ON_TRACK'"
                    class="flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl cursor-pointer hover:bg-accent text-emerald-600"
                    @click="$emit('change-health', project.id, 'ON_TRACK')"
                  >
                    Set On Track
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-if="project.health !== 'AT_RISK'"
                    class="flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl cursor-pointer hover:bg-accent text-amber-600"
                    @click="$emit('change-health', project.id, 'AT_RISK')"
                  >
                    Set At Risk
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-if="project.health !== 'COMPLETED'"
                    class="flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl cursor-pointer hover:bg-accent text-sky-600"
                    @click="$emit('change-health', project.id, 'COMPLETED')"
                  >
                    Set Selesai
                  </DropdownMenuItem>

                  <DropdownMenuSeparator class="my-1 border-border/50" />

                  <DropdownMenuItem
                    class="flex items-center gap-2 px-3 py-2 text-sm rounded-xl cursor-pointer hover:bg-destructive/10 text-destructive"
                    @click="$emit('delete-project', project.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                    <span>Hapus Proyek</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button, Badge } from '@kreavoks/kreaui'
import { Calendar, MoreHorizontal, Kanban, ChartNoAxesGantt, Trash2 } from 'lucide-vue-next'
import MemberAvatarGroup from './MemberAvatarGroup.vue'
import type { Project, ProjectHealth, ProjectCategory } from '../types'

defineProps<{
  projects: Project[]
}>()

defineEmits<{
  (e: 'change-health', id: string, health: ProjectHealth): void
  (e: 'delete-project', id: string): void
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
    return `${day} ${months[parseInt(month) - 1]} ${year}`
  } catch {
    return dateStr
  }
}
</script>

