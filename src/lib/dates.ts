import { addDays, differenceInCalendarDays, format, isValid, parse, parseISO } from 'date-fns'

/**
 * Standard date-only format used across MessPro: YYYY-MM-DD
 */
export const DATE_FORMAT = 'yyyy-MM-dd'

/**
 * Returns today's date in IST as YYYY-MM-DD string
 */
export function getTodayIST(): string {
  // IST is UTC+5:30
  const now = new Date()
  const istOffsetMs = 5.5 * 60 * 60 * 1000
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const istDate = new Date(utcMs + istOffsetMs)
  return format(istDate, DATE_FORMAT)
}

/**
 * Safely parses YYYY-MM-DD into a local Date object without timezone shift
 */
export function parseDateOnly(dateStr: string): Date {
  if (!dateStr) return new Date()
  // If already full ISO, parse ISO or date-only
  if (dateStr.length === 10) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  const parsed = parseISO(dateStr)
  return isValid(parsed) ? parsed : new Date()
}

/**
 * Formats YYYY-MM-DD string to user-facing IST format
 * e.g. "05 Nov 2026" or "5 Nov 2026"
 */
export function formatDate(dateStr: string | null | undefined, formatPattern = 'dd MMM yyyy'): string {
  if (!dateStr) return '-'
  try {
    const parsed = parseDateOnly(dateStr)
    return format(parsed, formatPattern)
  } catch {
    return dateStr
  }
}

/**
 * Indian currency formatting (₹ with en-IN formatting)
 * e.g. formatCurrency(3500) => "₹3,500"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Adds days to a YYYY-MM-DD string and returns a new YYYY-MM-DD string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const date = parseDateOnly(dateStr)
  const newDate = addDays(date, days)
  return format(newDate, DATE_FORMAT)
}

/**
 * Calculates last included date for a plan:
 * "last included date = start + 29 days" for a 30-day plan
 */
export function calculateLastDate(startDate: string, durationDays: number = 30): string {
  return addDaysToDate(startDate, durationDays - 1)
}

/**
 * Counts inclusive days between two date strings:
 * inclusiveDays(start, end) = difference in calendar days + 1 (if end >= start)
 */
export function inclusiveDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = parseDateOnly(startDate)
  const end = parseDateOnly(endDate)
  const diff = differenceInCalendarDays(end, start)
  return diff >= 0 ? diff + 1 : 0
}

/**
 * Returns days remaining until lastDate (inclusive of today).
 * If today is 2026-11-05 and lastDate is 2026-11-05 -> 1 day left.
 * If today is 2026-11-06 and lastDate is 2026-11-05 -> 0 days left (expired).
 */
export function getDaysRemaining(lastDate: string, referenceDate: string = getTodayIST()): number {
  if (!lastDate) return 0
  const ref = parseDateOnly(referenceDate)
  const last = parseDateOnly(lastDate)
  const diff = differenceInCalendarDays(last, ref)
  return diff >= 0 ? diff + 1 : 0
}

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'UPCOMING'

/**
 * Subscription Status logic:
 * - Expired from the next day (referenceDate > lastDate)
 * - Expiring soon = 3 days or less left (1 <= daysRemaining <= 3)
 * - Active = more than 3 days left
 */
export function getSubscriptionStatus(
  startDate: string,
  lastDate: string,
  referenceDate: string = getTodayIST()
): SubscriptionStatus {
  if (!startDate || !lastDate) return 'EXPIRED'
  const ref = parseDateOnly(referenceDate)
  const start = parseDateOnly(startDate)
  const last = parseDateOnly(lastDate)

  if (differenceInCalendarDays(ref, start) < 0) {
    return 'UPCOMING'
  }

  const daysLeft = getDaysRemaining(lastDate, referenceDate)
  if (daysLeft <= 0) {
    return 'EXPIRED'
  }
  if (daysLeft <= 3) {
    return 'EXPIRING_SOON'
  }
  return 'ACTIVE'
}

/**
 * Leave needs at least 1 day advance notice:
 * If today is 2026-11-05, minimum leave startDate allowed is 2026-11-06.
 */
export function isAdvanceNoticeValid(leaveStartDate: string, referenceDate: string = getTodayIST()): boolean {
  if (!leaveStartDate) return false
  const ref = parseDateOnly(referenceDate)
  const start = parseDateOnly(leaveStartDate)
  return differenceInCalendarDays(start, ref) >= 1
}

