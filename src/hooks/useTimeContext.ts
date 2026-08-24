import { useState, useEffect } from 'react'

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night'
export type Season = 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter'

export interface TimeContextState {
  salutation: string
  greetingEmoji: string
  timePeriod: TimePeriod
  currentSeason: Season
  slotCountdownText: string
}

export function useTimeContext(): TimeContextState {
  const [state, setState] = useState<TimeContextState>(() => computeTimeState())

  useEffect(() => {
    const timer = setInterval(() => {
      setState(computeTimeState())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return state
}

function computeTimeState(): TimeContextState {
  const now = new Date()
  const hour = now.getHours()
  const month = now.getMonth()

  let timePeriod: TimePeriod = 'morning'
  let salutation = 'Good Morning'
  let greetingEmoji = '🌅'

  if (hour >= 5 && hour < 12) {
    timePeriod = 'morning'
    salutation = 'Good Morning'
    greetingEmoji = '🌅'
  } else if (hour >= 12 && hour < 17) {
    timePeriod = 'afternoon'
    salutation = 'Good Afternoon'
    greetingEmoji = '☀️'
  } else if (hour >= 17 && hour < 22) {
    timePeriod = 'evening'
    salutation = 'Good Evening'
    greetingEmoji = '🌆'
  } else {
    timePeriod = 'night'
    salutation = 'Good Night'
    greetingEmoji = '🌙'
  }

  let currentSeason: Season = 'summer'
  if (month >= 2 && month <= 4) currentSeason = 'spring'
  else if (month >= 5 && month <= 8) currentSeason = 'monsoon'
  else if (month >= 9 && month <= 10) currentSeason = 'autumn'
  else if (month === 11 || month <= 1) currentSeason = 'winter'

  const secondsInWindow = 15 * 60
  const totalSecondsPassed = (now.getMinutes() % 15) * 60 + now.getSeconds()
  const secondsRemaining = secondsInWindow - totalSecondsPassed

  const mins = Math.floor(secondsRemaining / 60)
  const secs = secondsRemaining % 60
  const slotCountdownText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  return {
    salutation,
    greetingEmoji,
    timePeriod,
    currentSeason,
    slotCountdownText,
  }
}
