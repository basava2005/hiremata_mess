import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarOff,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Clock,
  User,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'
import { leavesApi, CreateLeavePayload } from '../../api/leaves'
import { studentsApi } from '../../api/students'
import { LeaveRequest, LeaveStatus, Student } from '../../types'
import { formatDate, getTodayIST, inclusiveDays } from '../../lib/dates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'

export const AdminLeavesPage: React.FC = () => {
  const queryClient = useQueryClient()
  const today = getTodayIST()

  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL'>('PENDING')
  const [searchQuery, setSearchQuery] = useState('')

  // Action Dialog state (Approve/Reject with Note)
  const [selectedLeaveForAction, setSelectedLeaveForAction] = useState<{
    leave: LeaveRequest
    action: 'APPROVED' | 'REJECTED'
  } | null>(null)
  const [actionNote, setActionNote] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Add Leave for Student (Admin Direct Creation)
  const [isAddLeaveModalOpen, setIsAddLeaveModalOpen] = useState(false)
  const [addStudentId, setAddStudentId] = useState('')
  const [addStartDate, setAddStartDate] = useState(today)
  const [addEndDate, setAddEndDate] = useState(today)
  const [addReason, setAddReason] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [isAddingLeave, setIsAddingLeave] = useState(false)

  // Fetch all leaves
  const { data: leaves = [], isLoading: isLeavesLoading } = useQuery({
    queryKey: ['adminLeaves'],
    queryFn: () => leavesApi.getLeaves(),
  })

  // Fetch all students for student name lookup
  const { data: students = [] } = useQuery({
    queryKey: ['adminStudents'],
    queryFn: () => studentsApi.getStudents(),
  })

  const studentMap = useMemo(() => {
    const map = new Map<string, Student>()
    students.forEach((s) => map.set(s.id, s))
    return map
  }, [students])

  // Filter leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      if (activeTab === 'PENDING' && leave.status !== 'PENDING') return false

      const q = searchQuery.toLowerCase().trim()
      if (!q) return true

      const student = studentMap.get(leave.studentId)
      return (
        leave.reason.toLowerCase().includes(q) ||
        (student && student.name.toLowerCase().includes(q)) ||
        (student && student.mobile.includes(q))
      )
    })
  }, [leaves, activeTab, searchQuery, studentMap])

  // Handle Approve / Reject submission
  const handleConfirmStatusChange = async () => {
    if (!selectedLeaveForAction) return
    setIsUpdatingStatus(true)
    try {
      await leavesApi.updateLeaveStatus(
        selectedLeaveForAction.leave.id,
        selectedLeaveForAction.action,
        actionNote.trim() || undefined
      )
      queryClient.invalidateQueries({ queryKey: ['adminLeaves'] })
      queryClient.invalidateQueries({ queryKey: ['adminEligibleExtensions'] })
      setSelectedLeaveForAction(null)
      setActionNote('')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle Admin Direct Leave Creation
  const handleCreateAdminLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError(null)

    if (!addStudentId) {
      setAddError('Please select a student.')
      return
    }

    if (addEndDate < addStartDate) {
      setAddError('End date cannot be earlier than start date.')
      return
    }

    if (!addReason.trim()) {
      setAddError('Please provide a reason.')
      return
    }

    setIsAddingLeave(true)
    try {
      await leavesApi.createLeave({
        studentId: addStudentId,
        startDate: addStartDate,
        endDate: addEndDate,
        reason: addReason.trim(),
        status: 'APPROVED', // Admin-created leaves are approved directly
        adminNote: 'Created directly by Branch Admin',
      })
      queryClient.invalidateQueries({ queryKey: ['adminLeaves'] })
      queryClient.invalidateQueries({ queryKey: ['adminEligibleExtensions'] })
      setIsAddLeaveModalOpen(false)
      setAddReason('')
      setAddStudentId('')
    } catch (err: any) {
      setAddError(err.message || 'Failed to create leave.')
    } finally {
      setIsAddingLeave(false)
    }
  }

  const computedAdminDays = inclusiveDays(addStartDate, addEndDate)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Leaves Administration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Review pending student leave requests and record direct excused absences
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddLeaveModalOpen(true)}
          className="bg-[#15803d] hover:bg-[#166534] text-xs h-9 font-semibold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Leave for Student
        </Button>
      </div>

      {/* Tabs & Search */}
      <Card>
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'PENDING'
                    ? 'bg-white text-yellow-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Pending Approvals</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-yellow-100 text-yellow-800">
                  {leaves.filter((l) => l.status === 'PENDING').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('ALL')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Leaves ({leaves.length})
              </button>
            </div>

            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search leaves by student name, mobile, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaves Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLeavesLoading ? (
            <TableSkeleton rows={4} />
          ) : filteredLeaves.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<CalendarOff className="w-6 h-6" />}
                title={activeTab === 'PENDING' ? 'No pending leave requests' : 'No leaves recorded'}
                description={
                  activeTab === 'PENDING'
                    ? 'All student leaves have been processed.'
                    : 'Add a student leave to begin tracking.'
                }
                actionLabel="Add Leave for Student"
                onAction={() => setIsAddLeaveModalOpen(true)}
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Leave Dates</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((leave) => {
                  const student = studentMap.get(leave.studentId)
                  const days = leave.daysCount || inclusiveDays(leave.startDate, leave.endDate)
                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {student?.name || leave.studentName || 'Student'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {student?.mobile}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-[#15803d] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        <p className="truncate font-medium">{leave.reason}</p>
                        {leave.adminNote && (
                          <p className="text-[10px] text-slate-400 italic">
                            Note: {leave.adminNote}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge variant={leave.status}>{leave.status}</StatusBadge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {leave.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() =>
                                setSelectedLeaveForAction({ leave, action: 'APPROVED' })
                              }
                              className="h-7 px-2.5 text-[11px] bg-[#15803d] hover:bg-[#166534]"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setSelectedLeaveForAction({ leave, action: 'REJECTED' })
                              }
                              className="h-7 px-2.5 text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Approve / Reject Dialog with Note */}
      {selectedLeaveForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedLeaveForAction.action === 'APPROVED' ? 'Approve Leave' : 'Reject Leave'}
              </h3>
              <button
                onClick={() => setSelectedLeaveForAction(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <p>
                  <strong>Student:</strong>{' '}
                  {studentMap.get(selectedLeaveForAction.leave.studentId)?.name || 'Student'}
                </p>
                <p>
                  <strong>Dates:</strong> {formatDate(selectedLeaveForAction.leave.startDate)} to{' '}
                  {formatDate(selectedLeaveForAction.leave.endDate)} (
                  {inclusiveDays(
                    selectedLeaveForAction.leave.startDate,
                    selectedLeaveForAction.leave.endDate
                  )}{' '}
                  days)
                </p>
                <p>
                  <strong>Reason:</strong> {selectedLeaveForAction.leave.reason}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Admin Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Approved medical leave with certificate..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedLeaveForAction(null)}
                  className="w-1/2 text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmStatusChange}
                  isLoading={isUpdatingStatus}
                  className={`w-1/2 text-xs h-9 font-semibold ${
                    selectedLeaveForAction.action === 'APPROVED'
                      ? 'bg-[#15803d] hover:bg-[#166534]'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {selectedLeaveForAction.action === 'APPROVED' ? 'Approval' : 'Rejection'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Leave for Student Modal (Admin-created, approved directly) */}
      {isAddLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add Leave for Student</h3>
              <button
                onClick={() => setIsAddLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdminLeave} className="space-y-3">
              {addError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Select Student
                </label>
                <select
                  value={addStudentId}
                  onChange={(e) => setAddStudentId(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.mobile})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={addStartDate}
                    onChange={(e) => {
                      setAddStartDate(e.target.value)
                      if (addEndDate < e.target.value) setAddEndDate(e.target.value)
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
                    min={addStartDate}
                    value={addEndDate}
                    onChange={(e) => setAddEndDate(e.target.value)}
                    required
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold text-[#15803d]">
                  {computedAdminDays} {computedAdminDays === 1 ? 'day' : 'days'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Reason / Excuse
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified family emergency or medical excuse"
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900">
                ✓ Directly approved without advance notice restriction.
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddLeaveModalOpen(false)}
                  className="w-1/2 text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isAddingLeave}
                  className="w-1/2 bg-[#15803d] hover:bg-[#166534] text-xs h-9 font-semibold"
                >
                  Add & Approve
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
