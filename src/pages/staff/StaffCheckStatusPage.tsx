import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CalendarOff,
  User,
  Phone,
  Calendar,
  Utensils,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  Coffee,
  Sun,
  Moon,
  Delete,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { studentsApi } from '../../api/students'
import { subscriptionsApi } from '../../api/subscriptions'
import { leavesApi } from '../../api/leaves'
import { Student, Subscription, LeaveRequest } from '../../types'
import { formatDate, getTodayIST, getDaysRemaining } from '../../lib/dates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { toast } from 'sonner'

export const StaffCheckStatusPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [checkedInIds, setCheckedInIds] = useState<Array<{ id: string; name: string; time: string; status: string }>>([
    { id: 'stud-01', name: 'Rahul Verma', time: '12:45 PM', status: 'ACTIVE' },
    { id: 'stud-02', name: 'Pooja Iyer', time: '12:52 PM', status: 'EXPIRING_SOON' },
  ])
  const today = getTodayIST()

  // Current meal session calculation
  const currentHour = new Date().getHours()
  const mealSession =
    currentHour < 11
      ? { label: 'Breakfast Service', time: '7:30 - 10:00 AM', icon: Coffee, color: 'text-amber-700 bg-amber-50 border-amber-200' }
      : currentHour < 16
      ? { label: 'Lunch Service (Unlimited)', time: '12:30 - 2:30 PM', icon: Sun, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' }
      : { label: 'Dinner Service', time: '7:30 - 9:30 PM', icon: Moon, color: 'text-indigo-800 bg-indigo-50 border-indigo-200' }

  // Fetch all students
  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ['staffStudents'],
    queryFn: () => studentsApi.getStudents(),
  })

  // Fetch all subscriptions
  const { data: subscriptions = [], isLoading: isSubsLoading } = useQuery({
    queryKey: ['staffSubscriptions'],
    queryFn: () => subscriptionsApi.getSubscriptions(),
  })

  // Fetch all leaves to check if student is ON_LEAVE today
  const { data: leaves = [], isLoading: isLeavesLoading } = useQuery({
    queryKey: ['staffLeaves'],
    queryFn: () => leavesApi.getLeaves(),
  })

  // Subscriptions map
  const subMap = useMemo(() => {
    const map = new Map<string, Subscription>()
    subscriptions.forEach((s) => map.set(s.studentId, s))
    return map
  }, [subscriptions])

  // Count overview metrics
  const metrics = useMemo(() => {
    let active = 0
    let expiringSoon = 0
    let onLeave = 0
    let expired = 0

    students.forEach((s) => {
      const isOnLeave = leaves.some(
        (l) => l.studentId === s.id && l.status === 'APPROVED' && l.startDate <= today && l.endDate >= today
      )
      if (isOnLeave) {
        onLeave++
      } else {
        const sub = subMap.get(s.id)
        if (sub?.status === 'ACTIVE') active++
        else if (sub?.status === 'EXPIRING_SOON') expiringSoon++
        else expired++
      }
    })

    return { active, expiringSoon, onLeave, expired }
  }, [students, subscriptions, leaves, subMap, today])

  // Check if a student is on approved leave today
  const isStudentOnLeaveToday = (studentId: string): LeaveRequest | undefined => {
    return leaves.find(
      (l) =>
        l.studentId === studentId &&
        l.status === 'APPROVED' &&
        l.startDate <= today &&
        l.endDate >= today
    )
  }

  // Filtered matching students based on search input
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.mobile.includes(q)
    )
  }, [students, query])

  const selectedStudent = searchResults[0] || null
  const sub = selectedStudent ? subMap.get(selectedStudent.id) : null
  const leaveToday = selectedStudent ? isStudentOnLeaveToday(selectedStudent.id) : undefined

  // Determine Mess Verification Access Status
  let verificationStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'ON_LEAVE' | 'EXPIRED' = 'EXPIRED'
  if (leaveToday) {
    verificationStatus = 'ON_LEAVE'
  } else if (sub) {
    if (sub.status === 'ACTIVE') verificationStatus = 'ACTIVE'
    else if (sub.status === 'EXPIRING_SOON') verificationStatus = 'EXPIRING_SOON'
    else verificationStatus = 'EXPIRED'
  }

  const daysLeft = sub ? getDaysRemaining(sub.lastDate) : 0

  const handleMarkEntry = (student: Student) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    setCheckedInIds((prev) => [
      { id: student.id, name: student.name, time: timeStr, status: verificationStatus },
      ...prev.slice(0, 9),
    ])
    toast.success(`Entry Marked for ${student.name}!`, {
      description: `Verified at ${timeStr} • Allowed Entry ✓`,
    })
    setQuery('')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Live Session Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#15803d] flex items-center justify-center font-bold shadow-inner">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Student Entry Verification
              </h2>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${mealSession.color}`}>
                <mealSession.icon className="w-3.5 h-3.5" />
                {mealSession.label} ({mealSession.time})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Hiremat Mess Davangere • Fast QR / Mobile Lookup • Real-time Pass Status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Today: {formatDate(today)}
          </span>
        </div>
      </div>

      {/* 2. Live Metrics Counter Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Active Passes (Allowed)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#15803d] mt-1 block">
              {metrics.active}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Expiring Soon (≤3 Days)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
              {metrics.expiringSoon}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              On Leave Today
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 mt-1 block">
              {metrics.onLeave}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CalendarOff className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
              Expired Passes
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block">
              {metrics.expired}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Responsive 2-Column Working Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: SEARCH & VERIFY TERMINAL (lg:col-span-7) ================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Search Box with PROPER pl-14 PADDING (No Overlap!) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Lookup Student by 10-Digit Mobile or Name
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#15803d]">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter mobile number or student name..."
                autoFocus
                className="w-full pl-14 pr-10 py-4 text-base sm:text-lg rounded-2xl border-2 border-slate-300 bg-white shadow-xs focus:border-[#15803d] focus:ring-4 focus:ring-[#15803d]/20 transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 font-bold text-lg"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Test Search Shortcuts */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Test Shortcuts:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Rahul Verma (Active)', query: '9876543201' },
                  { name: 'Pooja Iyer (Expiring Soon)', query: '9876543204' },
                  { name: 'Vikas Sharma (Expired)', query: '9876543207' },
                  { name: 'Basavaraj', query: '9353198281' },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(btn.query)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-[#15803d] hover:border-emerald-300 border border-slate-200 transition-all active:scale-95"
                  >
                    {btn.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 1-Tap Numeric Touch Keypad for Tablet / Counter Touchscreens */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">Counter Number Pad:</span>
                {query && (
                  <button
                    onClick={() => setQuery((prev) => prev.slice(0, -1))}
                    className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Delete className="w-3.5 h-3.5" /> Backspace
                  </button>
                )}
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Clear'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      if (val === 'Clear') setQuery('')
                      else setQuery((prev) => prev + val)
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all active:scale-95 ${
                      val === 'Clear'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 col-span-2'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Result Display */}
          {query ? (
            searchResults.length === 0 ? (
              <Card className="p-8 text-center border-dashed rounded-3xl bg-white">
                <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-800">No Student Found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  No registered student matches "<strong>{query}</strong>". Please check the number or verify with Admin.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Primary Matching Result Card */}
                <div
                  className={`overflow-hidden rounded-3xl border-2 shadow-lg transition-all ${
                    verificationStatus === 'ACTIVE'
                      ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10'
                      : verificationStatus === 'EXPIRING_SOON'
                      ? 'border-amber-500 bg-white ring-4 ring-amber-500/10'
                      : verificationStatus === 'ON_LEAVE'
                      ? 'border-blue-500 bg-white ring-4 ring-blue-500/10'
                      : 'border-rose-500 bg-white ring-4 ring-rose-500/10'
                  }`}
                >
                  {/* Visual Status Banner */}
                  <div
                    className={`p-4 sm:p-5 text-white flex items-center justify-between ${
                      verificationStatus === 'ACTIVE'
                        ? 'bg-[#15803d]'
                        : verificationStatus === 'EXPIRING_SOON'
                        ? 'bg-amber-600'
                        : verificationStatus === 'ON_LEAVE'
                        ? 'bg-blue-600'
                        : 'bg-rose-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {verificationStatus === 'ACTIVE' && (
                        <CheckCircle2 className="w-8 h-8 flex-shrink-0 animate-in zoom-in" />
                      )}
                      {verificationStatus === 'EXPIRING_SOON' && (
                        <AlertTriangle className="w-8 h-8 flex-shrink-0 animate-in zoom-in" />
                      )}
                      {verificationStatus === 'ON_LEAVE' && (
                        <CalendarOff className="w-8 h-8 flex-shrink-0 animate-in zoom-in" />
                      )}
                      {verificationStatus === 'EXPIRED' && (
                        <XCircle className="w-8 h-8 flex-shrink-0 animate-in zoom-in" />
                      )}

                      <div>
                        <span className="text-[10px] tracking-widest font-black uppercase text-white/80 block">
                          ENTRY DECISION
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                          {verificationStatus === 'ACTIVE' && 'ENTRY ALLOWED ✓'}
                          {verificationStatus === 'EXPIRING_SOON' && 'ENTRY ALLOWED (Expiring Soon)'}
                          {verificationStatus === 'ON_LEAVE' && 'DINING PAUSED (On Leave)'}
                          {verificationStatus === 'EXPIRED' && 'ENTRY RESTRICTED (Pass Expired)'}
                        </h3>
                      </div>
                    </div>

                    {daysLeft > 0 && verificationStatus !== 'ON_LEAVE' && (
                      <div className="text-right bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/20">
                        <span className="text-2xl font-black text-white">{daysLeft}</span>
                        <span className="text-[10px] block font-bold text-white/90">Days Left</span>
                      </div>
                    )}
                  </div>

                  {/* Student Details Body */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#15803d] flex items-center justify-center font-black text-xl flex-shrink-0 border border-emerald-200">
                          {selectedStudent.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-lg font-black text-slate-900">
                              {selectedStudent.name}
                            </h4>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                              ₹{(selectedStudent.monthlyFee || 3500).toLocaleString()}/mo
                            </span>
                            {selectedStudent.category && selectedStudent.category !== 'STANDARD' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800">
                                {selectedStudent.category}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            Mobile: +91 {selectedStudent.mobile} • ID: {selectedStudent.id}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{selectedStudent.address}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Details Strip */}
                    {sub && (
                      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Valid From</span>
                          <span className="font-bold text-slate-900">{formatDate(sub.startDate)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Valid Till</span>
                          <span className="font-bold text-slate-900">{formatDate(sub.lastDate)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                          <StatusBadge variant={verificationStatus}>{verificationStatus}</StatusBadge>
                        </div>
                      </div>
                    )}

                    {/* On Leave Warning */}
                    {leaveToday && (
                      <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                        <span className="font-bold block">📅 Student is Currently on Leave:</span>
                        <span>
                          Leave active from <strong>{formatDate(leaveToday.startDate)}</strong> to <strong>{formatDate(leaveToday.endDate)}</strong> ({leaveToday.daysCount} days). Reason: {leaveToday.reason}.
                        </span>
                      </div>
                    )}

                    {/* Mark Check-in Button */}
                    {(verificationStatus === 'ACTIVE' || verificationStatus === 'EXPIRING_SOON') && (
                      <Button
                        onClick={() => handleMarkEntry(selectedStudent)}
                        className="w-full bg-[#15803d] hover:bg-[#166534] text-white text-sm font-black h-12 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10"
                      >
                        <Check className="w-5 h-5" />
                        <span>Confirm Meal Entry (Allow In)</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Standby Card when no query typed */
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Terminal Ready for Scan</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Ask the student for their 10-digit mobile number or name. Active passes will show instant green approval.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: ROSTER & RECENT CHECK-INS (lg:col-span-5) ================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Recent Dining Hall Check-ins */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#15803d] flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Today's Verified Diners</h4>
              </div>
              <span className="text-xs font-mono font-bold text-[#15803d] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {checkedInIds.length} Verified
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {checkedInIds.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#15803d] font-bold flex items-center justify-center text-xs flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Checked In
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Roster List (Browse Students by Name) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                Student Directory ({students.length})
              </h4>
              <span className="text-[11px] text-slate-400">Click name to verify</span>
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {students.slice(0, 15).map((s) => {
                const sSub = subMap.get(s.id)
                const isActive = sSub?.status === 'ACTIVE'
                return (
                  <button
                    key={s.id}
                    onClick={() => setQuery(s.mobile)}
                    className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between text-left group"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 group-hover:text-[#15803d] block">
                        {s.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {s.mobile} • ₹{(s.monthlyFee || 3500).toLocaleString()}/mo
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
