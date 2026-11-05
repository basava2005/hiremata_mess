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
} from 'lucide-react'
import { studentsApi } from '../../api/students'
import { subscriptionsApi } from '../../api/subscriptions'
import { leavesApi } from '../../api/leaves'
import { Student, Subscription, LeaveRequest } from '../../types'
import { formatDate, getTodayIST, getDaysRemaining } from '../../lib/dates'
import { Card, CardContent } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export const StaffCheckStatusPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const today = getTodayIST()

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

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Check Student Status
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Search by 10-digit mobile number or student name for meal entry verification
        </p>
      </div>

      {/* Large Touch-Target Search Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-6 h-6 text-[#15803d]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter mobile number or student name..."
          autoFocus
          className="w-full pl-13 pr-10 py-4 text-base sm:text-lg rounded-2xl border-2 border-slate-300 bg-white shadow-sm focus:border-[#15803d] focus:ring-4 focus:ring-[#15803d]/20 transition-all font-medium placeholder:text-slate-400"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Match Shortcuts / Suggestions */}
      {!query && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick Test Search:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Rahul Verma (Active)', query: '9876543201' },
              { name: 'Pooja Iyer (Expiring Soon)', query: '9876543204' },
              { name: 'Vikas Sharma (Expired)', query: '9876543207' },
              { name: 'Aditya Kulkarni', query: 'Aditya' },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={() => setQuery(btn.query)}
                className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-[#15803d] hover:border-emerald-300 border border-transparent transition-all"
              >
                {btn.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Verification Result Card */}
      {query && (
        <div>
          {searchResults.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <XCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No Student Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                No registered student matches "{query}". Please check the mobile number.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Primary Matching Result Card */}
              <Card
                className={`overflow-hidden border-2 shadow-lg transition-all ${
                  verificationStatus === 'ACTIVE'
                    ? 'border-emerald-500 bg-white'
                    : verificationStatus === 'EXPIRING_SOON'
                    ? 'border-amber-500 bg-white'
                    : verificationStatus === 'ON_LEAVE'
                    ? 'border-blue-500 bg-white'
                    : 'border-rose-500 bg-white'
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
                      <span className="text-xs font-bold uppercase tracking-wider opacity-90 block">
                        Meal Entry Status
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                        {verificationStatus === 'ACTIVE' && 'MEAL ACCESS ALLOWED'}
                        {verificationStatus === 'EXPIRING_SOON' && 'ALLOWED (EXPIRING SOON)'}
                        {verificationStatus === 'ON_LEAVE' && 'ON APPROVED LEAVE'}
                        {verificationStatus === 'EXPIRED' && 'ACCESS DENIED (EXPIRED)'}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white/20 backdrop-blur">
                    {verificationStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Student Info Details */}
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block">
                        {selectedStudent.name}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        +91 {selectedStudent.mobile}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xl">
                      {selectedStudent.name.charAt(0)}
                    </div>
                  </div>

                  {/* Dates & Validity Info */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Subscription Validity
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {sub ? `${formatDate(sub.startDate)} – ${formatDate(sub.lastDate)}` : 'No Plan'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Last Included Date
                      </span>
                      <span className="text-sm font-extrabold text-[#15803d]">
                        {sub ? formatDate(sub.lastDate) : 'Expired'}
                      </span>
                    </div>
                  </div>

                  {/* Specific Status Notes */}
                  {verificationStatus === 'EXPIRING_SOON' && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        Reminder: {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left! Please advise student to renew soon.
                      </span>
                    </div>
                  )}

                  {verificationStatus === 'ON_LEAVE' && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-semibold flex items-center gap-2">
                      <CalendarOff className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>
                        Student is marked on approved leave until {formatDate(leaveToday?.endDate)}.
                      </span>
                    </div>
                  )}

                  {verificationStatus === 'EXPIRED' && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>
                        Subscription has expired. Student must renew with Branch Admin before meals.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Other Matching Results if multiple found */}
              {searchResults.length > 1 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Other Matching Students ({searchResults.length - 1}):
                  </p>
                  <div className="divide-y divide-slate-100 rounded-xl bg-white border border-slate-200 overflow-hidden">
                    {searchResults.slice(1, 5).map((other) => (
                      <button
                        key={other.id}
                        onClick={() => setQuery(other.mobile)}
                        className="w-full p-3 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{other.name}</span>
                          <span className="text-slate-500 font-mono ml-2">{other.mobile}</span>
                        </div>
                        <span className="text-[#15803d] font-semibold">Select →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
