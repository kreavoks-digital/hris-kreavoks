import { z } from 'zod'

export const leaveSchema = z.object({
  type: z.string().min(1, 'Harap pilih Tipe Pengajuan (Sakit, Izin Pribadi, atau Keperluan Darurat).'),
  startDate: z.string().min(1, 'Harap pilih Tanggal Mulai pengajuan.'),
  endDate: z.string().min(1, 'Harap pilih Tanggal Selesai pengajuan.'),
  reason: z.string().min(3, 'Harap isi Keterangan / alasan pengajuan secara detail (minimal 3 karakter).'),
  proofLink: z.string().optional().nullable(),
  isOneDay: z.boolean().optional(),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.',
  path: ['endDate']
});

export type LeaveFormInput = z.infer<typeof leaveSchema>;
