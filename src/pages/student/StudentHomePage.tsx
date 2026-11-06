import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  PhoneCall,
  QrCode,
  Coffee,
  Sun,
  Moon,
  Heart,
  BadgeCheck
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { subscriptionsApi } from '../../api/subscriptions'
import { leavesApi } from '../../api/leaves'
import { notificationsApi } from '../../api/notifications'
import { plansApi } from '../../api/plans'
import { formatDate, formatCurrency, getDaysRemaining } from '../../lib/dates'
import { checkLeaveEligibility } from '../../lib/eligibility'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { DirectUpiPaymentModal } from '../../components/payments/DirectUpiPaymentModal'
import { FoodFeedbackCard } from '../../components/student/FoodFeedbackCard'

export const StudentHomePage: React.FC = () => {
  const { user, student } = useAuth()
  const queryClient = useQueryClient()
  const studentId = student?.id || user?.studentId || 'stud-01'
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)

  // 1. Fetch Student Subscription
  const {
    data: subscription,
    isLoading: isSubLoading,
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

  // Calculate leave eligibility
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
  const isPassActive = subscription && subscription.status === 'ACTIVE'

  if (isSubLoading || isLeavesLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-8">
      {/* 1. Header Greeting & Mess Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-900/20 flex-shrink-0">
            {(student?.name || user?.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Hi, {student?.name || user?.name || 'Student'} 👋
              </h2>
              {isPassActive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Active Pass
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Hiremat Mess (ಹಿರೇಮಠ್ ಮೆಸ್) • BIET Rd, Davangere • Mobile: {user?.mobile || student?.mobile}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <a
            href="tel:9876543210"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
            title="Call Ramesh Sharma (Mess Admin)"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call Admin</span>
          </a>
          <button
            onClick={() => setIsRenewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#15803d] hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI Pay</span>
          </button>
        </div>
      </div>

      {/* 2. Digital Mess Pass / Membership Card */}
      {isPassActive ? (
        /* ACTIVE MEMBERSHIP DIGITAL CARD */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 shadow-xl border border-emerald-700/60">
          {/* Subtle Decorative Pattern */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest font-black uppercase text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md">
                  DIGITAL MESS PASS
                </span>
                <span className="text-xs text-emerald-200 font-medium">
                  Pure Veg 100%
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5 text-white">
                Hiremat Mess Davanagere
              </h3>
              <p className="text-xs text-emerald-200/90 font-medium">
                {currentPlan?.name || 'Standard Monthly Plan'} • ₹3,500/mo
              </p>
            </div>

            <StatusBadge variant={subscription.status}>
              {subscription.status.replace('_', ' ')}
            </StatusBadge>
          </div>

          {/* Days Left Bar */}
          <div className="mt-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                {daysRemaining}
              </span>
              <div className="text-xs text-slate-200">
                <span className="font-bold text-white block uppercase tracking-wide">
                  {daysRemaining === 1 ? 'Day Remaining' : 'Days Remaining'}
                </span>
                <span>Active until {formatDate(subscription.lastDate)}</span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setIsRenewModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-lg border-0 self-start sm:self-center transition-transform active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
              Direct UPI Renew (₹3,500)
            </Button>
          </div>

          {/* Included Meals & Dates */}
          <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10 text-xs">
            <div>
              <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Valid From</span>
              <span className="font-bold text-white text-sm">{formatDate(subscription.startDate)}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Valid Till</span>
              <span className="font-bold text-white text-sm">{formatDate(subscription.lastDate)}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Meals Covered</span>
              <span className="font-semibold text-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 inline" />
                Lunch + Dinner + Special
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* NO ACTIVE SUBSCRIPTION - LUXURY INVITATION / ACTIVATION PASS */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 shadow-xl border border-emerald-700/50">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  MEMBERSHIP PASS
                </span>
                <span className="text-xs text-emerald-300 font-semibold">
                  Pure Veg Davanagere Style
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 font-medium">
                Pass Inactive
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Hiremat Mess 30-Day Pure Veg Pass
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Enjoy unlimited authentic homestyle food with soft chapatis, tasty saaru, special palya, and Sunday Bele Holige.
              </p>
            </div>

            {/* Perks grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <Utensils className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlimited Lunch & Dinner</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>Sunday Bele Holige Feast</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <CalendarOff className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>10+ Day Leave Extension Policy</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <QrCode className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>0% Gateway Fees via Direct UPI</span>
              </div>
            </div>

            {/* Price & Activate CTA */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Plan Fee</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300">₹3,500</span>
                  <span className="text-xs text-slate-300 font-medium">/ 30 Days</span>
                </div>
              </div>

              <Button
                onClick={() => setIsRenewModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg border-0 transition-transform active:scale-95"
              >
                <QrCode className="w-4 h-4 mr-2 text-slate-950" />
                Activate Pass via Direct UPI (₹3,500)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Daily Meal Menu & Timings (ಇಂದಿನ ಮೆನು) */}
      <Card className="border-emerald-200/80 shadow-sm bg-gradient-to-br from-white via-white to-emerald-50/20 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#15803d] flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Daily Menu & Timings
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                    ಇಂದಿನ ಮೆನು
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Hiremat Mess Davanagere • 100% Homestyle Pure Veg
                </CardDescription>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
              BIET Road
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Breakfast */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Breakfast</span>
                </div>
                <span className="text-[10px] text-slate-400">7:30 - 10:00 AM</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Mandakki Oggarne & Mirchi / Hot Dosa + Tea
              </p>
              <p className="text-[11px] text-slate-500">
                ಉಪಾಹಾರ & ಬಿಸಿ ಚಹಾ
              </p>
            </div>

            {/* Lunch */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Lunch (Unlimited)</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">12:30 - 2:30 PM</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">
                Hot Chapatis, Ennegayi / Kaalu Palya, Saaru, Rice & Curd
              </p>
              <p className="text-[11px] text-slate-500">
                ಮಧ್ಯಾಹ್ನದ ಊಟ (ಅನ್‌ಲಿಮಿಟೆಡ್)
              </p>
            </div>

            {/* Dinner */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dinner</span>
                </div>
                <span className="text-[10px] text-slate-400">7:30 - 9:30 PM</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Soft Chapatis, Mixed Veg Sabzi, Dal Rasam & Rice
              </p>
              <p className="text-[11px] text-slate-500">
                ರಾತ್ರಿ ಊಟ
              </p>
            </div>
          </div>

          {/* Sunday Special Banner */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🥞</span>
              <span>
                <strong>Sunday Special:</strong> Authentic Davanagere Bele Holige with Pure Desi Ghee & Majjige!
              </span>
            </div>
            <span className="text-[10px] font-bold bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">
              ಭಾನುವಾರ ವಿಶೇಷ
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 4. FOOD FEEDBACK & RATING (NEW FEATURE) */}
      <FoodFeedbackCard
        studentId={studentId}
        studentName={student?.name || user?.name}
      />

      {/* 5. Extension Eligibility Progress Card */}
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
                  🎉 You are eligible for an extension! You have {eligibility.eligibleDays} eligible consecutive leave days. Your branch admin will extend your subscription end date.
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
                    Take at least 10 consecutive approved leave days to become eligible for subscription extensions.
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

      {/* 6. Quick Action Shortcuts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link
          to="/student/leaves"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-[#15803d]/40 hover:bg-emerald-50/30 transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <CalendarOff className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Apply Leave</p>
            <p className="text-[10px] text-slate-500">1 day advance notice</p>
          </div>
        </Link>

        <Link
          to="/student/payments"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-[#15803d]/40 hover:bg-emerald-50/30 transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Payment Receipts</p>
            <p className="text-[10px] text-slate-500">Direct UPI receipts</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setIsRenewModalOpen(true)}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-[#15803d]/40 hover:bg-emerald-50/30 transition-all flex items-center gap-3 group text-left col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Direct UPI Pay</p>
            <p className="text-[10px] text-slate-500">Scan QR & enter UTR</p>
          </div>
        </button>
      </div>

      {/* 7. Latest Notifications */}
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

      {/* Direct UPI Payment Modal (0% Gateway Fee, 0% GST) */}
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
