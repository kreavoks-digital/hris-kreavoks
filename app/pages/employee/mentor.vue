<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Pendaftaran Mentor</h1>
        <p class="text-muted-foreground mt-1 text-sm">Kelola pendaftaran mentor dari Kreavoks Portal.</p>
      </div>
    </div>

    <!-- Info banner for mentor tab -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-kv-primary/10 border border-kv-primary/20 rounded-xl">
      <div class="flex items-start gap-3">
        <Info class="h-5 w-5 text-kv-primary mt-0.5 flex-shrink-0" />
        <div>
          <p class="text-sm font-medium text-kv-primary">Pendaftaran Mentor Lintas Aplikasi (Portal)</p>
          <p class="text-sm text-muted-foreground mt-0.5">
            Mentor di bawah ini mendaftar melalui Kreavoks Portal. Setujui untuk membuat akun di HRIS secara otomatis &amp; memicu sinkronisasi provisioning akun ke Portal.
          </p>
        </div>
      </div>
      <!-- Filter Status -->
      <div class="flex gap-1 p-1 bg-background/60 rounded-lg flex-shrink-0 self-start sm:self-center">
        <button
          v-for="opt in mentorStatusOptions"
          :key="opt.value"
          @click="mentorStatusFilter = opt.value; page = 1; fetchMentorApplications()"
          :class="[
            'px-3 py-1 rounded-md text-xs font-medium transition-all duration-150',
            mentorStatusFilter === opt.value
              ? 'bg-kv-primary text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          ]"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <Card class="border border-border bg-card overflow-hidden rounded-3xl">
      <MentorApplicationTable
        :applications="mentorApplications"
        :verifying-id="verifyingId"
        :loading="loading"
        @review="reviewMentor"
        @delete="confirmDeleteMentor"
      />
    </Card>

    <!-- Pagination Section -->
    <EmployeePagination
      v-if="totalPages > 1"
      v-model:page="page"
      :total-pages="totalPages"
      :total-items="totalItems"
      :limit="limit"
    />

    <!-- Delete Confirmation Modal -->
    <KreaConfirmDialog
      v-model:open="isDeleteDialogOpen"
      title="Hapus Pendaftaran Mentor?"
      :description="`Apakah Anda yakin ingin menghapus pendaftaran ${selectedAppToDelete?.name} secara permanen? Tindakan ini juga akan menghapus file yang dilampirkan dari cloud storage dan tidak dapat dibatalkan.`"
      confirmText="Hapus Permanen"
      cancelText="Batal"
      variant="danger"
      @confirm="handleDeleteMentor"
    />
  </div>
</template>

<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { toast } from 'vue-sonner'
import { mentorApplicationApi, type MentorApplication } from '~/pages/employee/api/mentorApplication.api'

import MentorApplicationTable from './components/MentorApplicationTable.vue'
import EmployeePagination from './components/EmployeePagination.vue'
import KreaConfirmDialog from '~/components/shared/KreaConfirmDialog.vue'

definePageMeta({
  layout: "default",
  middleware: ["auth", "admin"],
  title: "Pendaftaran Mentor"
});

const loading = ref(false)
const page = ref(1)
const limit = ref(15)
const totalItems = ref(0)
const totalPages = ref(1)

const verifyingId = ref<string | number | null>(null)
const mentorApplications = ref<MentorApplication[]>([])

// State for Mentor Deletion
const isDeleteDialogOpen = ref(false)
const selectedAppToDelete = ref<MentorApplication | null>(null)

const mentorStatusFilter = ref<'' | 'PENDING' | 'APPROVED' | 'REJECTED'>('')

const fetchMentorApplications = async () => {
  loading.value = true
  try {
    const response = await mentorApplicationApi.getApplications(page.value, limit.value, '', mentorStatusFilter.value)
    if (response.success && response.data) {
      mentorApplications.value = response.data.applications
      if (response.data.pagination) {
        totalItems.value = response.data.pagination.totalItems
        totalPages.value = response.data.pagination.totalPages
      }
    }
  } catch (error) {
    console.error('Failed to load mentor applications', error)
  } finally {
    loading.value = false
  }
}

watch([page], () => {
  fetchMentorApplications()
})

const mentorStatusOptions = [
  { label: 'Semua', value: '' as const },
  { label: 'Menunggu', value: 'PENDING' as const },
  { label: 'Disetujui', value: 'APPROVED' as const },
  { label: 'Ditolak', value: 'REJECTED' as const },
]

const confirmDeleteMentor = (app: MentorApplication) => {
  selectedAppToDelete.value = app
  isDeleteDialogOpen.value = true
}

const handleDeleteMentor = async () => {
  if (!selectedAppToDelete.value) return
  
  verifyingId.value = selectedAppToDelete.value.id
  try {
    const response = await mentorApplicationApi.deleteApplication(selectedAppToDelete.value.id)
    if (response.success) {
      toast.success('Pendaftaran Dihapus', {
        description: `Pendaftaran ${selectedAppToDelete.value.name} telah dihapus permanen.`
      })
      fetchMentorApplications()
    }
  } catch (error: any) {
    toast.error('Gagal Menghapus', {
      description: error?.data?.message || 'Terjadi kesalahan saat menghapus pendaftaran mentor.'
    })
  } finally {
    verifyingId.value = null
    selectedAppToDelete.value = null
  }
}

const reviewMentor = async (id: string | number, status: 'APPROVED' | 'REJECTED') => {
  verifyingId.value = id
  const actionText = status === 'APPROVED' ? 'menyetujui' : 'menolak'
  
  try {
    const response = await mentorApplicationApi.reviewApplication(id, status)
    if (response.success) {
      toast.success(`Pendaftaran ${status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}`, {
        description: `Mentor berhasil di-${actionText} dan provisioning data dijalankan.`
      })
      fetchMentorApplications()
    }
  } catch (error: any) {
    toast.error('Gagal memproses keputusan', {
      description: error?.data?.message || 'Terjadi masalah koneksi dengan backend HRIS.'
    })
  } finally {
    verifyingId.value = null
  }
}

onMounted(() => {
  fetchMentorApplications();
});
</script>
