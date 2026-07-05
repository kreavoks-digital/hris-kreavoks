import type { InjectionKey, ComputedRef } from 'vue'
import type { useDashboard } from '../hooks/useDashboard'
import type { AttendanceLog, LogbookEntry } from '../types'

export type DashboardContextType = ReturnType<typeof useDashboard> & {
  filteredLogs: ComputedRef<AttendanceLog[]>
  filteredLogbooks: ComputedRef<LogbookEntry[]>
}

export const DashboardContextKey: InjectionKey<DashboardContextType> = Symbol('DashboardContext')
