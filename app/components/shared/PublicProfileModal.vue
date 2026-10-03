<script setup lang="ts">
import {
  X,
  Mail,
  Phone,
  Building,
  Briefcase,
  IdCard,
  Calendar,
  MessageCircle,
  Clock,
  UserCheck,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-vue-next'
import { useColleagueSearch } from '~/composables/useColleagueSearch'
import { usePublicProfile } from '~/composables/usePublicProfile'
import { getStatusConfig } from '~/composables/usePresence'
import StatusIndicator from '~/components/shared/StatusIndicator.vue'

const { isProfileModalOpen, activeProfileUserId, closeProfileModal, viewProfile } = useColleagueSearch()
const { profile, isLoading, error, fetchProfile, clearProfile } = usePublicProfile()

watch(
  [isProfileModalOpen, activeProfileUserId],
  ([isOpen, userId]) => {
    if (isOpen && userId) {
      fetchProfile(userId)
    } else if (!isOpen) {
      clearProfile()
    }
  },
  { immediate: true }
)

const formatTimeOnly = (dateStr: string | null) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' WIB'
  } catch {
    return '-'
  }
}

const formatLastActive = (dateStr: string | null, effectiveStatus: string) => {
  if (effectiveStatus === 'AVAILABLE') return 'Aktif sekarang'
  if (!dateStr) return 'Belum ada aktivitas hari ini'
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    if (diffMinutes < 1) return 'Aktif semenit lalu'
    if (diffMinutes < 60) return `Aktif ${diffMinutes} menit yang lalu`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Aktif ${diffHours} jam yang lalu`
    return 'Offline'
  } catch {
    return 'Offline'
  }
}

const statusConfig = computed(() => {
  return getStatusConfig(profile.value?.effectiveStatus)
})
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isProfileModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      @click.self="closeProfileModal"
    >
      <div
        class="w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <span class="text-sm font-semibold text-muted-foreground">Profil Karyawan</span>
          <button
            @click="closeProfileModal"
            class="p-1.5 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Tutup profil"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body Content -->
        <div class="overflow-y-auto p-6 space-y-6">
          <!-- Loading State -->
          <div v-if="isLoading" class="py-16 text-center space-y-3">
            <Loader2 class="w-8 h-8 text-kv-primary animate-spin mx-auto" />
            <p class="text-sm text-muted-foreground">Memuat profil rekan kerja...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="py-12 text-center space-y-3">
            <AlertCircle class="w-8 h-8 text-destructive mx-auto" />
            <p class="text-sm font-medium text-foreground">{{ error }}</p>
            <button
              @click="closeProfileModal"
              class="px-4 py-2 rounded-3xl bg-accent text-sm font-medium text-foreground hover:bg-accent/80 transition-colors"
            >
              Tutup
            </button>
          </div>

          <!-- Profile Details -->
          <div v-else-if="profile" class="space-y-6">
            <!-- Header Section: Avatar, Status, Name, Position -->
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <!-- Avatar with Status Indicator -->
              <div class="relative shrink-0">
                <div class="w-20 h-20 rounded-full border-2 border-border overflow-hidden bg-muted">
                  <img
                    :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`"
                    :alt="profile.fullName"
                    class="w-full h-full object-cover"
                  />
                </div>
                <!-- Large Status Indicator Dot -->
                <div class="absolute bottom-0 right-0">
                  <StatusIndicator :status="profile.effectiveStatus" size="xl" />
                </div>
              </div>

              <!-- Main Info -->
              <div class="space-y-1 min-w-0 flex-1">
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 class="text-lg font-bold text-foreground">{{ profile.fullName }}</h3>
                  <span
                    v-if="profile.isSelf"
                    class="px-2.5 py-0.5 rounded-full bg-kv-primary/10 text-kv-primary text-xs font-medium"
                  >
                    Profil Anda
                  </span>
                </div>

                <p class="text-sm font-medium text-muted-foreground">
                  {{ profile.position }}
                </p>

                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground pt-1">
                  <span class="flex items-center gap-1">
                    <Building class="w-3.5 h-3.5" />
                    {{ profile.department }}
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <IdCard class="w-3.5 h-3.5" />
                    NPK: {{ profile.npk }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Presence & Status Message Box -->
            <div
              :class="[
                'p-4 rounded-3xl border border-border flex items-center justify-between',
                statusConfig.badgeBg,
              ]"
            >
              <div class="flex items-center gap-3">
                <StatusIndicator :status="profile.effectiveStatus" size="md" />
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-foreground">
                      {{ statusConfig.label }}
                    </span>
                    <span v-if="profile.statusMessage" class="text-sm text-muted-foreground">
                      — "{{ profile.statusMessage }}"
                    </span>
                  </div>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ formatLastActive(profile.lastActiveAt, profile.effectiveStatus) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Today Attendance Status Box -->
            <div class="p-4 rounded-3xl border border-border bg-muted/20 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UserCheck class="w-4 h-4 text-kv-primary" />
                  <span class="text-sm font-semibold text-foreground">Presensi Hari Ini</span>
                </div>
                <span
                  v-if="profile.todayAttendance"
                  class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                  {{ profile.todayAttendance.status === 'PRESENT' ? 'Hadir' : profile.todayAttendance.status }}
                </span>
                <span
                  v-else
                  class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                >
                  Belum Presensi
                </span>
              </div>

              <div v-if="profile.todayAttendance" class="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span class="text-muted-foreground block">Jam Masuk (Clock In):</span>
                  <span class="text-foreground font-semibold">
                    {{ formatTimeOnly(profile.todayAttendance.clockIn) }}
                  </span>
                </div>
                <div>
                  <span class="text-muted-foreground block">Jam Pulang (Clock Out):</span>
                  <span class="text-foreground font-semibold">
                    {{ formatTimeOnly(profile.todayAttendance.clockOut) }}
                  </span>
                </div>
              </div>
              <div v-else class="text-xs text-muted-foreground pt-1">
                Karyawan ini belum melakukan pencatatan kehadiran untuk hari ini.
              </div>
            </div>

            <!-- Contact & Social Details -->
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-foreground">Kontak & Informasi</h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <!-- Email -->
                <a
                  :href="`mailto:${profile.email}`"
                  class="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card hover:bg-accent transition-colors text-left"
                >
                  <div class="w-8 h-8 rounded-full bg-kv-primary/10 flex items-center justify-center shrink-0">
                    <Mail class="w-4 h-4 text-kv-primary" />
                  </div>
                  <div class="min-w-0">
                    <span class="text-xs text-muted-foreground block">Email Kantor</span>
                    <span class="text-xs font-semibold text-foreground truncate block">
                      {{ profile.email }}
                    </span>
                  </div>
                </a>

                <!-- Phone / WhatsApp -->
                <a
                  v-if="profile.phone"
                  :href="`https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card hover:bg-accent transition-colors text-left"
                >
                  <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <MessageCircle class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div class="min-w-0">
                    <span class="text-xs text-muted-foreground block">WhatsApp / Telp</span>
                    <span class="text-xs font-semibold text-foreground truncate block">
                      {{ profile.phone }}
                    </span>
                  </div>
                </a>
                <div
                  v-else
                  class="flex items-center gap-3 p-3 rounded-2xl border border-border bg-muted/30 text-left opacity-70"
                >
                  <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Phone class="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div class="min-w-0">
                    <span class="text-xs text-muted-foreground block">Nomor Telepon</span>
                    <span class="text-xs text-muted-foreground block">Belum dicantumkan</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mentorship Connection Section -->
            <div v-if="profile.mentors.length > 0" class="space-y-2">
              <h4 class="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users class="w-4 h-4 text-kv-primary" />
                Mentor Pembimbing
              </h4>
              <div class="space-y-1.5">
                <button
                  v-for="mentor in profile.mentors"
                  :key="mentor.id"
                  class="w-full flex items-center justify-between p-2.5 rounded-2xl border border-border hover:bg-accent text-left transition-colors"
                  @click="viewProfile(mentor.id)"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-full bg-muted border border-border overflow-hidden shrink-0">
                      <img
                        :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.fullName}`"
                        :alt="mentor.fullName"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div class="min-w-0">
                      <span class="text-xs font-semibold text-foreground truncate block">
                        {{ mentor.fullName }}
                      </span>
                      <span class="text-xs text-muted-foreground truncate block">
                        {{ mentor.position }}
                      </span>
                    </div>
                  </div>
                  <span class="text-xs text-kv-primary font-medium shrink-0">Lihat Profil &rarr;</span>
                </button>
              </div>
            </div>

            <div v-if="profile.interns.length > 0" class="space-y-2">
              <h4 class="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users class="w-4 h-4 text-kv-primary" />
                Daftar Mahasiswa Bimbingan (Interns)
              </h4>
              <div class="space-y-1.5">
                <button
                  v-for="intern in profile.interns"
                  :key="intern.id"
                  class="w-full flex items-center justify-between p-2.5 rounded-2xl border border-border hover:bg-accent text-left transition-colors"
                  @click="viewProfile(intern.id)"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-full bg-muted border border-border overflow-hidden shrink-0">
                      <img
                        :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${intern.fullName}`"
                        :alt="intern.fullName"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div class="min-w-0">
                      <span class="text-xs font-semibold text-foreground truncate block">
                        {{ intern.fullName }}
                      </span>
                      <span class="text-xs text-muted-foreground truncate block">
                        {{ intern.institution }}
                      </span>
                    </div>
                  </div>
                  <span class="text-xs text-kv-primary font-medium shrink-0">Lihat Profil &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-border flex justify-end bg-muted/20">
          <button
            @click="closeProfileModal"
            class="px-5 py-2.5 rounded-3xl bg-accent text-sm font-medium text-foreground hover:bg-accent/80 transition-colors"
          >
            Tutup
          </button>
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
