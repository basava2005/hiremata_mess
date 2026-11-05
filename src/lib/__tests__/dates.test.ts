import { describe, it, expect } from 'vitest'
import {
  calculateLastDate,
  formatCurrency,
  formatDate,
  getDaysRemaining,
  getSubscriptionStatus,
  inclusiveDays,
  isAdvanceNoticeValid,
} from '../dates'

describe('dates utilities', () => {
  it('calculates last included date as start + 29 days (30 calendar days)', () => {
    // Oct 1 + 29 days = Oct 30 (30 days total)
    expect(calculateLastDate('2026-10-01', 30)).toBe('2026-10-30')
    expect(inclusiveDays('2026-10-01', '2026-10-30')).toBe(30)
  })

  it('formats currency with Indian ₹ formatting', () => {
    const formatted = formatCurrency(3500)
    expect(formatted).toContain('3,500')
    expect(formatted).toContain('₹')
  })

  it('determines days remaining and subscription status correctly', () => {
    const start = '2026-10-01'
    const last = '2026-10-30'

    // Mid-month
    expect(getSubscriptionStatus(start, last, '2026-10-15')).toBe('ACTIVE')
    expect(getDaysRemaining(last, '2026-10-15')).toBe(16)

    // Expiring soon: 3 days or less left
    // Oct 28: Oct 28, 29, 30 = 3 days left
    expect(getDaysRemaining(last, '2026-10-28')).toBe(3)
    expect(getSubscriptionStatus(start, last, '2026-10-28')).toBe('EXPIRING_SOON')

    // Last day: 1 day left
    expect(getDaysRemaining(last, '2026-10-30')).toBe(1)
    expect(getSubscriptionStatus(start, last, '2026-10-30')).toBe('EXPIRING_SOON')

    // Expired from next day (Oct 31)
    expect(getDaysRemaining(last, '2026-10-31')).toBe(0)
    expect(getSubscriptionStatus(start, last, '2026-10-31')).toBe('EXPIRED')
  })

  it('enforces at least 1 day advance notice for leave requests', () => {
    const today = '2026-11-05'
    // Same day is invalid
    expect(isAdvanceNoticeValid('2026-11-05', today)).toBe(false)
    // Past day is invalid
    expect(isAdvanceNoticeValid('2026-11-04', today)).toBe(false)
    // Next day (tomorrow) is valid (1 day advance)
    expect(isAdvanceNoticeValid('2026-11-06', today)).toBe(true)
    // Days further in the future are valid
    expect(isAdvanceNoticeValid('2026-11-10', today)).toBe(true)
  })
})

