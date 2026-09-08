<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Template Surat</h1>
        <p class="text-muted-foreground mt-1 text-sm">Kelola template surat resmi perusahaan.</p>
      </div>
      <Button v-if="canPerformActions" @click="openAdd" class="gap-2 bg-kv-primary hover:bg-kv-primary/90 text-white border-none">
        <FileText class="h-4 w-4" />
        Buat Template
      </Button>
    </div>



    <!-- Table Section -->
    <Card class="border border-border bg-card overflow-hidden rounded-3xl">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent border-border">
            <TableHead class="font-medium">No. Surat</TableHead>
            <TableHead class="font-medium">Nama Surat</TableHead>
            <TableHead class="font-medium">Tipe</TableHead>
            <TableHead class="font-medium">Pembuat</TableHead>
            <TableHead class="font-medium">Tanggal</TableHead>
            <TableHead class="text-right font-medium">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell colspan="6" class="text-center">
                <Skeleton class="h-8 w-full" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="templateLetters.length === 0">
            <TableRow>
              <TableCell colspan="6" class="text-center text-muted-foreground py-8">
                Belum ada template surat yang dibuat.
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow v-for="letter in templateLetters" :key="letter.id" class="border-border hover:bg-muted/50 transition-colors">
              <TableCell class="font-medium text-foreground whitespace-nowrap">
                <Badge variant="outline" class="bg-muted text-muted-foreground font-mono">
                  {{ letter.letterNumber || 'TEMPLATE' }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="font-medium text-foreground">{{ letter.title }}</div>
                <a v-if="letter.fileUrl" :href="letter.fileUrl" target="_blank" class="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                  <Link class="h-3 w-3" /> Buka File/Link
                </a>
              </TableCell>
              <TableCell>
                <Badge class="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-transparent">
                  {{ getLetterTypeLabel(letter.type) }}
                </Badge>
              </TableCell>
              <TableCell class="text-muted-foreground text-sm">
                {{ letter.user?.profile?.fullName || 'Sistem' }}
              </TableCell>
              <TableCell class="text-muted-foreground text-sm whitespace-nowrap">
                {{ new Date(letter.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}
              </TableCell>
              <TableCell class="text-right flex items-center justify-end gap-1">
                <template v-if="canPerformActions">
                  <Button variant="ghost" size="icon" class="text-blue-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/20" @click="openEdit(letter)">
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/20" @click="confirmDelete(letter)">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </template>
                <span v-else class="text-xs text-muted-foreground italic">View only</span>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </Card>

    <!-- Add/Edit Modal -->
    <Dialog :open="showModal" @update:open="showModal = $event">
      <DialogContent class="sm:max-w-[1200px] w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader class="shrink-0">
          <DialogTitle>{{ modalMode === 'edit' ? 'Edit Surat' : 'Buat Surat Baru' }}</DialogTitle>
          <DialogDescription>
            Pilih tipe surat untuk generate nomor surat otomatis secara increment.
            <template v-if="modalMode === 'edit'"> Mengubah tipe surat akan men-generate ulang nomor surat.</template>
          </DialogDescription>
        </DialogHeader>
        
        <form @submit.prevent="submitLetter" class="mt-4 flex-1 flex flex-col min-h-0">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
            <div class="space-y-4 overflow-y-auto pr-2">
              <div class="space-y-2">
                <Label for="type">Tipe Surat</Label>
                <Select v-model="formData.type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe surat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MENTOR_WORKSHOP">Surat Perjanjian Mentor Workshop</SelectItem>
                    <SelectItem value="INTERN_AGREEMENT">Surat Perjanjian Magang/Internship</SelectItem>
                    <SelectItem value="INTERN_ACCEPTANCE">Surat Penerimaan Magang</SelectItem>
                    <SelectItem value="PROJECT_AGREEMENT">Surat Perjanjian Kerjasama Project (SPK)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label for="title">Nama / Judul Surat</Label>
                <Input id="title" v-model="formData.title" placeholder="Contoh: MOU Temanumrah - Nabila" required />
              </div>

              <div class="space-y-2">
                <Label for="fileUrl">Link File (Opsional)</Label>
                <Input id="fileUrl" v-model="formData.fileUrl" placeholder="Link Google Drive atau Docs" />
                <p class="text-xs text-muted-foreground">Tautkan dokumen online yang bersangkutan dengan surat ini.</p>
              </div>


            </div>

            <!-- Preview Iframe -->
            <div class="border border-border rounded-xl bg-muted/20 overflow-hidden flex flex-col items-center justify-center h-full min-h-[300px]">
              <iframe v-if="previewUrl" :src="previewUrl" class="w-full h-full border-0" allow="autoplay"></iframe>
              <div v-else class="text-muted-foreground flex flex-col items-center gap-2 p-6 text-center">
                <FileText class="w-10 h-10 opacity-30" />
                <p class="text-sm">Preview dokumen akan muncul di sini setelah link dimasukkan.</p>
              </div>
            </div>
          </div>

          <DialogFooter class="mt-6 shrink-0">
            <Button type="button" variant="outline" @click="showModal = false" :disabled="submitting">Batal</Button>
            <Button type="submit" class="bg-kv-primary hover:bg-kv-primary/90 text-white" :disabled="submitting">
              <Loader2 v-if="submitting" class="h-4 w-4 mr-2 animate-spin" />
              {{ modalMode === 'edit' ? 'Simpan Perubahan' : 'Buat Surat' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <!-- Delete Confirmation Alert Dialog -->
    <AlertDialog :open="showDeleteDialog" @update:open="(v) => showDeleteDialog = v">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus template "{{ letterToDelete?.title }}"?
            <br/><br/>
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false">Batal</AlertDialogCancel>
          <AlertDialogAction @click="executeDelete" class="bg-rose-500 hover:bg-rose-600 text-white border-none">Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { FileText, Link, Trash2, Loader2, Edit } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '~/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Switch } from '~/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '~/components/ui/alert-dialog'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: "default",
  middleware: ["auth", "admin"],
});

const { canPerformActions } = useViewerMode()

const api = useApi();
const loading = ref(true);
const submitting = ref(false);
const letters = ref<any[]>([]);
const showModal = ref(false);
const modalMode = ref<'add'|'edit'>('add');

const showDeleteDialog = ref(false);
const letterToDelete = ref<any>(null);

const formData = ref({
  id: null as number | null,
  title: '',
  type: '',
  fileUrl: '',
  isTemplate: false
});

const regularLetters = computed(() => letters.value.filter((l: any) => !l.isTemplate));
const templateLetters = computed(() => letters.value.filter((l: any) => l.isTemplate));

const previewUrl = computed(() => {
  if (!formData.value.fileUrl) return '';
  let url = formData.value.fileUrl;
  
  if (url.includes('docs.google.com') && url.includes('/edit')) {
    return url.replace('/edit', '/preview').split('?')[0];
  }
  if (url.includes('drive.google.com') && url.includes('/view')) {
    return url.replace('/view', '/preview').split('?')[0];
  }
  return url;
});

const getLetterTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'MENTOR_WORKSHOP': 'Mentor Workshop',
    'INTERN_AGREEMENT': 'Perjanjian Magang',
    'INTERN_ACCEPTANCE': 'Penerimaan Magang',
    'PROJECT_AGREEMENT': 'Kerjasama Project (SPK)'
  };
  return map[type] || type;
};

const fetchLetters = async () => {
  loading.value = true;
  try {
    const response = await api('/letters' as any);
    if (response.success) {
      letters.value = response.data;
    }
  } catch (error: any) {
    toast.error('Gagal memuat surat', { description: error?.data?.message || 'Terjadi kesalahan' });
  } finally {
    loading.value = false;
  }
};

const openAdd = () => {
  modalMode.value = 'add';
  formData.value = { id: null, title: '', type: '', fileUrl: '', isTemplate: true };
  showModal.value = true;
};

const openEdit = (letter: any) => {
  modalMode.value = 'edit';
  formData.value = {
    id: letter.id,
    title: letter.title,
    type: letter.type,
    fileUrl: letter.fileUrl || '',
    isTemplate: letter.isTemplate || false
  };
  showModal.value = true;
};

const submitLetter = async () => {
  if (!formData.value.type || !formData.value.title) {
    toast.error('Data belum lengkap', { description: 'Pastikan tipe dan judul surat sudah diisi.' });
    return;
  }
  
  submitting.value = true;
  try {
    const isEdit = modalMode.value === 'edit';
    const endpoint = isEdit ? `/letters/${formData.value.id}` : '/letters';
    
    const response = await api(endpoint as any, {
      method: isEdit ? 'PUT' : 'POST',
      body: {
        title: formData.value.title,
        type: formData.value.type,
        fileUrl: formData.value.fileUrl,
        isTemplate: formData.value.isTemplate
      }
    });
    
    if (response.success) {
      toast.success(isEdit ? 'Template Berhasil Diperbarui' : 'Template Berhasil Dibuat', { 
        description: `Template "${response.data.title}" telah disimpan.` 
      });
      showModal.value = false;
      fetchLetters();
    }
  } catch (error: any) {
    toast.error(modalMode.value === 'edit' ? 'Gagal memperbarui surat' : 'Gagal membuat surat', { 
      description: error?.data?.message || 'Terjadi kesalahan' 
    });
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (letter: any) => {
  letterToDelete.value = letter;
  showDeleteDialog.value = true;
};

const executeDelete = async () => {
  if (!letterToDelete.value) return;
  const letter = letterToDelete.value;
  try {
    const response = await api(`/letters/${letter.id}` as any, {
      method: 'DELETE'
    });
    if (response.success) {
      toast.success('Berhasil', { description: 'Template telah dihapus.' });
      fetchLetters();
    }
  } catch (error: any) {
    toast.error('Gagal menghapus', { description: error?.data?.message || 'Terjadi kesalahan' });
  } finally {
    showDeleteDialog.value = false;
    letterToDelete.value = null;
  }
};

onMounted(() => {
  fetchLetters();
});
</script>
