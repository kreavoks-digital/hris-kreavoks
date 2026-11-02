<template>
  <Card class="border border-border overflow-hidden bg-card/60 backdrop-blur-sm rounded-3xl">
    <CardHeader class="bg-muted/30 border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Users class="h-5 w-5 text-kv-primary" />
          <CardTitle class="text-base font-semibold text-foreground">Peserta Acara</CardTitle>
        </div>
        <Badge variant="secondary" size="sm">
          {{ selectedAttendeeIds.length }} Terpilih
        </Badge>
      </div>
      <CardDescription class="text-muted-foreground text-sm">Tugaskan karyawan yang perlu hadir.</CardDescription>
    </CardHeader>
    <CardContent class="p-6 space-y-4">
      
      <!-- Quick Preset Assign Buttons -->
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground font-medium">Pilih Cepat:</p>
        <div class="flex items-center gap-1.5 flex-wrap">
          <Badge
            :variant="activeRolePreset === 'ALL' ? 'primary' : 'secondary'"
            class="cursor-pointer transition-colors"
            @click="emit('assignRole', 'ALL')"
          >
            Semua
          </Badge>
          <Badge
            :variant="activeRolePreset === 'INTERN' ? 'primary' : 'secondary'"
            class="cursor-pointer transition-colors"
            @click="emit('assignRole', 'INTERN')"
          >
            Intern
          </Badge>
          <Badge
            :variant="activeRolePreset === 'MENTOR' ? 'primary' : 'secondary'"
            class="cursor-pointer transition-colors"
            @click="emit('assignRole', 'MENTOR')"
          >
            Mentor
          </Badge>
          <Badge
            :variant="activeRolePreset === 'ADMIN' ? 'primary' : 'secondary'"
            class="cursor-pointer transition-colors"
            @click="emit('assignRole', 'ADMIN')"
          >
            Admin
          </Badge>
          <button
            v-if="selectedAttendeeIds.length > 0"
            type="button"
            @click="emit('resetAttendees')"
            class="px-2 py-1 text-sm text-rose-500 hover:underline ml-auto font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Live Search Input -->
      <div class="relative">
        <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          :model-value="searchQuery"
          @update:model-value="(val: string | number) => emit('update:searchQuery', String(val))"
          placeholder="Cari nama, posisi, divisi, atau email..."
          class="h-11 pl-9 pr-8 rounded-2xl border-border focus:ring-kv-primary text-sm font-medium"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="emit('update:searchQuery', '')"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Selected Attendees Chips -->
      <div v-if="selectedUsersList.length > 0" class="space-y-2 pt-1">
        <p class="text-sm font-semibold text-muted-foreground">
          Peserta Terpilih ({{ selectedUsersList.length }}):
        </p>
        <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-border rounded-2xl bg-muted/20">
          <span
            v-for="u in selectedUsersList"
            :key="u.id"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card text-foreground text-sm border border-border font-medium"
          >
            <Avatar class="h-5 w-5 rounded-full">
              <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.fullName || u.email)}`" />
              <AvatarFallback class="text-xs">{{ (u.fullName || u.email).charAt(0) }}</AvatarFallback>
            </Avatar>
            <span class="truncate max-w-[130px]">{{ u.fullName }}</span>
            <button
              type="button"
              @click="emit('removeAttendee', u.id)"
              class="text-muted-foreground hover:text-rose-500 transition-colors ml-0.5"
              title="Hapus"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      </div>

      <!-- Candidate Users List -->
      <div class="space-y-2 pt-1">
        <div class="flex items-center justify-between text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <span>Daftar Karyawan:</span>
            <span class="font-medium text-foreground">
              ({{ filteredCandidates.length }})
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button
              v-if="filteredCandidates.length > 0"
              type="button"
              @click="emit('toggleSelectAllFiltered')"
              class="text-xs text-kv-primary hover:underline font-medium"
            >
              {{ allFilteredSelected ? 'Batal Pilih Semua' : 'Pilih Semua yang Tampil' }}
            </button>
            <span v-if="isLoadingCandidates" class="text-xs text-muted-foreground">
              Memuat data...
            </span>
          </div>
        </div>

        <div
          class="border border-border rounded-2xl max-h-[380px] overflow-y-auto divide-y divide-border bg-card"
          @scroll="(e) => emit('scrollCandidates', e)"
        >
          <div
            v-for="u in displayedCandidates"
            :key="u.id"
            @click="!isUserDisabled(u) && emit('toggleAttendee', u.id)"
            :class="[
              'px-3.5 py-3 flex items-center justify-between text-sm transition-colors',
              isUserDisabled(u)
                ? 'opacity-40 grayscale bg-muted/40 cursor-not-allowed select-none'
                : selectedAttendeeIds.includes(u.id)
                  ? 'bg-muted/60 cursor-pointer hover:bg-muted/70'
                  : 'hover:bg-muted/30 cursor-pointer'
            ]"
            :title="isUserDisabled(u) ? `Akun ${getUserStatusLabel(u)} - Tidak dapat ditambahkan ke agenda` : ''"
          >
            <!-- Left: Avatar & Details -->
            <div class="flex items-center gap-3 min-w-0 pr-2">
              <Avatar class="h-10 w-10 rounded-full border border-border shrink-0" :class="{ 'opacity-60': isUserDisabled(u) }">
                <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.fullName || u.email)}`" />
                <AvatarFallback class="bg-muted text-muted-foreground font-bold text-sm">
                  {{ (u.fullName || u.email).charAt(0).toUpperCase() }}
                </AvatarFallback>
              </Avatar>

              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p
                    class="font-medium text-foreground text-sm truncate leading-tight"
                    :class="{ 'line-through text-muted-foreground': isUserDisabled(u) }"
                  >
                    {{ u.fullName }}
                  </p>
                  <Badge
                    v-if="getUserStatusLabel(u)"
                    variant="outline"
                    class="text-[10px] px-1.5 py-0 h-4 border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-950/30"
                  >
                    {{ getUserStatusLabel(u) }}
                  </Badge>
                </div>

                <div class="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 truncate">
                  <span class="truncate">{{ u.position || u.division || u.role }}</span>
                  <span class="inline-block w-1 h-1 rounded-full bg-border shrink-0" />
                  <span class="truncate">{{ u.email }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Checkbox -->
            <div class="shrink-0 pl-2">
              <Checkbox
                :checked="selectedAttendeeIds.includes(u.id)"
                :disabled="isUserDisabled(u)"
                @click.stop
                @update:checked="() => !isUserDisabled(u) && emit('toggleAttendee', u.id)"
                class="rounded-md"
              />
            </div>
          </div>

          <div
            v-if="filteredCandidates.length === 0"
            class="p-8 text-center text-sm text-muted-foreground"
          >
            Tidak ada karyawan yang sesuai dengan kata kunci pencarian.
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Users, Search, X } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card'
import { Badge } from '@kreavoks/kreaui'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import type { CandidateUser } from '../types/calendar.types'

