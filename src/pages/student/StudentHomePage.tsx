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
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { subscriptionsApi } from '../../api/subscriptions'
import { leavesApi } from '../../api/leaves'
import { notificationsApi } from '../../api/notifications'
import { announcementsApi } from '../../api/announcements'
import { plansApi } from '../../api/plans'
import { formatDate, formatCurrency, getDaysRemaining } from '../../lib/dates'
import { checkLeaveEligibility } from '../../lib/eligibility'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { DirectUpiPaymentModal } from '../../components/payments/DirectUpiPaymentModal'
import { FoodFeedbackCard } from '../../components/student/FoodFeedbackCard'
import { Announcement } from '../../types'

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

  // 3. Fetch Announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsApi.getAnnouncements(),
  })

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

  // Active top announcement (e.g. Mess holiday or Special Holige Dinner)
  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-10">
      {/* 1. Header Welcome Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#15803d] text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-900/20 flex-shrink-0">
            {(student?.name || user?.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Hi, {student?.name || user?.name || 'Student'} 👋
              </h2>
              {isPassActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Active Pass
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                  Pass Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Hiremat Mess Davangere • BIET Rd • {student?.mobile || user?.mobile}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <a
            href="tel:9353198281"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
            title="Call Basavaraj / Ramesh Sharma (Admin)"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
            <span>Call Admin</span>
          </a>
          <button
            onClick={() => setIsRenewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI Pay</span>
          </button>
        </div>
      </div>

      {/* 2. Announcements Banner (Mess Off / Holiday or Holige Feast) */}
      {latestAnnouncement && (
        <div
          className={`p-4 rounded-2xl border shadow-xs transition-all ${
            latestAnnouncement.type === 'MESS_OFF'
              ? 'bg-gradient-to-r from-rose-50 via-rose-50/70 to-white border-rose-200 text-rose-950'
              : latestAnnouncement.type === 'SPECIAL_DINNER'
              ? 'bg-gradient-to-r from-amber-50 via-amber-50/70 to-white border-amber-300 text-amber-950'
              : 'bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-white border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  latestAnnouncement.type === 'MESS_OFF'
                    ? 'bg-rose-100 text-rose-700'
                    : latestAnnouncement.type === 'SPECIAL_DINNER'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {latestAnnouncement.type === 'MESS_OFF' ? (
                  <CalendarOff className="w-4 h-4" />
                ) : latestAnnouncement.type === 'SPECIAL_DINNER' ? (
                  <Sparkles className="w-4 h-4 text-amber-600" />
                ) : (
                  <Megaphone className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      latestAnnouncement.type === 'MESS_OFF'
                        ? 'bg-rose-200 text-rose-800'
                        : latestAnnouncement.type === 'SPECIAL_DINNER'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {latestAnnouncement.type === 'MESS_OFF'
                      ? 'Mess Holiday'
                      : latestAnnouncement.type === 'SPECIAL_DINNER'
                      ? 'Special Feast'
                      : 'Announcement'}
                  </span>
                  {latestAnnouncement.effectiveDate && (
                    <span className="text-[11px] font-bold text-slate-600">
                      📅 {formatDate(latestAnnouncement.effectiveDate)}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-1">
                  {latestAnnouncement.title}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#25D366] hover:bg-white/80 transition-colors flex-shrink-0"
              title="Share on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* 3. Apple Wallet / Fintech Style Pass Card */}
      {isPassActive ? (
        /* ACTIVE MEMBERSHIP DIGITAL CARD */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-[#064e3b] to-emerald-900 text-white p-5 sm:p-6 shadow-xl border border-emerald-700/60">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest font-black uppercase text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md">
                  {isPuc ? 'PUC SPECIAL PASS' : 'DIGITAL MESS PASS'}
                </span>
                <span className="text-xs text-emerald-200 font-medium">
                  100% Pure Veg Davangere
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
                Hiremat Mess Davangere
              </h3>
              <p className="text-xs text-emerald-200/90 font-medium">
                Unlimited Homestyle Meals • ₹{monthlyFee.toLocaleString('en-IN')}/mo
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
                <span>Active till {formatDate(subscription.lastDate)}</span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setIsRenewModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-lg border-0 self-start sm:self-center transition-transform active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
              Direct UPI Renew (₹{monthlyFee.toLocaleString('en-IN')})
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
                Lunch + Dinner + Palya
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* INACTIVE MEMBERSHIP DIGITAL CARD - WITH DYNAMIC FEE */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 shadow-xl border border-emerald-700/50">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  {isPuc ? 'PUC STUDENT PASS' : 'MEMBERSHIP PASS'}
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
                Enjoy unlimited authentic homestyle food with soft chapatis, tasty saaru, special palya, and Sunday Holige feast.
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
                <span>Sunday Holige Feast</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <CalendarOff className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>10+ Day Leave Policy</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <QrCode className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>0% Gateway Fee Direct UPI</span>
              </div>
            </div>

            {/* Price & Activate CTA */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Plan Fee</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300">
                    ₹{monthlyFee.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">/ 30 Days</span>
                </div>
              </div>

              <Button
                onClick={() => setIsRenewModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg border-0 transition-transform active:scale-95"
              >
                <QrCode className="w-4 h-4 mr-2 text-slate-950" />
                Activate Pass via Direct UPI (₹{monthlyFee.toLocaleString('en-IN')})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setIsRenewModalOpen(true)}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all text-left flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center font-bold mb-2">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">Pay / Renew</span>
            <span className="text-[10px] text-slate-400">Direct UPI QR</span>
          </div>
        </button>

        <Link
          to="/student/payments"
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all text-left flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center font-bold mb-2">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">Receipts</span>
            <span className="text-[10px] text-slate-400">Print tax slips</span>
          </div>
        </Link>

        <Link
          to="/student/leaves"
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all text-left flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center font-bold mb-2">
            <CalendarOff className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">Apply Leave</span>
            <span className="text-[10px] text-slate-400">10+ day policy</span>
          </div>
        </Link>

        <a
          href="https://api.whatsapp.com/send?phone=919353198281&text=Hello%20Hiremat%20Mess%20Admin,%20I%20have%20a%20query%20regarding%20my%20mess%20subscription."
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#25D366] hover:shadow-sm transition-all text-left flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center font-bold mb-2">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">WhatsApp</span>
            <span className="text-[10px] text-slate-400">Chat with admin</span>
          </div>
        </a>
      </div>

      {/* 5. Daily Meal Menu & Timings (ಇಂದಿನ ಮೆನು) */}
      <Card className="border-emerald-200/80 shadow-xs bg-gradient-to-br from-white via-white to-emerald-50/20 overflow-hidden">
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
                  Hiremat Mess Davangere • 100% Homestyle Pure Veg
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
                Soft Chapatis, Mixed Veg Sabzi, Dal Tadka, Rice & Buttermilk
              </p>
              <p className="text-[11px] text-slate-500">
                ರಾತ್ರಿಯ ಊಟ & ಮಜ್ಜಿಗೆ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Food Feedback Widget */}
      <FoodFeedbackCard
        studentId={studentId}
        studentName={student?.name || user?.name || 'Student'}
      />

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
