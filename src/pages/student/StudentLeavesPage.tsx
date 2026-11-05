import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarOff,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { leavesApi } from '../../api/leaves'
import { subscriptionsApi } from '../../api/subscriptions'
import { LeaveRequest } from '../../types'
import { addDaysToDate, formatDate, getTodayIST, inclusiveDays, isAdvanceNoticeValid } from '../../lib/dates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'

export const StudentLeavesPage: React.FC = () => {
  const { user, student } = useAuth()
  const studentId = student?.id || user?.studentId || 'stud-01'
  const queryClient = useQueryClient()
  const today = getTodayIST()
  const tomorrow = addDaysToDate(today, 1)

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [startDate, setStartDate] = useState(tomorrow)
  const [endDate, setEndDate] = useState(tomorrow)
  const [reason, setReason] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Fetch Leaves
  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['studentLeaves', studentId],
    queryFn: () => leavesApi.getLeaves({ studentId }),
  })

  // 2. Compute Days
  const computedDays = inclusiveDays(startDate, endDate)

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Validation
    if (!isAdvanceNoticeValid(startDate, today)) {
      setValidationError('Leave requests require at least 1 day advance notice. Minimum start date is tomorrow.')
      return
    }

    if (endDate < startDate) {
      setValidationError('End date cannot be earlier than start date.')
      return
    }

    if (!reason.trim()) {
      setValidationError('Please provide a reason for your leave request.')
      return
    }

    setIsSubmitting(true)
    try {
      await leavesApi.createLeave({
        studentId,
        startDate,
        endDate,
        reason: reason.trim(),
        status: 'PENDING',
      })
      queryClient.invalidateQueries({ queryKey: ['studentLeaves', studentId] })
      setIsApplyModalOpen(false)
      setReason('')
      setStartDate(tomorrow)
      setEndDate(tomorrow)
    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit leave request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelLeave = async (leaveId: string) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return
    await leavesApi.cancelLeave(leaveId)
    queryClient.invalidateQueries({ queryKey: ['studentLeaves', studentId] })
  }

  // Can cancel if status is PENDING or if startDate is in the future
  const canCancel = (leave: LeaveRequest) => {
    if (leave.status === 'CANCELLED' || leave.status === 'REJECTED') return false
    if (leave.status === 'PENDING') return true
    if (leave.status === 'APPROVED' && leave.startDate > today) return true
    return false
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Leave Requests
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Notify the mess when you are away to qualify for extensions
          </p>
        </div>
        <Button
          onClick={() => setIsApplyModalOpen(true)}
          className="bg-[#15803d] hover:bg-[#166534] text-xs font-semibold h-9 px-3.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Request Leave
        </Button>
      </div>

      {/* Advance Notice Rule Card */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#15803d] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-bold text-emerald-950">
            Advance Notice & Extension Benefit Rule
          </p>
          <p className="leading-relaxed">
            Submit leave with at least <strong>1 day advance notice</strong>. When you accumulate{' '}
            <strong>10+ consecutive approved leave days</strong>, you become eligible for subscription extensions!
          </p>
        </div>
      </div>

      {/* Leaves List */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">
            My Leaves ({leaves.length})
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            All submitted, approved, and completed leave periods
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100">
          {isLoading ? (
            <TableSkeleton rows={3} />
          ) : leaves.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<CalendarOff className="w-6 h-6" />}
                title="No leave requests yet"
                description="Planning to go home or on a college trip? Apply for leave in advance."
                actionLabel="Request Leave"
                onAction={() => setIsApplyModalOpen(true)}
              />
            </div>
          ) : (
            leaves.map((leave) => {
              const days = leave.daysCount || inclusiveDays(leave.startDate, leave.endDate)
              return (
                <div
                  key={leave.id}
                  className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                      </span>
                      <StatusBadge variant={leave.status}>{leave.status}</StatusBadge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-[#15803d] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {days} {days === 1 ? 'day' : 'consecutive days'}
                      </span>
                      <span>•</span>
                      <span className="truncate">{leave.reason}</span>
                    </div>

                    {leave.adminNote && (
                      <p className="text-[11px] text-slate-500 bg-slate-100 p-2 rounded-lg italic">
                        <strong>Admin note:</strong> {leave.adminNote}
                      </p>
                    )}
                  </div>

                  {canCancel(leave) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelLeave(leave.id)}
                      className="text-xs h-7 px-2 border-rose-200 text-rose-600 hover:bg-rose-50 flex-shrink-0"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Request Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#15803d] flex items-center justify-center">
                  <CalendarOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Request Leave</h3>
                  <p className="text-[11px] text-slate-500">Min 1 day advance notice</p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5">
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    min={tomorrow}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      if (endDate < e.target.value) {
                        setEndDate(e.target.value)
                      }
                    }}
                    required
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    min={startDate || tomorrow}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                  />
                </div>
              </div>

              {/* Computed Days Preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Computed Leave Days:</span>
                <span className="font-extrabold text-[#15803d] text-sm">
                  {computedDays} {computedDays === 1 ? 'day' : 'days'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Diwali vacation trip home, college festival..."
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="w-1/2 text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-1/2 bg-[#15803d] hover:bg-[#166534] text-xs h-9 font-semibold"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
