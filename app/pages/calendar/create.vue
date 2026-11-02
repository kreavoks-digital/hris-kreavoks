<template>
  <div class="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Buat Jadwal Baru</h1>
        <p class="text-muted-foreground text-sm mt-0.5">Atur agenda rapat atau kegiatan kerja tim.</p>
      </div>
    </div>

    <!-- Main Content: 2-Column Scheduling Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- LEFT COLUMN: Event Details Form Card -->
      <div class="lg:col-span-7">
        <EventDetailFormCard
          :form="form"
          v-model:start-date-only="startDateOnly"
          v-model:start-time-only="startTimeOnly"
          v-model:end-date-only="endDateOnly"
          v-model:end-time-only="endTimeOnly"
          :active-duration-minutes="activeDurationMinutes"
          :duration-presets="durationPresets"
          :preset-colors="presetColors"
          :event-type-options="eventTypeOptions"
          @apply-duration-preset="applyDurationPreset"
        />
      </div>

      <!-- RIGHT COLUMN: Attendee Selection Card -->
      <div class="lg:col-span-5 space-y-6">
        <EventAttendeePickerCard
          :selected-attendee-ids="selectedAttendeeIds"
          :candidates="candidates"
          :filtered-candidates="filteredCandidates"
          :displayed-candidates="displayedCandidates"
          :selected-users-list="selectedUsersList"
          :active-role-preset="activeRolePreset"
          v-model:search-query="searchQuery"
          :is-loading-candidates="isLoadingCandidates"
          :all-filtered-selected="allFilteredSelected"
          @assign-role="assignRoleUsers"
          @reset-attendees="resetAttendees"
          @toggle-attendee="toggleAttendee"
          @remove-attendee="removeAttendee"
          @toggle-select-all-filtered="toggleSelectAllFiltered"
          @scroll-candidates="onCandidatesScroll"
        />
      </div>
    </div>

    <!-- Fixed Bottom Action Bar -->
    <div
      :class="[
        'fixed bottom-0 right-0 z-30 transition-all duration-300 ease-in-out border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 sm:px-8 sm:py-3.5',
        isSidebarCollapsed ? 'left-0 lg:left-[76px]' : 'left-0 lg:left-[240px]'
      ]"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          label="Batal"
          :disabled="isSubmitting"
          @click="navigateTo('/calendar')"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          label="Buat Jadwal"
          :loading="isSubmitting"
          @click="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@kreavoks/kreaui'
import EventDetailFormCard from './components/EventDetailFormCard.vue'
import EventAttendeePickerCard from './components/EventAttendeePickerCard.vue'
import { useEventCreate } from './hooks/useEventCreate'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const {
  isSidebarCollapsed,
  isSubmitting,
  isLoadingCandidates,
  candidates,
  searchQuery,
  selectedAttendeeIds,
  activeRolePreset,
  startDateOnly,
  startTimeOnly,
  endDateOnly,
  endTimeOnly,
  form,
  eventTypeOptions,
  presetColors,
  durationPresets,
  activeDurationMinutes,
  filteredCandidates,
  displayedCandidates,
  selectedUsersList,
  allFilteredSelected,
  applyDurationPreset,
  onCandidatesScroll,
  toggleSelectAllFiltered,
  toggleAttendee,
  removeAttendee,
  resetAttendees,
  assignRoleUsers,
  handleSubmit
} = useEventCreate()
</script>
