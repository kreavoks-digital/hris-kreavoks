import type { DashboardStats } from '../types'

export const useDashboardStats = () => {
  const stats = ref<DashboardStats>({
    totalHadir: '20 Hari',
    kehadiranRate: '95%',
    tidakHadir: '3 Hari',
    tidakHadirTrend: '+1',
    logbookTerisi: '76%',
    logbookTrend: '+10%',
    sisaMasaKerja: 'Lifetime',
    sisaMasaKerjaLabel: 'Tetap'
  })

  const fetchStats = async () => {
    try {
      const api = useApi()
      const res: any = await api('/dashboard/stats')
      if (res.data) {
        stats.value = res.data
      }
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  return { stats, fetchStats }
}
