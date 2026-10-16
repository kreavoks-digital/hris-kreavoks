<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-w-0 w-full max-w-full">
    <!-- Header Section -->
    <div class="flex items-center justify-between min-w-0 w-full">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <Button variant="ghost" size="icon" @click="handleBack" class="rounded-full w-9 h-9 sm:w-10 sm:h-10 text-muted-foreground hover:text-foreground hover:bg-accent shrink-0">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-semibold text-foreground truncate">Detail Calon Mentor</h1>
          <p class="text-muted-foreground text-xs sm:text-sm">Tinjau data calon mentor sebelum menentukan keputusan.</p>
        </div>
      </div>
    </div>

    <!-- Status Badge Banner -->
    <div v-if="formData.status !== 'PENDING'" class="p-4 rounded-xl flex items-center justify-between border" :class="{
      'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300': formData.status === 'APPROVED',
      'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300': formData.status === 'REJECTED'
    }">
      <div class="flex items-center gap-2">
        <CheckCircle2 v-if="formData.status === 'APPROVED'" class="h-5 w-5 text-emerald-600" />
        <X v-else class="h-5 w-5 text-rose-600" />
        <span class="font-medium text-sm">Pendaftaran ini sudah {{ formData.status === 'APPROVED' ? 'disetujui' : 'ditolak' }}.</span>
      </div>
    </div>

    <div class="space-y-8">
      <!-- 1. Data Pribadi & Kontak -->
      <MentorIdentityCard :application="formData" />

      <!-- 2. Keahlian & Portfolio -->
      <MentorExpertiseCard :application="formData" />

      <!-- 3. Rekening Pembayaran -->
      <MentorBankCard :application="formData" />

      <!-- Review Actions -->
      <!-- Viewer mode: tidak ada aksi -->
      <div v-if="isViewerMode" class="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
        <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        <span>Mode <strong>Lihat Saja</strong> — Anda hanya dapat melihat data ini.</span>
      </div>
      <!-- APPROVED: locked, show back only -->
      <!-- If already APPROVED -->
      <div v-else-if="formData.status === 'APPROVED'" class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4">
        <Button
          type="button"
          variant="outline"
          class="gap-2"
          @click="handleResendEmail"
          :disabled="sendingEmail || deleting"
        >
          <Loader2 v-if="sendingEmail" class="h-4 w-4 animate-spin" />
          <Mail v-else class="h-4 w-4" />
          Kirim Ulang Email
        </Button>
        <Button
          type="button"
          variant="outline"
          class="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20"
          @click="isDeleteDialogOpen = true"
          :disabled="deleting"
        >
          <Loader2 v-if="deleting" class="h-4 w-4 animate-spin" />
          <Trash2 v-else class="h-4 w-4" />
          Hapus
        </Button>
        <Button variant="ghost" class="px-6" @click="handleBack">Kembali</Button>
      </div>

      <!-- PENDING or REJECTED: allow review/re-review -->
      <div v-else class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-3 p-4">
        <!-- Kirim Ulang Email (jika REJECTED) -->
        <Button
          v-if="formData.status === 'REJECTED'"
          type="button"
          variant="outline"
          class="gap-2"
          @click="handleResendEmail"
          :disabled="sendingEmail || deleting"
        >
          <Loader2 v-if="sendingEmail" class="h-4 w-4 animate-spin" />
          <Mail v-else class="h-4 w-4" />
          Kirim Ulang Email
        </Button>
        <!-- Reset to PENDING (only for REJECTED) -->
        <Button
          v-if="formData.status === 'REJECTED'"
          type="button"
          variant="outline"
          class="px-6 text-amber-600 border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
          @click="reviewMentor('PENDING')"
          :disabled="loading || deleting"
        >
          Kembalikan ke Menunggu
        </Button>
        <!-- Reject -->
        <Button
          type="button"
          variant="outline"
          class="px-6 text-destructive border-destructive hover:bg-destructive/10"
          @click="reviewMentor('REJECTED')"
          :disabled="loading || deleting || formData.status === 'REJECTED'"
        >
          Tolak
        </Button>
        <!-- Approve -->
        <Button
          type="button"
          class="w-full sm:w-48 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
          @click="reviewMentor('APPROVED')"
          :disabled="loading || deleting"
        >
          <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          <CheckCircle2 v-else class="h-4 w-4" />
          Setujui
        </Button>
        <!-- Hapus -->
        <Button
          type="button"
          variant="outline"
          class="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20"
          @click="isDeleteDialogOpen = true"
          :disabled="loading || deleting"
        >
          <Loader2 v-if="deleting" class="h-4 w-4 animate-spin" />
          <Trash2 v-else class="h-4 w-4" />
          Hapus
        </Button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <KreaConfirmDialog
      v-model:open="isDeleteDialogOpen"
      title="Hapus Pendaftaran"
      :description="`Hapus pendaftaran ${formData?.name || ''}? Data yang dihapus tidak bisa dikembalikan.`"
      confirmText="Hapus"
      cancelText="Batal"
      variant="danger"
      @confirm="handleDeleteMentor"
    />
  </div>
