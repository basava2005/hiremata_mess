import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Utensils,
  CreditCard,
  CalendarOff,
  Bell,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { subscriptionsApi } from '../../api/subscriptions'
import { leavesApi } from '../../api/leaves'
import { notificationsApi } from '../../api/notifications'
import { paymentsApi } from '../../api/payments'
import { plansApi } from '../../api/plans'
import { formatDate, formatCurrency, getDaysRemaining } from '../../lib/dates'
import { checkLeaveEligibility } from '../../lib/eligibility'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { DirectUpiPaymentModal } from '../../components/payments/DirectUpiPaymentModal'

export const StudentHomePage: React.FC = () => {
  const { user, student } = useAuth()
  const queryClient = useQueryClient()
  const studentId = student?.id || user?.studentId || 'stud-01'
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [isRenewing, setIsRenewing] = useState(false)
  const [renewSuccessMessage, setRenewSuccessMessage] = useState<string | null>(null)

  // 1. Fetch Student Subscription
  const {
    data: subscription,
    isLoading: isSubLoading,
    refetch: refetchSub,
  } = useQuery({
    queryKey: ['studentSubscription', studentId],
    queryFn: () => subscriptionsApi.getStudentSubscription(studentId),
  })

  // 2. Fetch Plan
  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getPlans(),
  })
  const currentPlan = plans?.[0] || subscription?.plan

  // 3. Fetch Leaves to compute eligibility
  const { data: leaves = [], isLoading: isLeavesLoading } = useQuery({
    queryKey: ['studentLeaves', studentId],
    queryFn: () => leavesApi.getLeaves({ studentId }),
  })

  // 4. Fetch Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationsApi.getNotifications(user?.id),
  })

  // Calculate leave eligibility based on verified business rules
  const eligibility = subscription
    ? checkLeaveEligibility(
        { startDate: subscription.startDate, lastDate: subscription.lastDate },
        leaves
      )
    : {
        isEligible: false,
        maxConsecutiveDays: 0,
        eligibleDays: 0,
        leaveDaysCount: 0,
        mergedRanges: [],
        qualifyingRanges: [],
      }

  const daysRemaining = subscription ? getDaysRemaining(subscription.lastDate) : 0

  // Quick Mock Renew Handler
  const handleMockRenew = async (outcome: 'SUCCESS' | 'FAILED' = 'SUCCESS') => {
    setIsRenewing(true)
    setRenewSuccessMessage(null)
    try {
      const res = await paymentsApi.initiateOnlinePayment(studentId, 3500, outcome)
      if (res.status === 'SUCCESS') {
        setRenewSuccessMessage('Subscription successfully renewed for 30 days!')
        queryClient.invalidateQueries({ queryKey: ['studentSubscription', studentId] })
        queryClient.invalidateQueries({ queryKey: ['studentPayments', studentId] })
        setTimeout(() => {
          setIsRenewModalOpen(false)
          setRenewSuccessMessage(null)
        }, 1500)
      } else {
        alert('Payment was marked as failed.')
      }
    } finally {
      setIsRenewing(false)
    }
  }

  if (isSubLoading || isLeavesLoading) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-4">
      {/* Welcome Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Hi, {student?.name || user?.name || 'Student'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">Welcome to your MessPro dashboard</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[#15803d] text-xs font-medium">
          <Utensils className="w-3.5 h-3.5" />
          <span>Active Mess Member</span>
        </div>
      </div>

      {/* 1. Subscription Card */}
      {subscription ? (
        <Card className="relative overflow-hidden border-emerald-200/80 shadow-md bg-gradient-to-br from-white via-white to-emerald-50/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Current Subscription
                </span>
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  {currentPlan?.name || 'Standard Monthly Plan'}
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 font-medium">
                  {currentPlan?.mealsLabel || 'Lunch + Dinner'} • {formatCurrency(currentPlan?.price || 3500)} / month
                </CardDescription>
              </div>
              <StatusBadge variant={subscription.status}>
                {subscription.status.replace('_', ' ')}
              </StatusBadge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {/* Days Left Highlight Card */}
            <div className="rounded-xl bg-slate-900 text-white p-4 flex items-center justify-between shadow-inner">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Days Remaining
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    {daysRemaining}
                  </span>
                  <span className="text-xs text-slate-300">
                    {daysRemaining === 1 ? 'day left' : 'days left'}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => setIsRenewModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Renew Plan
              </Button>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Started On</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
                  {formatDate(subscription.startDate)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Last Included Date</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
                  {formatDate(subscription.lastDate)}
                </p>
              </div>
            </div>

            {subscription.status === 'EXPIRING_SOON' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Your subscription expires in {daysRemaining} days. Renew now to avoid interruption in meal service.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6 text-center border-dashed">
          <p className="text-sm font-medium text-slate-600">No active subscription found.</p>
          <Button
            size="sm"
            onClick={() => setIsRenewModalOpen(true)}
            className="mt-3 bg-[#15803d]"
          >
            Subscribe Now ({formatCurrency(3500)})
          </Button>
        </Card>
      )}

      {/* 2. Eligibility Progress Card ("6 of 10 leave days") */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#15803d] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Extension Eligibility
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Rule: 10+ consecutive approved leave days
                </CardDescription>
              </div>
            </div>

            <StatusBadge variant={eligibility.isEligible ? 'APPROVED' : 'PENDING'}>
              {eligibility.isEligible ? 'Eligible' : 'In Progress'}
            </StatusBadge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Consecutive Leave Progress</span>
              <span className="font-bold text-[#15803d]">
                {eligibility.maxConsecutiveDays} of 10 leave days
              </span>
            </div>

            {/* Custom rounded progress bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  eligibility.isEligible
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                    : 'bg-emerald-600'
                }`}
                style={{
                  width: `${Math.min(100, (eligibility.maxConsecutiveDays / 10) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Status explanation */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
            {eligibility.isEligible ? (
              <div className="flex items-start gap-2 text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  🎉 You are eligible for an extension! You have {eligibility.eligibleDays} eligible consecutive leave days. Your branch admin will review and extend your subscription.
                </span>
              </div>
            ) : (
              <p>
                {eligibility.maxConsecutiveDays > 0 ? (
                  <span>
                    You have completed <strong>{eligibility.maxConsecutiveDays} consecutive days</strong> of approved leave. Reach 10 consecutive days to unlock extension credits.
                  </span>
                ) : (
                  <span>
                    Take at least 10 consecutive approved leave days to become eligible for an extension.
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              to="/student/leaves"
              className="text-xs text-[#15803d] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <CalendarOff className="w-3.5 h-3.5" />
              <span>Request or View Leaves</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
            <Link
              to="/student/extensions"
              className="text-xs text-slate-500 font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>Extension History</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 3. Quick Action Shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/student/leaves"
          className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-[#15803d]/40 hover:bg-emerald-50/30 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <CalendarOff className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Apply Leave</p>
            <p className="text-[10px] text-slate-500">1 day advance notice</p>
          </div>
        </Link>

        <Link
          to="/student/payments"
          className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-[#15803d]/40 hover:bg-emerald-50/30 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Payment Receipts</p>
            <p className="text-[10px] text-slate-500">View & print</p>
          </div>
        </Link>
      </div>

      {/* 4. Latest Notifications */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-sm font-bold text-slate-800">
                Latest Notifications
              </CardTitle>
            </div>
            <span className="text-[11px] text-slate-400">Recent updates</span>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-slate-100 p-0">
          {notifications.slice(0, 3).map((n) => (
            <div key={n.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  n.type === 'SUCCESS'
                    ? 'bg-emerald-500'
                    : n.type === 'ALERT'
                    ? 'bg-rose-500'
                    : n.type === 'WARNING'
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                  <span className="text-[10px] text-slate-400">{formatDate(n.created_at, 'dd MMM')}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">
              No recent notifications
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Mess Timings Banner */}
      <div className="rounded-xl p-4 bg-emerald-950 text-white shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Utensils className="w-3.5 h-3.5" />
            <span>Hiremat Mess Davanagere Daily Schedule</span>
          </div>
          <div className="text-xs text-slate-300 space-y-0.5">
            <p>• <strong>Breakfast + Tea:</strong> 7:30 AM - 10:00 AM (Mandakki Mirchi / Dosa / Paddu)</p>
            <p>• <strong>Lunch (Chapati Meals):</strong> 12:30 PM - 2:30 PM (Unlimited Homestyle Meals)</p>
            <p>• <strong>Dinner:</strong> 7:30 PM - 9:30 PM (Hot Chapati Dinner)</p>
            <p>• <strong>Sunday Special:</strong> Bele Holige Feast with Desi Ghee</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-emerald-300 bg-emerald-900 px-2 py-1 rounded-md border border-emerald-800 font-bold block">
            100% Pure Veg
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Davanagere, KA
          </span>
        </div>
      </div>

      {/* Direct UPI Payment Modal for Renewal (0% Gateway Fee, 0% GST) */}
      <DirectUpiPaymentModal
        open={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        amount={3500}
        studentId={studentId}
        studentName={student?.name || user?.name || 'Student'}
        studentMobile={student?.mobile || user?.mobile || '9876543201'}
        onPaymentSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['studentSubscription', studentId] })
          queryClient.invalidateQueries({ queryKey: ['studentPayments', studentId] })
          queryClient.invalidateQueries({ queryKey: ['studentNotifications', studentId] })
          setIsRenewModalOpen(false)
        }}
      />
    </div>
  )
}

