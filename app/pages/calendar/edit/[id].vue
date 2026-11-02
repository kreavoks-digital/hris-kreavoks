<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-28">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-semibold text-foreground truncate">
          {{ isAccessDenied ? 'Catatan Agenda' : 'Edit Jadwal' }}
        </h1>
        <p class="text-muted-foreground text-xs sm:text-sm mt-0.5 truncate">
          {{ isAccessDenied ? 'Informasi akses dokumen dan catatan pertemuan.' : 'Perbarui detail acara atau penugasan peserta.' }}
        </p>
      </div>

      <div v-if="!isAccessDenied" class="flex items-center gap-2.5 shrink-0 flex-wrap">
        <!-- Profile User Sedang View / Peserta (Avatar Stack) -->
        <EventHeaderViewers :viewers="activeViewers" />

        <Button
          v-if="isOrganizerOrAdmin || notesVisibility !== 'ORGANIZER_ONLY'"
          type="button"
          variant="outline"
          size="sm"
          :icon-left="Share2"
          label="Bagikan"
          :disabled="isLoadingData"
          @click="showShareModal = true"
        />

        <Button
          v-if="isOrganizerOrAdmin"
          type="button"
          variant="link"
          size="sm"
          :icon-left="Trash2"
          label="Hapus Jadwal"
          class="text-rose-500 hover:text-rose-600 underline hover:underline underline-offset-4 font-medium"
          :disabled="isSubmitting || isDeleting || isLoadingData"
          @click="showDeleteConfirm = true"
        />
      </div>
    </div>

    <!-- 1. Skeleton Loading State -->
    <EventEditSkeleton v-if="isLoadingData" />

    <!-- 2. Empty State: Akses Catatan Terkunci -->
    <EventAccessDenied v-else-if="isAccessDenied" />

    <!-- 3. Main Content: Tabs Navigation & Views -->
    <template v-else>
      <!-- Navigation Tabs with inline Notes Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-border/60 pb-1">
        <Tabs
          v-model="currentTab"
          :items="tabsList"
          variant="underline"
          size="md"
          class="mb-0"
        />

        <!-- Action & Status di sebelah kanan pojok sejajar tab notes -->
        <div v-if="currentTab === 'notes'" class="flex items-center gap-2.5 shrink-0">
          <span v-if="autoSaveStatus === 'saving'" class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-xl transition-all">
            <Loader2 class="w-3.5 h-3.5 animate-spin text-kv-primary" />
            <span class="hidden md:inline">Menyimpan otomatis...</span>
          </span>
          <span v-else-if="autoSaveStatus === 'saved'" class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-xl transition-all">
            <Check class="w-3.5 h-3.5 text-emerald-500" />
            <span class="hidden md:inline">Tersimpan</span>
          </span>
          <span v-else-if="autoSaveStatus === 'error'" class="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-xl transition-all">
            <AlertCircle class="w-3.5 h-3.5 text-rose-500" />
            <span class="hidden md:inline">Gagal simpan</span>
          </span>

          <!-- Akses Peserta Selector -->
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-muted-foreground hidden lg:inline">Akses:</span>
            <Select v-model="notesVisibility" :disabled="!isOrganizerOrAdmin">
              <SelectTrigger :disabled="!isOrganizerOrAdmin" class="h-8 min-w-[150px] sm:min-w-[180px] rounded-xl border-border bg-background text-xs font-medium text-foreground focus:ring-kv-primary disabled:opacity-60 disabled:cursor-not-allowed">
                <SelectValue placeholder="Pilih akses" />
              </SelectTrigger>
              <SelectContent class="rounded-xl">
                <SelectItem value="ORGANIZER_ONLY" class="text-xs">Hanya Penyelenggara</SelectItem>
                <SelectItem value="ATTENDEES_VIEW" class="text-xs">Peserta Hanya Lihat</SelectItem>
                <SelectItem value="ATTENDEES_EDIT" class="text-xs">Peserta Boleh Mengedit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Tombol Simpan Manual (KreaUI Icon Button) -->
          <KreaButton
            v-if="canEditNotes"
            type="button"
            variant="outline"
            size="sm"
            :icon="true"
            :icon-left="Save"
            :loading="isSavingNotes"
            class="shrink-0"
            @click="handleSaveNotes"
          />
        </div>
      </div>

      <!-- TAB 1: Detail Agenda Layout -->
      <div v-if="currentTab === 'detail'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

      <!-- TAB 2: Notes / Meeting Minutes -->
      <div v-if="currentTab === 'notes' && (isOrganizerOrAdmin || notesVisibility !== 'ORGANIZER_ONLY')" class="w-full pb-8">
        <TiptapEditor
          v-model="notesContent"
          :editable="canEditNotes"
          placeholder="Ketik '/' untuk menu format, atau mulai menulis catatan rapat..."
          min-height="650px"
        />
      </div>

      <!-- Fixed Bottom Action Bar -->
      <div
        v-if="currentTab === 'detail' && isOrganizerOrAdmin"
        :class="[
          'fixed bottom-0 right-0 z-30 transition-all duration-300 ease-in-out border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 sm:px-8 sm:py-3.5 shadow-lg',
          isSidebarCollapsed ? 'left-0 lg:left-[76px]' : 'left-0 lg:left-[240px]'
        ]"
      >
        <div class="max-w-7xl mx-auto flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            :disabled="isSubmitting || isDeleting"
            @click="navigateTo('/calendar')"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            :loading="isSubmitting"
            :disabled="isLoadingData || isDeleting"
            @click="handleSubmit"
          >
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </template>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="showDeleteConfirm" @update:open="(val: boolean) => showDeleteConfirm = val">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Hapus Jadwal</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus jadwal <strong class="text-foreground">"{{ form.title || 'acara ini' }}"</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeleting" @click="showDeleteConfirm = false">Batal</AlertDialogCancel>
          <AlertDialogAction
            :disabled="isDeleting"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="handleDelete"
          >
            {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus Jadwal' }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Figma Style Share Modal -->
    <ShareModal
      v-if="rawEventData"
      v-model:open="showShareModal"
      :event="rawEventData"
      :can-manage-settings="isOrganizerOrAdmin"
      @updated="loadEventDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { definePageMeta, navigateTo } from '#imports'
import { Share2, Trash2, Loader2, Check, AlertCircle, Save } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Button as KreaButton, Tabs } from '@kreavoks/kreaui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/components/ui/alert-dialog'
import ShareModal from '../components/ShareModal.vue'
import TiptapEditor from '../components/TiptapEditor.vue'
import EventHeaderViewers from '../components/EventHeaderViewers.vue'
import EventEditSkeleton from '../components/EventEditSkeleton.vue'
import EventAccessDenied from '../components/EventAccessDenied.vue'
import EventDetailFormCard from '../components/EventDetailFormCard.vue'
import EventAttendeePickerCard from '../components/EventAttendeePickerCard.vue'
import { useEventEdit } from '../hooks/useEventEdit'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const {
  isSidebarCollapsed,
  showDeleteConfirm,
  showShareModal,
  isDeleting,
  isSubmitting,
  isLoadingData,
  currentTab,
  rawEventData,
  isOrganizerOrAdmin,
  isAccessDenied,
  tabsList,
  canEditNotes,
  activeViewers,
  form,
  startDateOnly,
  startTimeOnly,
  endDateOnly,
  endTimeOnly,
  activeDurationMinutes,
  durationPresets,
  presetColors,
  eventTypeOptions,
  applyDurationPreset,
  candidates,
  isLoadingCandidates,
  searchQuery,
  selectedAttendeeIds,
  activeRolePreset,
  filteredCandidates,
  displayedCandidates,
  selectedUsersList,
  allFilteredSelected,
  toggleAttendee,
  removeAttendee,
  resetAttendees,
  assignRoleUsers,
  toggleSelectAllFiltered,
  onCandidatesScroll,
  notesContent,
  notesVisibility,
  isSavingNotes,
  autoSaveStatus,
  handleSaveNotes,
  loadEventDetail,
  handleSubmit,
  handleDelete
} = useEventEdit()
</script>
