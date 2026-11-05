import { differenceInCalendarDays, parseISO, format, addDays } from 'date-fns'
import { DATE_FORMAT, getTodayIST, inclusiveDays, parseDateOnly } from './dates'

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface LeaveRequestInput {
  id: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  status: LeaveStatus
  studentId?: string
  reason?: string
}

export interface SubscriptionPeriodInput {
  startDate: string // YYYY-MM-DD
  lastDate: string // YYYY-MM-DD
}

export interface MergedLeaveRange {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  daysCount: number
}

export interface EligibilityResult {
  isEligible: boolean
  maxConsecutiveDays: number
  eligibleDays: number
  leaveDaysCount: number // Total approved past leave days inside subscription
  mergedRanges: MergedLeaveRange[]
  qualifyingRanges: MergedLeaveRange[]
}

/**
 * Checks if student is eligible for a leave-based extension.
 *
 * RULES:
 * - Eligible when there are at least 10 consecutive APPROVED leave days inside the subscription period.
 * - Merge back-to-back leaves (next starts the day after previous ends).
 * - Count overlaps once.
 * - Clip to the subscription period.
 * - Count only past dates (dates on or before referenceDate).
 * - Ignore pending, rejected, cancelled leaves.
 * - Eligibility never auto-extends; admin enters the extension days.
 */
export function checkLeaveEligibility(
  subscription: SubscriptionPeriodInput,
  leaves: LeaveRequestInput[],
  referenceDate: string = getTodayIST()
): EligibilityResult {
  if (!subscription.startDate || !subscription.lastDate) {
    return {
      isEligible: false,
      maxConsecutiveDays: 0,
      eligibleDays: 0,
      leaveDaysCount: 0,
      mergedRanges: [],
      qualifyingRanges: [],
    }
  }

  // 1. Filter only APPROVED leaves
  const approvedLeaves = leaves.filter((leave) => leave.status === 'APPROVED')

  if (approvedLeaves.length === 0) {
    return {
      isEligible: false,
      maxConsecutiveDays: 0,
      eligibleDays: 0,
      leaveDaysCount: 0,
      mergedRanges: [],
      qualifyingRanges: [],
    }
  }

  // 2. Collect unique valid dates clipped to subscription period and past dates
  const validDatesSet = new Set<string>()

  const subStart = subscription.startDate
  const subEnd = subscription.lastDate

  for (const leave of approvedLeaves) {
    if (!leave.startDate || !leave.endDate) continue

    // Determine clipping boundaries
    // Start cannot be before subscription start
    const effectiveStart = leave.startDate < subStart ? subStart : leave.startDate
    // End cannot be after subscription lastDate OR after referenceDate (past dates only)
    let effectiveEnd = leave.endDate > subEnd ? subEnd : leave.endDate
    if (effectiveEnd > referenceDate) {
      effectiveEnd = referenceDate
    }

    // If leave started after referenceDate or after subscription end, skip
    if (effectiveStart > effectiveEnd) {
      continue
    }

    // Add all dates in [effectiveStart, effectiveEnd]
    let curr = parseDateOnly(effectiveStart)
    const end = parseDateOnly(effectiveEnd)

    while (differenceInCalendarDays(end, curr) >= 0) {
      validDatesSet.add(format(curr, DATE_FORMAT))
      curr = addDays(curr, 1)
    }
  }

  const uniqueDates = Array.from(validDatesSet).sort()

  if (uniqueDates.length === 0) {
    return {
      isEligible: false,
      maxConsecutiveDays: 0,
      eligibleDays: 0,
      leaveDaysCount: 0,
      mergedRanges: [],
      qualifyingRanges: [],
    }
  }

  // 3. Group consecutive dates into merged ranges
  // (Handles back-to-back leaves and overlaps automatically)
  const mergedRanges: MergedLeaveRange[] = []
  let rangeStart = uniqueDates[0]
  let prevDate = uniqueDates[0]

  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = uniqueDates[i]
    const prev = parseDateOnly(prevDate)
    const curr = parseDateOnly(currentDate)

    if (differenceInCalendarDays(curr, prev) === 1) {
      // Consecutive day, continue current range
      prevDate = currentDate
    } else {
      // Gap found, close previous range
      mergedRanges.push({
        startDate: rangeStart,
        endDate: prevDate,
        daysCount: inclusiveDays(rangeStart, prevDate),
      })
      rangeStart = currentDate
      prevDate = currentDate
    }
  }

  // Close final range
  mergedRanges.push({
    startDate: rangeStart,
    endDate: prevDate,
    daysCount: inclusiveDays(rangeStart, prevDate),
  })

  // 4. Calculate qualifying ranges (>= 10 consecutive days)
  const qualifyingRanges = mergedRanges.filter((range) => range.daysCount >= 10)
  const isEligible = qualifyingRanges.length > 0
  const maxConsecutiveDays = mergedRanges.reduce(
    (max, range) => Math.max(max, range.daysCount),
    0
  )
  const eligibleDays = qualifyingRanges.reduce(
    (sum, range) => sum + range.daysCount,
    0
  )

  return {
    isEligible,
    maxConsecutiveDays,
    eligibleDays,
    leaveDaysCount: uniqueDates.length,
    mergedRanges,
    qualifyingRanges,
  }
}

