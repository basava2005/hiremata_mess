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
  BadgeCheck,
  Megaphone,
  Share2,
  Receipt,
  MessageSquare,
  Flame,
  MapPin,
  ExternalLink,
  ChevronDown,
  Info,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { subscriptionsApi } from '../../api/subscriptions'
import { leavesApi } from '../../api/leaves'
import { paymentsApi } from '../../api/payments'
import { announcementsApi } from '../../api/announcements'
import { formatDate, formatCurrency, getDaysRemaining } from '../../lib/dates'
import { checkLeaveEligibility } from '../../lib/eligibility'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { FoodLoadingScreen } from '../../components/ui/FoodLoadingScreen'
import { DirectUpiPaymentModal } from '../../components/payments/DirectUpiPaymentModal'
import { FoodFeedbackCard } from '../../components/student/FoodFeedbackCard'

export const StudentHomePage: React.FC = () => {
  const { user, student } = useAuth()
  const queryClient = useQueryClient()
  const studentId = student?.id || user?.studentId || 'stud-01'
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)

  const monthlyFee = student?.monthlyFee || 3500
  const isPuc = student?.category === 'PUC'

  // 1. Fetch Student Subscription
  const {
    data: subscription,
    isLoading: isSubLoading,
  } = useQuery({
    queryKey: ['studentSubscription', studentId],
    queryFn: () => subscriptionsApi.getStudentSubscription(studentId),
  })

  // 2. Fetch Leaves to compute eligibility
  const { data: leaves = [], isLoading: isLeavesLoading } = useQuery({
    queryKey: ['studentLeaves', studentId],
    queryFn: () => leavesApi.getLeaves({ studentId }),
  })

  // 3. Fetch Payments for quick receipt preview
  const { data: payments = [] } = useQuery({
    queryKey: ['studentPayments', studentId],
    queryFn: () => paymentsApi.getPayments({ studentId }),
  })

  // 4. Fetch Announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsApi.getAnnouncements(),
  })

  // Compute leave eligibility (10+ consecutive days policy)
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
  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null
  const latestPayment = payments.length > 0 ? payments[0] : null

  if (isSubLoading || isLeavesLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <FoodLoadingScreen fullScreen={false} message="Loading your meal pass..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Top Welcome & Identity Hero Card (Full Width) */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#15803d] text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-900/20 flex-shrink-0">
            {(student?.name || user?.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Hi, {student?.name || user?.name || 'Student'} 👋
              </h2>
              {isPassActive ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  Active Pass ({daysRemaining}d left)
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                  Pass Inactive • Renew to Dine
                </span>
              )}
              {isPuc && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  PUC Special Fee
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 flex items-center gap-2 flex-wrap">
              <span>Hiremat Mess Davangere</span>
              <span>•</span>
              <span>BIET Road</span>
              <span>•</span>
              <span className="font-mono">+91 {student?.mobile || user?.mobile}</span>
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2.5 self-start md:self-center flex-wrap">
          <a
            href="tel:9353198281"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
            title="Call Basavaraj H Arikatti (Mess Admin)"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
            <span>Call Admin</span>
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=919353198281&text=Hello%20Hiremat%20Mess%20Admin,%20I%20have%20a%20query%20about%20my%20mess%20pass."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1ebe5b] text-xs font-bold transition-colors border border-[#25D366]/30"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
          <button
            onClick={() => setIsRenewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Pay Direct UPI (₹{monthlyFee.toLocaleString('en-IN')})</span>
          </button>
        </div>
      </div>

      {/* 2. Responsive 2-Column Grid (Main Feed: 8 Cols | Quick Sidebar: 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT MAIN FEED (lg:col-span-8) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Announcements Banner (Mess Off / Holiday or Holige Feast) */}
          {latestAnnouncement && (
            <div
              className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
                latestAnnouncement.type === 'MESS_OFF'
                  ? 'bg-gradient-to-r from-rose-50 via-rose-50/80 to-white border-rose-300 text-rose-950'
                  : latestAnnouncement.type === 'SPECIAL_DINNER'
                  ? 'bg-gradient-to-r from-amber-50 via-amber-50/80 to-white border-amber-300 text-amber-950'
                  : 'bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-white border-emerald-300 text-emerald-950'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      latestAnnouncement.type === 'MESS_OFF'
                        ? 'bg-rose-100 text-rose-700'
                        : latestAnnouncement.type === 'SPECIAL_DINNER'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {latestAnnouncement.type === 'MESS_OFF' ? (
                      <CalendarOff className="w-5 h-5" />
                    ) : latestAnnouncement.type === 'SPECIAL_DINNER' ? (
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Megaphone className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          latestAnnouncement.type === 'MESS_OFF'
                            ? 'bg-rose-200 text-rose-900'
                            : latestAnnouncement.type === 'SPECIAL_DINNER'
                            ? 'bg-amber-200 text-amber-950'
                            : 'bg-emerald-200 text-emerald-950'
                        }`}
                      >
                        {latestAnnouncement.type === 'MESS_OFF'
                          ? 'Mess Holiday Notice'
                          : latestAnnouncement.type === 'SPECIAL_DINNER'
                          ? 'Special Holige Feast'
                          : 'Mess Announcement'}
                      </span>
                      {latestAnnouncement.effectiveDate && (
                        <span className="text-xs font-bold text-slate-700">
                          📅 {formatDate(latestAnnouncement.effectiveDate)}
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-base text-slate-900 mt-1">
                      {latestAnnouncement.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                      {latestAnnouncement.message}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `*Hiremat Mess Notice:* ${latestAnnouncement.title}\n${latestAnnouncement.message}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-slate-400 hover:text-[#25D366] hover:bg-white transition-colors flex-shrink-0"
                  title="Share Announcement to WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Digital Mess Pass / Card */}
          {isPassActive ? (
            /* ACTIVE MEMBERSHIP DIGITAL PASS */
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-[#064e3b] to-emerald-900 text-white p-6 sm:p-7 shadow-xl border border-emerald-700/60">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-56 h-56 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Pass Header */}
              <div className="flex items-start justify-between relative z-10 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-widest font-black uppercase text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 rounded-md">
                      {isPuc ? 'PUC SPECIAL PASS' : 'DIGITAL MEMBERSHIP PASS'}
                    </span>
                    <span className="text-xs text-emerald-200 font-semibold">
                      100% Pure Veg Davangere Style
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 text-white">
                    Hiremat Mess Davangere
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                    Unlimited Homestyle Meals • ₹{monthlyFee.toLocaleString('en-IN')}/30 Days
                  </p>
                </div>

                <StatusBadge variant={subscription.status}>
                  {subscription.status.replace('_', ' ')}
                </StatusBadge>
              </div>

              {/* Days Left Bar */}
              <div className="mt-6 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight">
                    {daysRemaining}
                  </span>
                  <div className="text-xs sm:text-sm text-slate-200">
                    <span className="font-bold text-white block uppercase tracking-wide text-xs">
                      {daysRemaining === 1 ? 'Day Remaining' : 'Days Remaining'}
                    </span>
                    <span>Valid until <strong>{formatDate(subscription.lastDate)}</strong></span>
                  </div>
                </div>

                <Button
                  variant="amber"
                  size="sm"
                  onClick={() => setIsRenewModalOpen(true)}
                  className="font-black text-xs px-5 py-2.5 rounded-xl shadow-lg border-0 self-start sm:self-center transition-transform active:scale-95 text-slate-950"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
                  Direct UPI Renew (₹{monthlyFee.toLocaleString('en-IN')})
                </Button>
              </div>

              {/* Included Meals & Dates Grid */}
              <div className="mt-5 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10 text-xs">
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
                  <span className="font-semibold text-emerald-100 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 inline" />
                    Lunch + Dinner + Special Palya
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* INACTIVE MEMBERSHIP DIGITAL CARD - WITH DYNAMIC FEE */
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 sm:p-7 shadow-xl border border-emerald-700/50">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                      {isPuc ? 'PUC STUDENT PASS' : 'MEMBERSHIP PASS'}
                    </span>
                    <span className="text-xs text-emerald-300 font-semibold">
                      Pure Veg Davanagere Style
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 font-bold">
                    Pass Inactive
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Hiremat Mess 30-Day Pure Veg Pass
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Enjoy unlimited authentic homestyle food with soft chapatis, tasty saaru, special palya, and Sunday Holige feast.
                  </p>
                </div>

                {/* Perks grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                    <Utensils className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Unlimited Lunch & Dinner</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                    <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span>Sunday Holige Feast</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                    <CalendarOff className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Daily Leave Extension Policy</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                    <QrCode className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span>0% Fee via Direct UPI</span>
                  </div>
                </div>

                {/* Price & Activate CTA */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Plan Fee</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-300">
                        ₹{monthlyFee.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">/ 30 Days</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsRenewModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-7 py-3 rounded-xl shadow-lg border-0 transition-transform active:scale-95"
                  >
                    <QrCode className="w-4 h-4 mr-2 text-slate-950" />
                    Activate Pass via Direct UPI (₹{monthlyFee.toLocaleString('en-IN')})
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Shortcut Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all text-left flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">Pay / Renew</span>
                <span className="text-[11px] text-slate-400">PhonePe QR Direct</span>
              </div>
            </button>

            <Link
              to="/student/payments"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all text-left flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">Tax Receipts</span>
                <span className="text-[11px] text-slate-400">Print digital slips</span>
              </div>
            </Link>

            <Link
              to="/student/leaves"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all text-left flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                <CalendarOff className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">Apply Leave</span>
                <span className="text-[11px] text-slate-400">10+ day policy</span>
              </div>
            </Link>

            <Link
              to="/student/extensions"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all text-left flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">Extensions</span>
                <span className="text-[11px] text-slate-400">Earned extra days</span>
              </div>
            </Link>
          </div>

          {/* Daily Meal Menu & Timings (ಇಂದಿನ ಮೆನು) */}
          <Card className="border-slate-200 shadow-xs bg-white rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#15803d] flex items-center justify-center font-bold">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      Daily Menu & Timings
                      <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                        ಇಂದಿನ ಮೆನು
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Hiremat Mess Davangere • 100% Homestyle Pure Veg Kitchen
                    </CardDescription>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#15803d] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  BIET Road
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Breakfast */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <Coffee className="w-4 h-4" />
                      <span>Breakfast</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">7:30 - 10:00 AM</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Mandakki Oggarne & Mirchi / Hot Dosa + Tea
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ಉಪಾಹಾರ & ಬಿಸಿ ಚಹಾ
                  </p>
                </div>

                {/* Lunch */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <Sun className="w-4 h-4" />
                      <span>Lunch (Unlimited)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold">12:30 - 2:30 PM</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    Hot Chapatis, Ennegayi / Kaalu Palya, Saaru, Rice & Curd
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ಮಧ್ಯಾಹ್ನದ ಊಟ (ಅನ್‌ಲಿಮಿಟೆಡ್)
                  </p>
                </div>

                {/* Dinner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                      <Moon className="w-4 h-4" />
                      <span>Dinner</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">7:30 - 9:30 PM</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Soft Chapatis, Mixed Veg Sabzi, Dal Tadka, Rice & Buttermilk
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ರಾತ್ರಿಯ ಊಟ & ಮಜ್ಜಿಗೆ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Food Feedback Widget */}
          <FoodFeedbackCard
            studentId={studentId}
            studentName={student?.name || user?.name || 'Student'}
          />
        </div>

        {/* ================= RIGHT SIDEBAR WIDGETS (lg:col-span-4) ================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* Direct UPI Scan & Pay Card with PhonePe QR */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Direct PhonePe QR</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                0% Gateway Fee
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center">
              <img
                src="/phonepe-qr.jpg"
                alt="PhonePe Accepted Here - Basavaraj H Arikatti"
                className="w-40 h-auto object-contain rounded-xl shadow-xs"
              />
              <div className="mt-2.5">
                <p className="font-extrabold text-xs text-slate-900">Basavaraj H Arikatti</p>
                <p className="text-[11px] text-slate-500 font-mono">9353198281@ybl</p>
              </div>
            </div>

            <Button
              onClick={() => setIsRenewModalOpen(true)}
              className="w-full bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold h-10 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              <span>Pay ₹{monthlyFee.toLocaleString('en-IN')} & Enter UTR</span>
            </Button>
            <p className="text-[10px] text-slate-400 text-center">
              Anti-scam verified: Enter the 12-digit UTR from your receipt to activate immediately.
            </p>
          </div>

          {/* Leave Policy & Extension Status Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <CalendarOff className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Leave Extension Policy</h4>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                10+ Days Rule
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Going home for exams, holidays, or vacations? Consecutive leaves of <strong>10 or more days</strong> automatically qualify for subscription validity extensions!
            </p>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Recorded Leaves:</span>
                <span className="font-bold text-slate-900">{leaves.length} applied</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Qualifying Long Leaves:</span>
                <span className="font-bold text-[#15803d]">
                  {eligibility.qualifyingRanges?.length || 0} eligible
                </span>
              </div>
            </div>

            <Link
              to="/student/leaves"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Apply Leave Request</span>
            </Link>
          </div>

          {/* Recent Payment Receipt Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#15803d] flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Latest Receipt</h4>
              </div>
              <Link
                to="/student/payments"
                className="text-[11px] font-bold text-[#15803d] hover:underline"
              >
                View All
              </Link>
            </div>

            {latestPayment ? (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-[11px]">
                    {latestPayment.receiptNumber}
                  </span>
                  <StatusBadge variant={latestPayment.status}>
                    {latestPayment.status}
                  </StatusBadge>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-slate-500">{formatDate(latestPayment.date)}</span>
                  <span className="font-extrabold text-[#15803d] text-sm">
                    ₹{latestPayment.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No payment receipts on record yet.
              </p>
            )}

            <Link
              to="/student/payments"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-colors"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Tax Receipts</span>
            </Link>
          </div>

          {/* Location & Contact Info */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Mess Address & Timings</span>
            </div>
            <div>
              <p className="font-bold text-sm text-white">Hiremat Mess (ಹಿರೇಮಠ್ ಮೆಸ್)</p>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Admin: <strong>Basavaraj H Arikatti</strong></span>
              <a
                href="tel:9353198281"
                className="text-emerald-400 font-bold hover:underline"
              >
                9353198281
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Direct UPI Payment Modal */}
      <DirectUpiPaymentModal
        open={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        amount={monthlyFee}
        studentId={studentId}
        studentName={student?.name || user?.name || 'Student'}
        studentMobile={student?.mobile || user?.mobile || '9876543201'}
        onPaymentSuccess={(payment) => {
          queryClient.invalidateQueries({ queryKey: ['studentSubscription', studentId] })
          queryClient.invalidateQueries({ queryKey: ['studentPayments', studentId] })
          setIsRenewModalOpen(false)
        }}
      />
    </div>
  )
}
