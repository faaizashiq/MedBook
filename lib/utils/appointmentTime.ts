// Utility functions for parsing appointment date & time windows and video room access

export interface AppointmentWindowStatus {
  canJoin: boolean
  isUpcoming: boolean
  isOngoing: boolean
  isEnded: boolean
  minutesUntilStart: number
  minutesUntilEnd: number
  formattedOpensAt: string
  formattedStartTime: string
  formattedEndTime: string
  sessionEndTime: Date | null
  totalDurationMinutes: number
}

/**
 * Calculates whether the video room is open (10 mins before start until end of slot)
 * and provides session countdowns and warning states.
 */
export function getAppointmentTimeWindow(
  dateStr?: string,
  timeStr?: string,
  durationMinutes = 30,
  earlyJoinMinutes = 10
): AppointmentWindowStatus {
  if (!dateStr || !timeStr) {
    return {
      canJoin: true,
      isUpcoming: false,
      isOngoing: true,
      isEnded: false,
      minutesUntilStart: 0,
      minutesUntilEnd: durationMinutes,
      formattedOpensAt: 'Now',
      formattedStartTime: '00:00',
      formattedEndTime: '00:30',
      sessionEndTime: new Date(Date.now() + durationMinutes * 60 * 1000),
      totalDurationMinutes: durationMinutes,
    }
  }

  let appYear = new Date().getFullYear()
  let appMonth = new Date().getMonth()
  let appDateNum = new Date().getDate()

  if (dateStr.includes('T')) {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      appYear = d.getFullYear()
      appMonth = d.getMonth()
      appDateNum = d.getDate()
    }
  } else {
    // Handle "2026-08-24" or "Aug 24, 2026"
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      appYear = parsed.getFullYear()
      appMonth = parsed.getMonth()
      appDateNum = parsed.getDate()
    }
  }

  // Parse time (e.g. "01:30 PM", "1:30 PM", "13:30", "01:30 PM - 02:00 PM")
  const cleanTime = timeStr.split('-')[0].trim()
  const match = cleanTime.match(/(\d+):(\d+)\s*(AM|PM)?/i)

  let hours = 9
  let minutes = 0
  if (match) {
    hours = parseInt(match[1], 10)
    minutes = parseInt(match[2], 10)
    const meridiem = match[3]?.toUpperCase()
    if (meridiem === 'PM' && hours < 12) hours += 12
    if (meridiem === 'AM' && hours === 12) hours = 0
  }

  const startDateTime = new Date(appYear, appMonth, appDateNum, hours, minutes, 0, 0)
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000)
  const earlyOpenDateTime = new Date(startDateTime.getTime() - earlyJoinMinutes * 60 * 1000)

  const now = new Date()
  const nowMs = now.getTime()
  const startMs = startDateTime.getTime()
  const endMs = endDateTime.getTime()
  const earlyMs = earlyOpenDateTime.getTime()

  // Room can be joined 10 min before start until the session ends
  const canJoin = nowMs >= earlyMs && nowMs <= endMs
  const isUpcoming = nowMs < earlyMs
  const isOngoing = nowMs >= startMs && nowMs <= endMs
  const isEnded = nowMs > endMs

  const minutesUntilStart = Math.ceil((startMs - nowMs) / (60 * 1000))
  const minutesUntilEnd = Math.ceil((endMs - nowMs) / (60 * 1000))

  // Format early open time
  const formatTimeStr = (d: Date) => {
    const h = d.getHours()
    const m = d.getMinutes()
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayH = h % 12 || 12
    return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
  }

  return {
    canJoin,
    isUpcoming,
    isOngoing,
    isEnded,
    minutesUntilStart,
    minutesUntilEnd,
    formattedOpensAt: formatTimeStr(earlyOpenDateTime),
    formattedStartTime: formatTimeStr(startDateTime),
    formattedEndTime: formatTimeStr(endDateTime),
    sessionEndTime: endDateTime,
    totalDurationMinutes: durationMinutes,
  }
}