defineProps<{
  selectedAttendeeIds: number[]
  candidates: CandidateUser[]
  filteredCandidates: CandidateUser[]
  displayedCandidates: CandidateUser[]
  selectedUsersList: CandidateUser[]
  activeRolePreset: 'ALL' | 'INTERN' | 'MENTOR' | 'ADMIN' | null
  searchQuery: string
  isLoadingCandidates: boolean
  allFilteredSelected: boolean
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  assignRole: [role: 'ALL' | 'INTERN' | 'MENTOR' | 'ADMIN']
  resetAttendees: []
  toggleAttendee: [userId: number]
  removeAttendee: [userId: number]
  toggleSelectAllFiltered: []
  scrollCandidates: [event: Event]
}>()

const isUserDisabled = (u: CandidateUser) => {
  if (u.isActive === false) return true
  const st = (u.status || '').toUpperCase()
  return ['TERMINATED', 'SUSPENDED', 'RESIGNED'].includes(st)
}

const getUserStatusLabel = (u: CandidateUser) => {
  const st = (u.status || '').toUpperCase()
  if (st === 'TERMINATED') return 'Terminated'
  if (st === 'SUSPENDED') return 'Suspended'
  if (st === 'RESIGNED') return 'Resigned'
  if (u.isActive === false) return 'Nonaktif'
  return null
}
</script>
