export interface DashboardStats {
  totalHadir: string
  kehadiranRate: string
  tidakHadir: string
  tidakHadirTrend: string
  logbookTerisi: string
  logbookTrend: string
  evaluasi: string
  evaluasiTrend: string
}

export interface AttendanceLog {
  tanggal: string
  datang: string
  pulang: string
  isIzin?: boolean
}

export interface CalendarEvent {
  title: string
  date: string
  time: string
  type: 'blue' | 'yellow' | 'green'
}

export interface LogbookEntry {
  id: string
  divisi: string
  tanggal: string
  deskripsi: string
  kendala: string
}
