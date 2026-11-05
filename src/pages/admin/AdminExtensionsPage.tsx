import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  AlertCircle,
  History,
} from 'lucide-react'
import { extensionsApi, EligibleStudentItem, ReviewExtensionPayload } from '../../api/extensions'
import { subscriptionsApi } from '../../api/subscriptions'
import { addDaysToDate, formatDate, inclusiveDays } from '../../lib/dates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'

export const AdminExtensionsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'ELIGIBLE' | 'HISTORY'>('ELIGIBLE')

  // Review Drawer state
  const [reviewItem, setReviewItem] = useState<EligibleStudentItem | null>(null)
  const [approvedDays, setApprovedDays] = useState<number>(10)
  const [reviewNote, setReviewNote] = useState<string>('')
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)

  // Fetch Eligible Students
  const { data: eligibleStudents = [], isLoading: isEligibleLoading } = useQuery({
    queryKey: ['adminEligibleExtensions'],
    queryFn: () => extensionsApi.getEligibleStudents(),
  })

  // Fetch Extension History
  const { data: extensionHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['adminExtensionHistory'],
    queryFn: () => extensionsApi.getExtensions(),
  })

  const openReviewDrawer = (item: EligibleStudentItem) => {
    setReviewItem(item)
    // Default approved days to eligible days
    setApprovedDays(item.eligibility.eligibleDays)
    setReviewNote(`Approved ${item.eligibility.eligibleDays} days for verified consecutive leave`)
  }

  // Live preview of new last date
  const oldLastDate = reviewItem?.subscription.lastDate || ''
  const liveNewLastDate =
    oldLastDate && approvedDays > 0 ? addDaysToDate(oldLastDate, approvedDays) : oldLastDate

  // Handle Review (Approve or Reject)
  const handleReviewAction = async (action: 'APPROVED' | 'REJECTED') => {
    if (!reviewItem) return
    setIsSubmittingReview(true)
    try {
      await extensionsApi.reviewExtension({
        studentId: reviewItem.student.id,
        subscriptionId: reviewItem.subscription.id,
        daysAdded: action === 'APPROVED' ? approvedDays : 0,
        status: action,
        note: reviewNote.trim() || undefined,
        approvedByUserId: 'user-admin',
      })

      queryClient.invalidateQueries({ queryKey: ['adminEligibleExtensions'] })
      queryClient.invalidateQueries({ queryKey: ['adminExtensionHistory'] })
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] })
      setReviewItem(null)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Subscription Extensions
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Review eligible students who completed $\ge$ 10 consecutive approved leave days
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('ELIGIBLE')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'ELIGIBLE'
              ? 'border-[#15803d] text-[#15803d]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Eligible Students ({eligibleStudents.length})</span>
          {eligibleStudents.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'HISTORY'
              ? 'border-[#15803d] text-[#15803d]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Extension History ({extensionHistory.length})</span>
        </button>
      </div>

      {/* Eligible Tab */}
      {activeTab === 'ELIGIBLE' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#15803d]" />
                Students Meeting Extension Criteria
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Eligibility rule: $\ge 10$ consecutive approved leave days. Admin review required.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {isEligibleLoading ? (
                <TableSkeleton rows={3} />
              ) : eligibleStudents.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<Sparkles className="w-6 h-6" />}
                    title="No students currently eligible"
                    description="Students will appear here once they accumulate 10 or more consecutive approved leave days inside their subscription period."
                  />
                </div>
              ) : (
                eligibleStudents.map((item) => (
                  <div
                    key={item.student.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm sm:text-base text-slate-900">
                          {item.student.name}
                        </span>
                        <span className="font-extrabold text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                          {item.eligibility.eligibleDays} Days Eligible
                        </span>
                      </div>

                      <p className="text-xs text-slate-500">
                        Mobile: {item.student.mobile} • Subscription Ends:{' '}
                        <strong>{formatDate(item.subscription.lastDate)}</strong>
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium pt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>
                          {item.eligibility.mergedRanges.length} continuous leave period (
                          {item.eligibility.maxConsecutiveDays} consecutive days)
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => openReviewDrawer(item)}
                      className="bg-[#15803d] hover:bg-[#166534] text-xs h-9 px-4 font-semibold shadow-sm flex-shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Review Extension
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                Extension Records ({extensionHistory.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                All previously approved or rejected extension decisions
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {isHistoryLoading ? (
                <TableSkeleton rows={3} />
              ) : extensionHistory.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<History className="w-6 h-6" />}
                    title="No extension history yet"
                    description="Past extension decisions will be logged here."
                  />
                </div>
              ) : (
                extensionHistory.map((ext) => (
                  <div
                    key={ext.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {ext.studentName || 'Student'}
                        </span>
                        <StatusBadge variant={ext.status}>{ext.status}</StatusBadge>
                        {ext.status === 'APPROVED' && (
                          <span className="font-extrabold text-xs text-[#15803d] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            +{ext.daysAdded} Days
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                        <span>Original: {formatDate(ext.oldLastDate)}</span>
                        <span>→</span>
                        <span className="font-bold text-[#15803d]">
                          Extended: {formatDate(ext.newLastDate)}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">{formatDate(ext.created_at)}</span>
                      </div>

                      {ext.note && (
                        <p className="text-xs text-slate-600 italic mt-0.5">Note: {ext.note}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Drawer / Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#15803d]" />
                  Review Leave Extension
                </h3>
                <p className="text-xs text-slate-500">
                  Student: <strong>{reviewItem.student.name}</strong> ({reviewItem.student.mobile})
                </p>
              </div>
              <button
                onClick={() => setReviewItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Merged Leave Ranges */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1. Student's Merged Leave Ranges:
              </span>
              <div className="space-y-1.5">
                {reviewItem.eligibility.mergedRanges.map((range, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">
                        {formatDate(range.startDate)} – {formatDate(range.endDate)}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Merged consecutive leave period
                      </p>
                    </div>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md ${
                        range.daysCount >= 10
                          ? 'bg-emerald-100 text-[#15803d]'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {range.daysCount} days
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-between">
                <span className="font-medium">Total Qualifying Eligible Days:</span>
                <span className="font-extrabold text-sm">{reviewItem.eligibility.eligibleDays} Days</span>
              </div>
            </div>

            {/* Approved Extension Days Input */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                2. Enter Approved Extension Days:
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={approvedDays}
                  onChange={(e) => setApprovedDays(Number(e.target.value))}
                  className="w-24 text-base font-bold text-center p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                />
                <span className="text-slate-500 font-medium">calendar days will be added</span>
              </div>
            </div>

            {/* Live Preview of New Last Date */}
            <div className="p-3.5 rounded-xl bg-emerald-950 text-white space-y-1.5 text-xs">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                ⚡ Live Subscription Preview
              </span>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Original End Date:</span>
                <span className="line-through text-slate-400">{formatDate(oldLastDate)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1 border-t border-emerald-900">
                <span className="font-semibold text-emerald-200">New End Date:</span>
                <span className="font-extrabold text-emerald-400 text-base">
                  {formatDate(liveNewLastDate)}
                </span>
              </div>
            </div>

            {/* Note input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Extension Approval Note (Optional)
              </label>
              <textarea
                rows={2}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => handleReviewAction('REJECTED')}
                disabled={isSubmittingReview}
                className="w-1/3 text-xs h-9 border-rose-300 text-rose-700 hover:bg-rose-50"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleReviewAction('APPROVED')}
                isLoading={isSubmittingReview}
                className="w-2/3 bg-[#15803d] hover:bg-[#166534] text-xs h-9 font-bold"
              >
                Approve & Extend
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
