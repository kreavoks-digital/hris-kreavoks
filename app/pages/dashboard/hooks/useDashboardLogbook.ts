import type { LogbookEntry } from '../types'

export const useDashboardLogbook = () => {
  const logbooks = ref<LogbookEntry[]>([])
  const logbookFilterMonth = ref(0)
  const logbookFilterYear = ref(new Date().getFullYear())

  const fetchLogbooks = async () => {
    try {
      const api = useApi()
      const res: any = await api(`/logbook?month=${logbookFilterMonth.value}&year=${logbookFilterYear.value}`)
      if (res.data) {
        logbooks.value = res.data.map((item: any) => {
          const profile = item.user?.profile;
          const roleText = profile?.position || profile?.department || '-';
          
          return {
            id: item.id.toString(),
            divisi: roleText,
            tanggal: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            deskripsi: item.activity,
            kendala: item.obstacle || 'Tidak Ada',
            documentLink: item.documentLink
          }
        })
      }
    } catch (err) {
      console.error('Failed to fetch logbooks', err)
    }
  }

  const updateLogbook = async (id: string, data: { activity?: string; planTomorrow?: string; obstacle?: string; documentLink?: string }) => {
    try {
      const api = useApi()
      await api(`/logbook/${id}`, {
        method: 'PUT',
        body: data
      })
      await fetchLogbooks()
    } catch (err) {
      console.error('Failed to update logbook', err)
      throw err
    }
  }

  return { logbooks, logbookFilterMonth, logbookFilterYear, fetchLogbooks, updateLogbook }
}
