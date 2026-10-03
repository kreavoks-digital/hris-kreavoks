<script setup lang="ts">
import { Search, X, Loader2, User, Building, Briefcase } from 'lucide-vue-next'
import { useColleagueSearch } from '~/composables/useColleagueSearch'
import StatusIndicator from '~/components/shared/StatusIndicator.vue'

const {
  searchQuery,
  searchResults,
  isSearching,
  isSearchModalOpen,
  closeSearchModal,
  handleQueryInput,
  viewProfile,
} = useColleagueSearch()

const inputRef = ref<HTMLInputElement | null>(null)

// Focus input saat modal dibuka
watch(isSearchModalOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

// Shortcut Keyboard: Ctrl+K / Cmd+K & Escape
onMounted(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      isSearchModalOpen.value = !isSearchModalOpen.value
    } else if (e.key === 'Escape' && isSearchModalOpen.value) {
      closeSearchModal()
    }
  }
  window.addEventListener('keydown', onKeyDown)
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
  })
})

const getInitials = (name: string) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isSearchModalOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-sm"
      @click.self="closeSearchModal"
    >
      <div
        class="w-full max-w-xl bg-card border border-border rounded-3xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <!-- Search Input Bar -->
        <div class="flex items-center px-4 py-3 border-b border-border gap-3">
          <Search class="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref="inputRef"
            :value="searchQuery"
            type="text"
            placeholder="Cari rekan kerja berdasarkan nama, posisi, atau divisi..."
            class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            @input="handleQueryInput(($event.target as HTMLInputElement).value)"
          />
          <Loader2 v-if="isSearching" class="w-4 h-4 text-kv-primary animate-spin shrink-0" />
          <button
            @click="closeSearchModal"
            class="p-1 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Tutup pencarian"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Results / Suggestions List -->
        <div class="max-h-[380px] overflow-y-auto p-2">
          <!-- Loading state -->
          <div v-if="isSearching && searchResults.length === 0" class="py-10 text-center">
            <Loader2 class="w-6 h-6 text-kv-primary animate-spin mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">Mencari rekan kerja...</p>
          </div>

          <!-- Empty search input state -->
          <div
            v-else-if="!searchQuery.trim()"
            class="py-10 text-center px-4 text-muted-foreground space-y-1"
          >
            <Search class="w-8 h-8 mx-auto opacity-30 mb-2" />
            <p class="text-sm font-medium text-foreground">Ketik nama atau divisi rekan kerja</p>
            <p class="text-sm text-muted-foreground">
              Tekan Enter atau klik karyawan untuk melihat profil publik dan status kehadiran.
            </p>
          </div>

          <!-- No results found -->
          <div
            v-else-if="searchResults.length === 0"
            class="py-10 text-center px-4 text-muted-foreground space-y-1"
          >
            <User class="w-8 h-8 mx-auto opacity-30 mb-2" />
            <p class="text-sm font-medium text-foreground">Tidak ditemukan rekan kerja</p>
            <p class="text-sm text-muted-foreground">
              Coba kata kunci lain atau periksa ejaan nama.
            </p>
          </div>

          <!-- Result Items -->
          <div v-else class="space-y-1">
            <button
              v-for="colleague in searchResults"
              :key="colleague.id"
              class="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-accent text-left transition-colors group"
              @click="viewProfile(colleague.id)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <!-- Avatar with status dot -->
                <div class="relative shrink-0">
                  <div
                    class="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-muted text-foreground text-sm font-semibold overflow-hidden"
                  >
                    <img
                      :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${colleague.fullName}`"
                      :alt="colleague.fullName"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <!-- Status Indicator -->
                  <div class="absolute -bottom-0.5 -right-0.5">
                    <StatusIndicator :status="colleague.effectiveStatus" size="md" />
                  </div>
                </div>

                <!-- Info -->
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-foreground truncate">
                      {{ colleague.fullName }}
                    </span>
                    <span
                      v-if="colleague.isSelf"
                      class="px-2 py-0.5 rounded-full bg-kv-primary/10 text-kv-primary text-xs font-medium shrink-0"
                    >
                      Anda
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-muted-foreground truncate mt-0.5">
                    <span class="flex items-center gap-1">
                      <Briefcase class="w-3 h-3" />
                      {{ colleague.position }}
                    </span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      <Building class="w-3 h-3" />
                      {{ colleague.department }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Right badge -->
              <div class="shrink-0 text-right ml-3 hidden sm:block">
                <StatusIndicator :status="colleague.effectiveStatus" :show-label="true" size="sm" />
              </div>
            </button>
          </div>
        </div>

        <!-- Footer / Keyboard hint -->
        <div class="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Gunakan panah untuk navigasi</span>
          <div class="flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Esc</kbd>
            <span>untuk menutup</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
