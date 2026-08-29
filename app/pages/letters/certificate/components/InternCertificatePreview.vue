<template>
  <div class="flex justify-center items-center overflow-hidden">
    <div
      :id="id || 'intern-certificate-render-area'"
      class="relative bg-white select-none overflow-hidden"
      :style="{
        width: '842.25px',
        height: '595.5px',
        minWidth: '842.25px',
        minHeight: '595.5px'
      }"
    >
      <!-- Repeating Kreavoks Watermark Layer -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.06] flex flex-wrap gap-x-12 gap-y-10 p-4 -rotate-12 scale-125">
        <span v-for="n in 80" :key="n" class="font-extrabold text-2xl tracking-wider text-slate-900 select-none">
          kreavoks
        </span>
      </div>

      <!-- Top Right Geometric Pattern Decoration -->
      <div class="absolute -top-12 -right-12 pointer-events-none z-10 w-44 h-44 opacity-90">
        <svg viewBox="0 0 100 100" class="w-full h-full">
          <path d="M 50,0 A 50,50 0 0,1 100,50 L 50,50 Z" fill="#3b82f6" />
          <path d="M 50,50 A 50,50 0 0,1 100,100 L 50,100 Z" fill="#60a5fa" />
          <circle cx="25" cy="75" r="20" fill="#2563eb" />
          <path d="M 0,0 L 50,0 L 0,50 Z" fill="#93c5fd" />
        </svg>
      </div>

      <!-- Bottom Right Geometric Pattern Decoration (Matching Canvas Art) -->
      <div class="absolute -bottom-10 -right-10 pointer-events-none z-10 w-64 h-64">
        <svg viewBox="0 0 200 200" class="w-full h-full">
          <!-- Blue & Yellow Geometric Shapes -->
          <path d="M 100,200 A 100,100 0 0,1 200,100 L 200,200 Z" fill="#2563eb" />
          <path d="M 60,200 A 60,60 0 0,1 120,140 L 120,200 Z" fill="#facc15" />
          <circle cx="160" cy="80" r="30" fill="#3b82f6" />
          <path d="M 130,20 A 40,40 0 0,1 170,60 L 130,60 Z" fill="#eab308" />
          <circle cx="175" cy="140" r="16" fill="#ffffff" />
          <path d="M 80,100 A 40,40 0 0,1 120,60 L 80,60 Z" fill="#60a5fa" />
          <!-- Dot grid -->
          <g fill="#2563eb" opacity="0.4">
            <circle cx="140" cy="170" r="2.5" />
            <circle cx="150" cy="170" r="2.5" />
            <circle cx="160" cy="170" r="2.5" />
            <circle cx="140" cy="180" r="2.5" />
            <circle cx="150" cy="180" r="2.5" />
            <circle cx="160" cy="180" r="2.5" />
          </g>
        </svg>
      </div>

      <!-- Content Layer -->
      <div class="relative z-20 w-full h-full p-10 flex flex-col justify-between">
        
        <!-- Header: Logo & Completion Date with Mascot -->
        <div class="flex items-start justify-between">
          <!-- Logo Kreavoks -->
          <div class="flex items-center gap-2">
            <span class="text-3xl font-extrabold text-[#2563eb] tracking-tight" style="font-family: 'Montserrat', sans-serif;">
              kreav<span class="inline-flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-[#2563eb]"><span class="w-1.5 h-1.5 rounded-full bg-[#facc15]"></span></span>ks
            </span>
          </div>

          <!-- Date of Completion & Mascot -->
          <div class="flex items-center gap-3 pr-8">
            <div class="text-right">
              <span class="block text-xs font-semibold text-slate-500 tracking-wide">Date of Completion:</span>
              <span class="block text-sm font-bold text-[#2563eb] tracking-tight">{{ dateOfCompletion || '26 November 2025' }}</span>
            </div>
            <!-- Voky Owl Mascot Icon -->
            <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center p-1 border border-blue-100">
              <img src="/images/maskot.png" alt="Voky Mascot" class="w-full h-full object-contain" @error="(e: any) => e.target.style.display = 'none'" />
            </div>
          </div>
        </div>

        <!-- Serial Badge & Main Title -->
        <div class="mt-4 space-y-2">
          <!-- Blue Pill Badge Serial Number -->
          <div class="inline-flex items-center px-4 py-1 rounded-full bg-[#2563eb] text-white text-xs font-bold tracking-wider uppercase">
            {{ serialNumber || 'KWS-INTRN-011125-004' }}
          </div>

          <div>
            <h1 class="text-3xl font-black text-slate-900 tracking-wider uppercase leading-none font-montserrat">
              CERTIFICATE
            </h1>
            <h2 class="text-base font-bold text-slate-800 tracking-[0.28em] uppercase mt-1">
              OF APPRECIATION
            </h2>
          </div>

          <p class="text-xs font-medium text-slate-600 mt-2">
            Proudly present to :
          </p>
        </div>

        <!-- Recipient Calligraphy Name -->
        <div class="relative my-1 max-w-[560px]">
          <h2 class="text-5xl text-[#2563eb] font-normal leading-tight font-alex tracking-wide whitespace-nowrap overflow-visible">
            {{ recipientName || 'Nabila Nafa Fikriyyah' }}
          </h2>
          <div class="w-full h-[2px] bg-[#2563eb] mt-1"></div>
        </div>

        <!-- Statement Description -->
        <div class="max-w-[540px]">
          <p class="text-xs text-slate-700 leading-relaxed font-normal">
            {{ statementText || defaultStatement }}
          </p>
        </div>

        <!-- Bottom Row: Signature & Scores Table -->
        <div class="flex items-end justify-between mt-2">
          <!-- Signatory Box (Left) -->
          <div class="space-y-1">
            <!-- Signature graphic -->
            <div class="h-12 flex items-end">
              <svg viewBox="0 0 160 50" class="h-10 text-slate-900 stroke-current fill-none stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
                <path d="M 10,35 Q 30,5 45,25 T 70,20 Q 85,40 100,15 T 130,30 Q 145,20 155,28" />
                <path d="M 25,28 C 35,45 60,35 75,42" />
              </svg>
            </div>
            <div class="w-48 h-[1.5px] bg-slate-800"></div>
            <div>
              <p class="text-sm font-bold text-slate-900 leading-tight">{{ signatoryName || 'Setiady Ibrahim Anwar' }}</p>
              <p class="text-xs text-slate-500 font-medium">{{ signatoryRole || 'Founder of Kreavoks digital agency' }}</p>
            </div>
          </div>

          <!-- Scores Table (Right) -->
          <div class="mr-14">
            <div class="border border-blue-200 rounded-2xl overflow-hidden bg-white/90 flex text-xs">
              <!-- Left Score Rows -->
              <table class="border-collapse divide-y divide-blue-100 text-slate-800">
                <tbody>
                  <tr class="divide-x divide-blue-100">
                    <td class="px-3 py-1 text-blue-600 font-medium whitespace-nowrap bg-blue-50/40">Attendance</td>
                    <td class="px-3 py-1 font-semibold text-center w-12">{{ scores.attendance }}</td>
                  </tr>
                  <tr class="divide-x divide-blue-100">
                    <td class="px-3 py-1 text-blue-600 font-medium whitespace-nowrap bg-blue-50/40">Work performance</td>
                    <td class="px-3 py-1 font-semibold text-center w-12">{{ scores.workPerformance }}</td>
                  </tr>
                  <tr class="divide-x divide-blue-100">
                    <td class="px-3 py-1 text-blue-600 font-medium whitespace-nowrap bg-blue-50/40">Team work</td>
                    <td class="px-3 py-1 font-semibold text-center w-12">{{ scores.teamWork }}</td>
                  </tr>
                  <tr class="divide-x divide-blue-100">
                    <td class="px-3 py-1 text-blue-600 font-medium whitespace-nowrap bg-blue-50/40">Communication</td>
                    <td class="px-3 py-1 font-semibold text-center w-12">{{ scores.communication }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Right Merged Grade Letter -->
              <div class="border-l border-blue-200 px-4 flex items-center justify-center bg-blue-50/60 min-w-[48px]">
                <span class="text-xl font-extrabold text-[#2563eb]">{{ finalGrade || calculatedGrade }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CertificateScoreData } from '../types'

const props = withDefaults(
  defineProps<{
    id?: string
    serialNumber?: string
    recipientName?: string
    dateOfCompletion?: string
    durationMonths?: number | string
    position?: string
    statementText?: string
    signatoryName?: string
    signatoryRole?: string
    scores?: CertificateScoreData
    finalGrade?: string
  }>(),
  {
    id: 'intern-certificate-render-area',
    serialNumber: 'KWS-INTRN-011125-004',
    recipientName: 'Nabila Nafa Fikriyyah',
    dateOfCompletion: '26 November 2025',
    durationMonths: '3',
    position: 'UI/UX Designer',
    signatoryName: 'Setiady Ibrahim Anwar',
    signatoryRole: 'Founder of Kreavoks digital agency',
    scores: () => ({
      attendance: 95,
      workPerformance: 80,
      teamWork: 85,
      communication: 92
    }),
    finalGrade: ''
  }
)

const defaultStatement = computed(() => {
  return `Successfully completed a ${props.durationMonths || 3}-month internship as a ${props.position || 'UI/UX Designer'} at Kreavoks Digital Agency & Edutech. With following work and skill scores:`
})

const calculatedGrade = computed(() => {
  const avg = (props.scores.attendance + props.scores.workPerformance + props.scores.teamWork + props.scores.communication) / 4
  if (avg >= 85) return 'A'
  if (avg >= 78) return 'AB'
  if (avg >= 70) return 'B'
  if (avg >= 63) return 'BC'
  if (avg >= 55) return 'C'
  return 'D'
})
</script>

<style scoped>
.font-alex {
  font-family: 'Alex Brush', cursive, sans-serif;
}
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
