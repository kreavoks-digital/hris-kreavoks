<template>
  <div class="flex justify-center items-center overflow-hidden">
    <div
      :id="id || 'live-intern-certificate'"
      class="relative bg-white select-none overflow-hidden"
      style="width: 842px; height: 595.5px; min-width: 842px; min-height: 595.5px; box-sizing: border-box;"
    >
      <!-- ─── 1. TEMPLATE GAMBAR ASLI DARI CANVA ─── -->
      <img
        :src="certBg"
        alt="Kreavoks Certificate Template"
        class="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        crossorigin="anonymous"
      />

      <!-- ─── 2. OVERLAY ELEMEN DINAMIS ─── -->
      <div class="absolute inset-0 z-10 pointer-events-none" style="width: 842px; height: 595.5px;">
        
        <!-- A. Date of Completion Label & Value (Top-Right) -->
        <div
          style="position: absolute; top: 48px; right: 135px; width: 200px; text-align: right;"
        >
          <div style="font-size: 11px; font-weight: 600; color: #64748b; font-family: 'Montserrat', 'Plus Jakarta Sans', sans-serif; letter-spacing: 0.2px; word-spacing: 1px;">
            Date of Completion
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0284c7; font-family: 'Montserrat', 'Plus Jakarta Sans', sans-serif; margin-top: 3px; letter-spacing: 0.2px; word-spacing: 1px;">
            {{ dateOfCompletion || '31 Maret 2026' }}
          </div>
        </div>

        <!-- B. Value Nomor Sertifikat (Di dalam Pill Badge Biru Asli Template) -->
        <div
          style="position: absolute; top: 114px; left: 63px; width: 192px; height: 26px; display: flex; align-items: center; justify-content: center; text-align: center; background: transparent;"
        >
          <span style="color: #ffffff; font-size: 11px; font-weight: 700; font-family: 'Montserrat', 'Plus Jakarta Sans', sans-serif; letter-spacing: 0.8px; text-transform: uppercase;">
            {{ serialNumber || 'KWS-INTRN-011125-001' }}
          </span>
        </div>

        <!-- C. Nama Penerima (Kaligrafi Biru di atas garis) -->
        <div
          style="position: absolute; top: 262px; left: 60px; width: 560px; text-align: left;"
        >
          <span style="font-size: 56px; color: #0284c7; font-family: 'Great Vibes', 'Alex Brush', cursive; font-weight: 400; line-height: 1; white-space: nowrap; display: inline-block;">
            {{ recipientName || '[Nama Lengkap]' }}
          </span>
        </div>

        <!-- D. Uraian Kalimat / Statement (Di bawah garis) -->
        <div
          style="position: absolute; top: 338px; left: 60px; width: 550px; text-align: left;"
        >
          <p style="font-size: 11.5px; color: #334155; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; font-weight: 400; line-height: 1.55; margin: 0; word-spacing: 1px; letter-spacing: 0.1px;">
            {{ statementText }}
          </p>
        </div>

        <!-- E. Dynamic Scores Table (Transparan tanpa background agar watermark template terlihat) -->
        <div
          style="position: absolute; top: 402px; left: 375px; width: 238px;"
        >
          <div style="border: 1px solid #93c5fd; border-radius: 8px; overflow: hidden; background: transparent;">
            <table style="width: 100%; border-collapse: collapse; background: transparent; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; font-size: 11px;">
              <tbody>
                <tr style="border-bottom: 1px solid #bfdbfe;">
                  <td style="padding: 5px 10px; color: #0284c7; font-weight: 600; white-space: nowrap; border-right: 1px solid #bfdbfe; word-spacing: 1px;">
                    Attendance
                  </td>
                  <td style="padding: 5px 8px; font-weight: 700; color: #1e293b; text-align: center; width: 44px; border-right: 1px solid #bfdbfe;">
                    {{ scores?.attendance ?? 0 }}
                  </td>
                  <td rowspan="4" style="padding: 6px; text-align: center; vertical-align: middle; background: transparent; width: 48px;">
                    <span style="font-size: 26px; font-weight: 900; color: #0284c7; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1;">
                      {{ finalGrade || calculatedGrade }}
                    </span>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #bfdbfe;">
                  <td style="padding: 5px 10px; color: #0284c7; font-weight: 600; white-space: nowrap; border-right: 1px solid #bfdbfe; word-spacing: 1px;">
                    Work performance
                  </td>
                  <td style="padding: 5px 8px; font-weight: 700; color: #1e293b; text-align: center; border-right: 1px solid #bfdbfe;">
                    {{ scores?.workPerformance ?? 0 }}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #bfdbfe;">
                  <td style="padding: 5px 10px; color: #0284c7; font-weight: 600; white-space: nowrap; border-right: 1px solid #bfdbfe; word-spacing: 1px;">
                    Team work
                  </td>
                  <td style="padding: 5px 8px; font-weight: 700; color: #1e293b; text-align: center; border-right: 1px solid #bfdbfe;">
                    {{ scores?.teamWork ?? 0 }}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 10px; color: #0284c7; font-weight: 600; white-space: nowrap; border-right: 1px solid #bfdbfe; word-spacing: 1px;">
                    Communication
                  </td>
                  <td style="padding: 5px 8px; font-weight: 700; color: #1e293b; text-align: center; border-right: 1px solid #bfdbfe;">
                    {{ scores?.communication ?? 0 }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CertificateScoreData } from '../types'
import certBg from '~/assets/certificates/intern-certif.png'

const props = defineProps<{
  id?: string
  serialNumber?: string
  recipientName?: string
  dateOfCompletion?: string
  statementText?: string
  scores?: CertificateScoreData
  finalGrade?: string
}>()

const calculatedGrade = computed(() => {
  if (!props.scores) return '-'
  const sum = props.scores.attendance + props.scores.workPerformance + props.scores.teamWork + props.scores.communication
  if (sum === 0) return '-'
  const avg = sum / 4
  if (avg >= 85) return 'A'
  if (avg >= 78) return 'AB'
  if (avg >= 70) return 'B'
  if (avg >= 63) return 'BC'
  if (avg >= 55) return 'C'
  return 'D'
})
</script>
