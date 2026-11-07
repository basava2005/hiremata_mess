import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  CalendarOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Key,
  EyeOff,
  Copy,
  Check,
  Shield,
  Send,
  Bell,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import { studentsApi } from '../../api/students'
import { subscriptionsApi } from '../../api/subscriptions'
import { paymentsApi } from '../../api/payments'
import { leavesApi } from '../../api/leaves'
import { extensionsApi } from '../../api/extensions'
import { remindersApi } from '../../api/reminders'
import { Student, Subscription, Payment, LeaveRequest, LeaveExtension } from '../../types'
import { formatCurrency, formatDate, getDaysRemaining } from '../../lib/dates'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { BulkWaReminderModal } from '../../components/admin/BulkWaReminderModal'
import { PasswordResetRequestsModal } from '../../components/admin/PasswordResetRequestsModal'
import { authApi } from '../../api/auth'

export const AdminStudentsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'INACTIVE'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal states
  const [isBulkWaOpen, setIsBulkWaOpen] = useState(false)
  const [isResetRequestsOpen, setIsResetRequestsOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [detailTab, setDetailTab] = useState<'SUBSCRIPTION' | 'PAYMENTS' | 'LEAVES' | 'EXTENSIONS'>('SUBSCRIPTION')

  // Form states for add/edit
  const [formName, setFormName] = useState('')
  const [formMobile, setFormMobile] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formMonthlyFee, setFormMonthlyFee] = useState<number>(3500)
  const [formCategory, setFormCategory] = useState<string>('STANDARD')
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copiedNotice, setCopiedNotice] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string
    mobile: string
    username: string
    pass: string
  } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [remindingStudentId, setRemindingStudentId] = useState<string | null>(null)

  const handleSendReminder = async (student: Student) => {
    try {
      setRemindingStudentId(student.id)
      const res = await remindersApi.sendReminder({ studentId: student.id })
      toast.success(`Renewal reminder sent to ${student.name}!`, {
        description: 'Dispatched via Firebase push notification & carrier SMS.',
      })
      if (res.reminders?.[0]?.whatsappUrl) {
        toast('Open in WhatsApp?', {
          action: {
            label: 'WhatsApp',
            onClick: () => window.open(res.reminders[0].whatsappUrl, '_blank'),
          },
        })
      }
    } catch (err: any) {
      toast.error('Failed to send reminder: ' + (err.response?.data?.detail || err.message))
    } finally {
      setRemindingStudentId(null)
    }
  }

  const generateSecurePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
    let pass = 'Hiremat@'
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormPassword(pass)
  }

  // Fetch all students
  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ['adminStudents'],
    queryFn: () => studentsApi.getStudents(),
  })

  // Fetch password reset requests
  const { data: resetRequests = [] } = useQuery({
    queryKey: ['adminPasswordResetRequests'],
    queryFn: () => authApi.getPasswordResetRequests(),
    refetchInterval: 30000,
  })

  const pendingResetCount = resetRequests.filter((r) => r.status === 'PENDING').length

  // Fetch all subscriptions for status lookup
  const { data: subscriptions = [], isLoading: isSubsLoading } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: () => subscriptionsApi.getSubscriptions(),
  })

  // Quick lookup map: studentId -> subscription
  const subMap = useMemo(() => {
    const map = new Map<string, Subscription>()
    subscriptions.forEach((sub) => {
      map.set(sub.studentId, sub)
    })
    return map
  }, [subscriptions])

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.mobile.includes(q) ||
        student.address.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (statusFilter === 'ALL') return true
      if (statusFilter === 'INACTIVE') return !student.isActive

      // For Active, Expiring Soon, Expired
      if (!student.isActive) return false
      const sub = subMap.get(student.id)
      if (!sub) return statusFilter === 'EXPIRED'
      return sub.status === statusFilter
    })
  }, [students, searchQuery, statusFilter, subMap])

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Handle open add modal
  const openAddModal = () => {
    setEditingStudent(null)
    setFormName('')
    setFormMobile('')
    setFormMonthlyFee(3500)
    setFormCategory('STANDARD')
    setFormUsername('')
    setFormPassword('')
    generateSecurePassword()
    setFormAddress('')
    setFormError(null)
    setCreatedCredentials(null)
    setIsAddModalOpen(true)
  }

  // Handle open edit modal
  const openEditModal = (student: Student) => {
    setEditingStudent(student)
    setFormName(student.name)
    setFormMobile(student.mobile)
    setFormMonthlyFee(student.monthlyFee || 3500)
    setFormCategory(student.category || 'STANDARD')
    setFormUsername(student.mobile)
    setFormPassword('')
    setFormAddress(student.address)
    setFormError(null)
    setCreatedCredentials(null)
    setIsAddModalOpen(true)
  }

  // Handle submit Add/Edit
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formName.trim() || !formMobile.trim() || !formAddress.trim()) {
      setFormError('Please fill in all required fields.')
      return
    }

    if (!/^\d{10}$/.test(formMobile.trim())) {
      setFormError('Mobile number must be exactly 10 digits.')
      return
    }

    if (!editingStudent && formPassword.trim().length < 6) {
      setFormError('Password must be at least 6 characters long.')
      return
    }

    setIsSaving(true)
    try {
      if (editingStudent) {
        await studentsApi.updateStudent(editingStudent.id, {
          name: formName.trim(),
          mobile: formMobile.trim(),
          address: formAddress.trim(),
          monthlyFee: Number(formMonthlyFee) || 3500,
          category: formCategory,
        })
        queryClient.invalidateQueries({ queryKey: ['adminStudents'] })
        setIsAddModalOpen(false)
      } else {
        const studentUsername = formUsername.trim() || formMobile.trim()
        const initialPass = formPassword.trim() || 'Hiremat@123'

        await studentsApi.createStudent({
          name: formName.trim(),
          mobile: formMobile.trim(),
          address: formAddress.trim(),
          password: initialPass,
          username: studentUsername,
          monthlyFee: Number(formMonthlyFee) || 3500,
          category: formCategory,
        })

        queryClient.invalidateQueries({ queryKey: ['adminStudents'] })
        setCreatedCredentials({
          name: formName.trim(),
          mobile: formMobile.trim(),
          username: studentUsername,
          pass: initialPass,
        })
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save student.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Deactivate / Reactivate
  const handleToggleActive = async (student: Student) => {
    const action = student.isActive ? 'deactivate' : 'reactivate'
    if (!confirm(`Are you sure you want to ${action} ${student.name}?`)) return

    if (student.isActive) {
      await studentsApi.deactivateStudent(student.id)
    } else {
      await studentsApi.activateStudent(student.id)
    }
    queryClient.invalidateQueries({ queryKey: ['adminStudents'] })
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Mobile', 'Address', 'Status', 'Current Subscription End Date']
    const rows = filteredStudents.map((s) => {
      const sub = subMap.get(s.id)
      return [
        s.id,
        `"${s.name}"`,
        s.mobile,
        `"${s.address}"`,
        s.isActive ? (sub ? sub.status : 'NO_SUBSCRIPTION') : 'INACTIVE',
        sub ? sub.lastDate : 'N/A',
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `messpro_students_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Detail queries when a student is selected
  const viewingStudentSub = viewingStudent ? subMap.get(viewingStudent.id) : null
  const { data: viewingPayments = [] } = useQuery({
    queryKey: ['studentPayments', viewingStudent?.id],
    queryFn: () => paymentsApi.getPayments({ studentId: viewingStudent?.id }),
    enabled: !!viewingStudent,
  })
  const { data: viewingLeaves = [] } = useQuery({
    queryKey: ['studentLeaves', viewingStudent?.id],
    queryFn: () => leavesApi.getLeaves({ studentId: viewingStudent?.id }),
    enabled: !!viewingStudent,
  })
  const { data: viewingExtensions = [] } = useQuery({
    queryKey: ['studentExtensions', viewingStudent?.id],
    queryFn: () => extensionsApi.getExtensions({ studentId: viewingStudent?.id }),
    enabled: !!viewingStudent,
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Students Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage student registrations, subscription statuses, and profile records
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsResetRequestsOpen(true)}
            className={`text-xs h-9 font-bold shadow-xs flex items-center gap-1.5 rounded-xl ${
              pendingResetCount > 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>Reset Requests ({pendingResetCount})</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsBulkWaOpen(true)}
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs h-9 font-bold shadow-xs flex items-center gap-1.5 rounded-xl"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-white" />
            <span>Bulk WhatsApp</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs h-9"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={openAddModal}
            className="bg-[#15803d] hover:bg-[#166534] text-xs h-9 font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card>
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name, mobile, address..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {(['ALL', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'INACTIVE'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status)
                    setCurrentPage(1)
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? 'bg-[#15803d] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isStudentsLoading || isSubsLoading ? (
            <TableSkeleton rows={5} />
          ) : paginatedStudents.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Users className="w-6 h-6" />}
                title="No students found"
                description={
                  searchQuery
                    ? `No students match search query "${searchQuery}"`
                    : 'Get started by adding your first mess student.'
                }
                actionLabel="Add Student"
                onAction={openAddModal}
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4 hidden md:table-cell">Hostel / Address</th>
                  <th className="py-3 px-4">Subscription Status</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Last Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((student) => {
                  const sub = subMap.get(student.id)
                  const daysLeft = sub ? getDaysRemaining(sub.lastDate) : 0
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#15803d] font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {student.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-50 text-[#15803d] border border-emerald-200">
                                ₹{(student.monthlyFee || 3500).toLocaleString()}/mo
                              </span>
                              {student.category && student.category !== 'STANDARD' && (
                                <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  {student.category}
                                </span>
                              )}
                              {!student.isActive && (
                                <span className="text-[10px] text-rose-500 font-bold">
                                  (Deactivated)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {student.mobile}
                      </td>

                      <td className="py-3 px-4 hidden md:table-cell text-slate-500 max-w-xs truncate">
                        {student.address}
                      </td>

                      <td className="py-3 px-4">
                        {student.isActive ? (
                          sub ? (
                            <StatusBadge variant={sub.status}>
                              {sub.status === 'EXPIRING_SOON'
                                ? `${daysLeft}d left`
                                : sub.status.replace('_', ' ')}
                            </StatusBadge>
                          ) : (
                            <StatusBadge variant="DEFAULT">No Plan</StatusBadge>
                          )
                        ) : (
                          <StatusBadge variant="CANCELLED">Inactive</StatusBadge>
                        )}
                      </td>

                      <td className="py-3 px-4 hidden lg:table-cell text-slate-600">
                        {sub ? formatDate(sub.lastDate) : '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {student.mobile && (
                            <a
                              href={`https://api.whatsapp.com/send?phone=91${student.mobile.replace(/\D/g, '').slice(-10)}&text=${encodeURIComponent(
                                `ನಮಸ್ಕಾರ ${student.name},\nThis is Hiremat Mess Davangere (BIET Road).\nYour registered account mobile is +91 ${student.mobile}.\n\n📍 BIET Rd, Davangere\n📞 Contact Admins: Chandan (8431413551) / Punith (8073113562)`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat / Send WhatsApp to Student"
                              className="p-1.5 rounded-lg text-[#25D366] hover:bg-emerald-50 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4 fill-current" />
                            </a>
                          )}

                          <button
                            onClick={() => handleSendReminder(student)}
                            disabled={remindingStudentId === student.id}
                            title="Send Renewal Reminder via Firebase & SMS"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Bell className={`w-4 h-4 ${remindingStudentId === student.id ? 'animate-bounce text-amber-600' : ''}`} />
                          </button>

                          <button
                            onClick={() => {
                              setViewingStudent(student)
                              setDetailTab('SUBSCRIPTION')
                            }}
                            title="View Student Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#15803d] hover:bg-emerald-50"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(student)}
                            title="Edit Student"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleActive(student)}
                            title={student.isActive ? 'Deactivate Student' : 'Reactivate Student'}
                            className={`p-1.5 rounded-lg ${
                              student.isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {student.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {/* Pagination Footer */}
          {filteredStudents.length > pageSize && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} students
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 px-2 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="px-2 text-xs font-semibold text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2 text-xs"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Student Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#15803d] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingStudent ? 'Edit Student Details' : 'Enroll Student & Set Login'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {createdCredentials ? (
              <div className="space-y-4 animate-in zoom-in-95">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#15803d] text-white flex items-center justify-center mx-auto shadow">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-emerald-950 text-sm">Student Enrolled Successfully!</h4>
                  <p className="text-[11px] text-emerald-800">
                    Login credentials have been securely provisioned for {createdCredentials.name}.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-sans font-semibold text-slate-500">Username / Mobile:</span>
                    <span className="font-bold text-slate-900">{createdCredentials.username}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-sans font-semibold text-slate-500">Initial Password:</span>
                    <span className="font-bold text-[#15803d] bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {createdCredentials.pass}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <span>The student can verify their phone & change this password using OTP on their portal.</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const text = `Welcome to Hiremat Mess Davangere! Your student login credentials:\nUsername/Mobile: ${createdCredentials.username}\nInitial Password: ${createdCredentials.pass}\nLogin at: ${window.location.origin}/login\nYou can change your password using OTP verification anytime.`
                      navigator.clipboard.writeText(text)
                      setCopiedNotice(true)
                      setTimeout(() => setCopiedNotice(false), 2000)
                    }}
                    className="w-1/2 text-xs h-9 font-semibold"
                  >
                    {copiedNotice ? <Check className="w-3.5 h-3.5 mr-1 text-[#15803d]" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedNotice ? 'Copied!' : 'Copy Info'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-1/2 bg-[#15803d] hover:bg-[#166534] text-xs h-9 font-bold"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveStudent} className="space-y-3">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    10-Digit Mobile Number (Login ID)
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={formMobile}
                    onChange={(e) => {
                      setFormMobile(e.target.value)
                      if (!formUsername) setFormUsername(e.target.value)
                    }}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                  />
                </div>

                {!editingStudent && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-700">
                          Initial Password
                        </label>
                        <button
                          type="button"
                          onClick={generateSecurePassword}
                          className="text-[10px] text-[#15803d] hover:underline font-bold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          Auto-Generate
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="e.g. Hiremat@2026"
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          required
                          className="w-full text-xs p-2.5 pr-9 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d] font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Student can change this password anytime using OTP verification.
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Monthly Mess Fee (₹)
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => { setFormMonthlyFee(3500); setFormCategory('STANDARD') }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                          formMonthlyFee === 3500 && formCategory === 'STANDARD'
                            ? 'bg-emerald-100 border-emerald-400 text-[#15803d]'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ₹3,500 Regular
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFormMonthlyFee(2800); setFormCategory('PUC') }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                          formMonthlyFee === 2800
                            ? 'bg-amber-100 border-amber-400 text-amber-800'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ₹2,800 PUC
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFormMonthlyFee(3000); setFormCategory('PUC') }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                          formMonthlyFee === 3000
                            ? 'bg-amber-100 border-amber-400 text-amber-800'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ₹3,000 PUC
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        min={1000}
                        max={10000}
                        step={50}
                        value={formMonthlyFee}
                        onChange={(e) => setFormMonthlyFee(Number(e.target.value))}
                        required
                        className="w-full text-xs p-2.5 pl-6 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d] font-bold"
                      />
                    </div>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                    >
                      <option value="STANDARD">Regular / Degree (₹3,500)</option>
                      <option value="PUC">PUC Student (Reduced Fee)</option>
                      <option value="CONCESSION">Special Concession</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Custom monthly fee for PUC or financially constrained students. All future billing will calculate at this rate.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Hostel / Room Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Room 302, Bapu Hostel, BIET Road"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-1/2 text-xs h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSaving}
                    className="w-1/2 bg-[#15803d] hover:bg-[#166534] text-xs h-9 font-semibold"
                  >
                    {editingStudent ? 'Save Changes' : 'Enroll Student'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Student Detail Modal / Drawer with 4 Tabs */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center font-bold text-sm">
                  {viewingStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {viewingStudent.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {viewingStudent.mobile} • {viewingStudent.address}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {/* 4 Tabs Navigation */}
            <div className="flex border-b border-slate-200 px-4 bg-white overflow-x-auto">
              {[
                { id: 'SUBSCRIPTION', label: 'Subscription', icon: Calendar },
                { id: 'PAYMENTS', label: 'Payments', icon: CreditCard },
                { id: 'LEAVES', label: 'Leaves', icon: CalendarOff },
                { id: 'EXTENSIONS', label: 'Extensions', icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      detailTab === tab.id
                        ? 'border-[#15803d] text-[#15803d]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {/* Tab 1: Subscription */}
              {detailTab === 'SUBSCRIPTION' && (
                <div className="space-y-4 text-xs">
                  {viewingStudentSub ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">
                          {viewingStudentSub.plan?.name || 'Standard Monthly Plan'}
                        </span>
                        <StatusBadge variant={viewingStudentSub.status}>
                          {viewingStudentSub.status}
                        </StatusBadge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Start Date:</span>
                          <span className="font-semibold text-slate-800">
                            {formatDate(viewingStudentSub.startDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Last Included Date:</span>
                          <span className="font-semibold text-slate-800">
                            {formatDate(viewingStudentSub.lastDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Days Remaining:</span>
                          <span className="font-bold text-[#15803d]">
                            {getDaysRemaining(viewingStudentSub.lastDate)} days left
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Meals:</span>
                          <span className="font-semibold text-slate-800">
                            {viewingStudentSub.plan?.mealsLabel || 'Lunch + Dinner'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      title="No active subscription"
                      description="Record a manual payment to activate this student's subscription."
                    />
                  )}
                </div>
              )}

              {/* Tab 2: Payments */}
              {detailTab === 'PAYMENTS' && (
                <div className="space-y-3 text-xs">
                  {viewingPayments.length === 0 ? (
                    <EmptyState title="No payments on record" />
                  ) : (
                    viewingPayments.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{formatCurrency(p.amount)}</p>
                          <p className="text-[10px] text-slate-500">
                            {formatDate(p.date)} • {p.paymentMethod} • Ref: {p.receiptNumber}
                          </p>
                        </div>
                        <StatusBadge variant={p.status}>{p.status}</StatusBadge>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Leaves */}
              {detailTab === 'LEAVES' && (
                <div className="space-y-3 text-xs">
                  {viewingLeaves.length === 0 ? (
                    <EmptyState title="No leave requests" />
                  ) : (
                    viewingLeaves.map((l) => (
                      <div
                        key={l.id}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {formatDate(l.startDate)} - {formatDate(l.endDate)}
                          </span>
                          <StatusBadge variant={l.status}>{l.status}</StatusBadge>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {l.daysCount} days • {l.reason}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: Extensions */}
              {detailTab === 'EXTENSIONS' && (
                <div className="space-y-3 text-xs">
                  {viewingExtensions.length === 0 ? (
                    <EmptyState title="No extensions on record" />
                  ) : (
                    viewingExtensions.map((e) => (
                      <div
                        key={e.id}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#15803d]">
                            +{e.daysAdded} Days Added
                          </span>
                          <StatusBadge variant={e.status}>{e.status}</StatusBadge>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Old: {formatDate(e.oldLastDate)} → New: {formatDate(e.newLastDate)}
                        </p>
                        {e.note && <p className="text-[10px] text-slate-600 italic">{e.note}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingStudent(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk WhatsApp Reminder Modal */}
      <BulkWaReminderModal
        open={isBulkWaOpen}
        onClose={() => setIsBulkWaOpen(false)}
        students={students}
        subscriptions={subscriptions}
      />

      {/* Password Reset Requests Modal */}
      <PasswordResetRequestsModal
        open={isResetRequestsOpen}
        onClose={() => setIsResetRequestsOpen(false)}
      />
    </div>
  )
}
