import { describe, it, expect } from 'vitest'
import { checkLeaveEligibility, LeaveRequestInput, SubscriptionPeriodInput } from '../eligibility'

describe('checkLeaveEligibility', () => {
  const subscription: SubscriptionPeriodInput = {
    startDate: '2026-10-01',
    lastDate: '2026-10-30',
  }
  const referenceDate = '2026-11-01' // In the future relative to sub

  it('marks eligible when there is a single approved leave of 10 or more consecutive days', () => {
    const leaves: LeaveRequestInput[] = [
      {
        id: '1',
        startDate: '2026-10-05',
        endDate: '2026-10-14', // 10 days (5, 6, 7, 8, 9, 10, 11, 12, 13, 14)
        status: 'APPROVED',
      },
    ]

    const result = checkLeaveEligibility(subscription, leaves, referenceDate)
    expect(result.isEligible).toBe(true)
    expect(result.maxConsecutiveDays).toBe(10)
    expect(result.eligibleDays).toBe(10)
    expect(result.leaveDaysCount).toBe(10)
    expect(result.mergedRanges).toHaveLength(1)
    expect(result.mergedRanges[0]).toEqual({
      startDate: '2026-10-05',
      endDate: '2026-10-14',
      daysCount: 10,
    })
  })

  it('marks NOT eligible when approved leave is only 9 consecutive days', () => {
    const leaves: LeaveRequestInput[] = [
      {
        id: '1',
        startDate: '2026-10-05',
        endDate: '2026-10-13', // 9 days
        status: 'APPROVED',
      },
    ]

    const result = checkLeaveEligibility(subscription, leaves, referenceDate)
    expect(result.isEligible).toBe(false)
    expect(result.maxConsecutiveDays).toBe(9)
    expect(result.eligibleDays).toBe(0)
    expect(result.leaveDaysCount).toBe(9)
  })

  it('merges back-to-back leaves where next starts the day after previous ends', () => {
    const leaves: LeaveRequestInput[] = [
      {
        id: '1',
        startDate: '2026-10-01',
        endDate: '2026-10-05', // 5 days
        status: 'APPROVED',
      },
      {
        id: '2',
        startDate: '2026-10-06', // Next day
        endDate: '2026-10-11', // 6 days
        status: 'APPROVED',
      },
    ]

    const result = checkLeaveEligibility(subscription, leaves, referenceDate)
    expect(result.isEligible).toBe(true)
    expect(result.maxConsecutiveDays).toBe(11) // 5 + 6 = 11 days
    expect(result.eligibleDays).toBe(11)
    expect(result.leaveDaysCount).toBe(11)
    expect(result.mergedRanges).toHaveLength(1)
    expect(result.mergedRanges[0]).toEqual({
      startDate: '2026-10-01',
      endDate: '2026-10-11',
      daysCount: 11,
    })
  })

  it('counts overlapping leaves only once', () => {
    const leaves: LeaveRequestInput[] = [
      {
        id: '1',
        startDate: '2026-10-01',
        endDate: '2026-10-08', // Oct 1 to Oct 8
        status: 'APPROVED',
      },
      {
        id: '2',
        startDate: '2026-10-05', // Overlaps
        endDate: '2026-10-12', // Oct 5 to Oct 12
        status: 'APPROVED',
      },
    ]

    const result = checkLeaveEligibility(subscription, leaves, referenceDate)
    expect(result.isEligible).toBe(true)
    expect(result.maxConsecutiveDays).toBe(12) // Oct 1 to Oct 12 is 12 days
    expect(result.eligibleDays).toBe(12)
    expect(result.leaveDaysCount).toBe(12)
    expect(result.mergedRanges).toHaveLength(1)
    expect(result.mergedRanges[0]).toEqual({
      startDate: '2026-10-01',
      endDate: '2026-10-12',
      daysCount: 12,
    })
  })

  it('clips leave ranges to the subscription period boundaries', () => {
    const leaves: LeaveRequestInput[] = [
      {
        id: '1',
        startDate: '2026-09-25', // Before sub starts on 2026-10-01
        endDate: '2026-10-10', // Within sub
        status: 'APPROVED',
      },
    ]

    const result = checkLeaveEligibility(subscription, leaves, referenceDate)
    // Clipped to 2026-10-01 -> 2026-10-10 = 10 days
    expect(result.isEligible).toBe(true)
    expect(result.maxConsecutiveDays).toBe(10)
    expect(result.eligibleDays).toBe(10)
    expect(result.mergedRanges[0]).toEqual({
      startDate: '2026-10-01',
      endDate: '2026-10-10',
      daysCount: 10,
    })
  })

  it('clips leaves to past dates (ignores future days)', () => {
    // Current date is 2026-10-06
    const today = '2026-10-06'
    const leaves: LeaveRequestInput[] = [
      {
        id: '1',
        startDate: '2026-10-01',
        endDate: '2026-10-15', // 15 days scheduled
        status: 'APPROVED',
      },
    ]

    const result = checkLeaveEligibility(subscription, leaves, today)
    // Up to 2026-10-06 is only 6 days
    expect(result.isEligible).toBe(false)
    expect(result.maxConsecutiveDays).toBe(6) // 6 of 10 leave days
    expect(result.leaveDaysCount).toBe(6)
    expect(result.mergedRanges[0]).toEqual({
      startDate: '2026-10-01',
      endDate: '2026-10-06',
      daysCount: 6,
    })
  })

  it('ignores PENDING, REJECTED, and CANCELLED leaves', () => {
    const leaves: LeaveRequestInput[] = [
      {
        id: '1',
        startDate: '2026-10-01',
        endDate: '2026-10-12',
        status: 'PENDING',
      },
      {
        id: '2',
        startDate: '2026-10-13',
        endDate: '2026-10-25',
        status: 'REJECTED',
      },
      {
        id: '3',
        startDate: '2026-10-26',
        endDate: '2026-10-29',
        status: 'CANCELLED',
      },
    ]

    const result = checkLeaveEligibility(subscription, leaves, referenceDate)
    expect(result.isEligible).toBe(false)
    expect(result.maxConsecutiveDays).toBe(0)
    expect(result.mergedRanges).toHaveLength(0)
  })

  it('does NOT merge leaves when separated by a gap of 1 or more days', () => {
    const leaves: LeaveRequestInput[] = [
      {
        id: '1',
        startDate: '2026-10-01',
        endDate: '2026-10-05', // 5 days
        status: 'APPROVED',
      },
      // Gap on 2026-10-06
      {
        id: '2',
        startDate: '2026-10-07',
        endDate: '2026-10-11', // 5 days
        status: 'APPROVED',
      },
    ]

    const result = checkLeaveEligibility(subscription, leaves, referenceDate)
    expect(result.isEligible).toBe(false)
    expect(result.maxConsecutiveDays).toBe(5)
    expect(result.mergedRanges).toHaveLength(2)
  })
})

