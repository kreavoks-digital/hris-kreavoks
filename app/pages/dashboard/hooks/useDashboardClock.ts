export const useDashboardClock = () => {
  const currentTime = ref('')
  let timerInterval: any = null

  const updateRealTimeClock = () => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    currentTime.value = `${hh}:${mm}:${ss}`
  }

  const stopClockTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  onMounted(() => {
    updateRealTimeClock()
    timerInterval = setInterval(updateRealTimeClock, 1000)
  })

  onUnmounted(() => {
    stopClockTimer()
  })

  return { currentTime, stopClockTimer }
}
