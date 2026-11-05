import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  AlertTriangle,
  Clock,
  CalendarOff,
  Sparkles,
  IndianRupee,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Phone,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { studentsApi } from '../../api/students'
import { subscriptionsApi } from '../../api/subscriptions'
import { paymentsApi } from '../../api/payments'
import { leavesApi } from '../../api/leaves'
import { extensionsApi } from '../../api/extensions'
import { formatCurrency, formatDate, getDaysRemaining } from '../../lib/dates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CardSkeleton, TableSkeleton } from '../../components/ui/Skeleton'

export const AdminDashboardPage: React.FC = () => {
  // 1. Fetch Students
  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ['adminStudents'],
    queryFn: () => studentsApi.getStudents(),
  })

  // 2. Fetch Subscriptions
  const { data: subscriptions = [], isLoading: isSubsLoading } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: () => subscriptionsApi.getSubscriptions(),
  })

  // 3. Fetch Payments
  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: () => paymentsApi.getPayments(),
  })

  // 4. Fetch Leaves
  const { data: leaves = [], isLoading: isLeavesLoading } = useQuery({
    queryKey: ['adminLeaves'],
    queryFn: () => leavesApi.getLeaves(),
  })

  // 5. Fetch Extension Eligible
  const { data: eligibleStudents = [], isLoading: isEligibleLoading } = useQuery({
    queryKey: ['adminEligibleExtensions'],
    queryFn: () => extensionsApi.getEligibleStudents(),
  })

  const isLoading =
    isStudentsLoading || isSubsLoading || isPaymentsLoading || isLeavesLoading || isEligibleLoading

  // Compute metrics
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE').length
  const expiringSoonSubs = subscriptions.filter((s) => s.status === 'EXPIRING_SOON')
  const expiredSubs = subscriptions.filter((s) => s.status === 'EXPIRED').length
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length
  const eligibleExtensionCount = eligibleStudents.length

  const totalCollectedThisMonth = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={4} />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Active Subscriptions',
      value: activeSubs,
      icon: Users,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      link: '/admin/students?status=ACTIVE',
    },
    {
      label: 'Expiring in ≤ 3 Days',
      value: expiringSoonSubs.length,
      icon: AlertTriangle,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      link: '/admin/students?status=EXPIRING_SOON',
    },
    {
      label: 'Expired Subscriptions',
      value: expiredSubs,
      icon: Clock,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      link: '/admin/students?status=EXPIRED',
    },
    {
      label: 'Pending Leaves',
      value: pendingLeaves,
      icon: CalendarOff,
      color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      link: '/admin/leaves',
    },
    {
      label: 'Eligible for Extension',
      value: eligibleExtensionCount,
      icon: Sparkles,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      link: '/admin/extensions',
    },
    {
      label: 'Collected This Month',
      value: formatCurrency(totalCollectedThisMonth),
      icon: IndianRupee,
      color: 'text-[#15803d] bg-emerald-50 border-emerald-200',
      link: '/admin/payments',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Branch Operations Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Davangere Main Branch (BIET Rd) • Real-time status of students, subscriptions, and leave requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/students">
            <Button size="sm" className="bg-[#15803d] hover:bg-[#166534] text-xs">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Manage Students
            </Button>
          </Link>
          <Link to="/admin/payments">
            <Button variant="outline" size="sm" className="text-xs">
              <IndianRupee className="w-3.5 h-3.5 mr-1.5" />
              Record Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon
          return (
            <Link key={i} to={c.link} className="block group">
              <Card className="p-4 hover:shadow-md transition-all border-slate-200/90 group-hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${c.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight block">
                    {c.value}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 leading-tight block mt-0.5">
                    {c.label}
                  </span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Expiring Soon List & Quick Extension Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring-Soon List (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Expiring Soon (≤ 3 Days Left)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Students needing immediate renewal reminders
                </CardDescription>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {expiringSoonSubs.length} Students
              </span>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {expiringSoonSubs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  🎉 No subscriptions expiring within the next 3 days!
                </div>
              ) : (
                expiringSoonSubs.map((sub) => {
                  const student = students.find((s) => s.id === sub.studentId)
                  const daysLeft = getDaysRemaining(sub.lastDate)
                  return (
                    <div
                      key={sub.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {student?.name || 'Student'}
                          </span>
                          <StatusBadge variant="EXPIRING_SOON">
                            {daysLeft} {daysLeft === 1 ? 'day left' : 'days left'}
                          </StatusBadge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {student?.mobile}
                          </span>
                          <span>•</span>
                          <span>Last date: {formatDate(sub.lastDate)}</span>
                        </div>
                      </div>

                      <Link to={`/admin/payments?studentId=${sub.studentId}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-xs text-amber-800 border-amber-200 hover:bg-amber-50"
                        >
                          Renew
                        </Button>
                      </Link>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Extension Eligible Quick Summary */}
        <div className="space-y-4">
          <Card className="border-purple-200/80 bg-gradient-to-b from-purple-50/40 via-white to-white">
            <CardHeader className="pb-3 border-b border-purple-100">
              <CardTitle className="text-base font-bold text-purple-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Eligible for Extensions
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Students with $\ge 10$ consecutive approved leave days
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3.5 space-y-3">
              {eligibleStudents.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No students currently eligible for leave extension.
                </div>
              ) : (
                eligibleStudents.slice(0, 3).map((item) => (
                  <div
                    key={item.student.id}
                    className="p-3 rounded-xl bg-white border border-purple-100 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{item.student.name}</span>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        {item.eligibility.eligibleDays} days eligible
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Mobile: {item.student.mobile} • Sub ends {formatDate(item.subscription.lastDate)}
                    </p>
                  </div>
                ))
              )}

              <Link to="/admin/extensions" className="block pt-1">
                <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white text-xs h-9 font-semibold">
                  <span>Review Extensions Drawer</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