</template>

<script setup lang="ts">
import { 
  ArrowLeft, 
  CheckCircle2,
  X,
  Loader2,
  Mail,
  Trash2
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { toast } from 'vue-sonner'
import { mentorApplicationApi, type MentorApplication } from '~/pages/employee/api/mentorApplication.api'
import MentorIdentityCard from '../components/MentorIdentityCard.vue'
import MentorExpertiseCard from '../components/MentorExpertiseCard.vue'
import MentorBankCard from '../components/MentorBankCard.vue'
import KreaConfirmDialog from '~/components/shared/KreaConfirmDialog.vue'

definePageMeta({
  layout: "default",
  middleware: ["auth", "admin"],
  title: "Detail Calon Mentor"
});

const { isViewerMode } = useViewerMode()

const route = useRoute();
const loading = ref(false);
const sendingEmail = ref(false);
const isDeleteDialogOpen = ref(false);
const deleting = ref(false);

const handleBack = () => {
  navigateTo('/employee/mentor');
};

const handleDeleteMentor = async () => {
  if (!formData.value?.id) return;
  deleting.value = true;
  try {
    const response = await mentorApplicationApi.deleteApplication(formData.value.id);
    if (response.success) {
      toast.success('Pendaftaran Dihapus', {
        description: `Pendaftaran ${formData.value.name} berhasil dihapus.`
      });
      navigateTo('/employee/mentor');
    }
  } catch (error: any) {
    toast.error('Gagal Menghapus', {
      description: error?.data?.message || 'Gagal menghapus pendaftaran mentor.'
    });
  } finally {
    deleting.value = false;
  }
};

const formData = ref<MentorApplication>({
  id: "",
  uuid: "",
  name: "",
  email: "",
  phone: "",
  currentJob: "",
  company: "",
  expertise: "",
  experience: "",
  portfolioLink: "",
  linkedinLink: "",
  cvFileUrl: "",
  ktpFileUrl: "",
  bankName: "",
  accountNumber: "",
  accountHolder: "",
  ktpNumber: "",
  npwpNumber: "",
  teachingAvailability: "",
  teachingExperience: "",
  bio: "",
  reason: "",
  status: "PENDING",
  createdAt: ""
});

const fetchDetail = async () => {
  const id = route.params.id as string;
  if (!id) return;
  
  loading.value = true;
  try {
    const response = await mentorApplicationApi.getApplicationDetail(id);
    if (response.success && response.data) {
      formData.value = response.data;
    } else {
      toast.error("Data tidak ditemukan");
      navigateTo("/employee");
    }
  } catch (error) {
    console.error("Error loading application detail:", error);
    toast.error("Gagal memuat data");
  } finally {
    loading.value = false;
  }
};

const reviewMentor = async (status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
  const id = route.params.id as string;
  const statusLabel = status === 'APPROVED' ? 'disetujui' : status === 'REJECTED' ? 'ditolak' : 'diubah ke menunggu';
  const toastTitle = status === 'APPROVED' ? 'Pendaftaran Disetujui' : status === 'REJECTED' ? 'Pendaftaran Ditolak' : 'Status Diperbarui';
  
  loading.value = true;
  try {
    const response = await mentorApplicationApi.reviewApplication(id, status);
    if (response.success) {
      toast.success(toastTitle, {
        description: `Pendaftaran mentor berhasil ${statusLabel}.`
      });
      await fetchDetail(); // Refresh data instead of navigating away
    }
  } catch (error: any) {
    toast.error("Gagal Memproses", {
      description: error?.data?.message || "Gagal memproses pendaftaran mentor."
    });
  } finally {
    loading.value = false;
  }
};

const handleResendEmail = async () => {
  if (!formData.value?.id) return;
  sendingEmail.value = true;
  try {
    const response = await mentorApplicationApi.resendEmail(formData.value.id);
    if (response.success) {
      toast.success('Email Terkirim', {
        description: `Email berhasil dikirim ulang ke ${formData.value.email}.`
      });
    }
  } catch (error: any) {
    toast.error('Gagal Mengirim Email', {
      description: error?.data?.message || 'Gagal mengirim ulang email.'
    });
  } finally {
    sendingEmail.value = false;
  }
};

onMounted(() => {
  fetchDetail();
});
</script>
