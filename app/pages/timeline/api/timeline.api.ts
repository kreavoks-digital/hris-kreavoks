import type { TimelineItem } from '../types'

export const timelineApi = {
  async getTimelineItems(projectId?: string): Promise<TimelineItem[]> {
    return []
  },

  async updateDates(itemId: string, startDate: string, endDate: string): Promise<boolean> {
    return true
  }
}

