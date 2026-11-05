import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IndianRupee,
  Search,
  Plus,
  Download,
  Receipt,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { paymentsApi, CreatePaymentPayload } from '../../api/payments'
import { studentsApi } from '../../api/students'
import { Payment, PaymentMethod, PaymentStatus, Student } from '../../types'
import { formatCurrency, formatDate, getTodayIST } from '../../lib/dates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'

export const AdminPaymentsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const today = getTodayIST()

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null)

  // Form states
  const [studentId, setStudentId] = useState('')
  const [amount, setAmount] = useState('3500')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [paymentDate, setPaymentDate] = useState(today)
  const [notes, setNotes] = useState('Manual mess fee payment')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch payments
  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: () => paymentsApi.getPayments(),
  })

  // Fetch students for dropdown
  const { data: students = [] } = useQuery({
    queryKey: ['adminStudents'],
    queryFn: () => studentsApi.getStudents(),
  })

  const studentMap = useMemo(() => {
    const map = new Map<string, Student>()
    students.forEach((s) => map.set(s.id, s))
    return map
  }, [students])

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (activeTab === 'PENDING' && p.status !== 'PENDING') return false

      const q = searchQuery.toLowerCase().trim()
      if (!q) return true

      const student = studentMap.get(p.studentId)
      return (
        p.receiptNumber.toLowerCase().includes(q) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q)) ||
        (student && student.name.toLowerCase().includes(q)) ||
        (student && student.mobile.includes(q))
      )
    })
  }, [payments, activeTab, searchQuery, studentMap])

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Handle Record Manual Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!studentId) {
      setFormError('Please select a student.')
      return
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid payment amount.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreatePaymentPayload = {
        studentId,
        amount: numAmount,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        status: 'SUCCESS',
        date: paymentDate,
        notes: notes.trim(),
      }

      await paymentsApi.recordManualPayment(payload)
      queryClient.invalidateQueries({ queryKey: ['adminPayments'] })
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] })

      setIsRecordModalOpen(false)
      setReferenceNumber('')
      setAmount('3500')
    } catch (err: any) {
      setFormError(err.message || 'Failed to record payment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reconcile pending payment
  const handleReconcilePayment = async (payment: Payment, newStatus: 'SUCCESS' | 'FAILED') => {
    await paymentsApi.recordManualPayment({
      studentId: payment.studentId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      status: newStatus,
      date: payment.date,
      notes: `Reconciled manually: ${newStatus}`,
    })
    queryClient.invalidateQueries({ queryKey: ['adminPayments'] })
    queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] })
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Receipt No', 'Date', 'Student Name', 'Mobile', 'Amount (INR)', 'Method', 'Status', 'Reference']
    const rows = filteredPayments.map((p) => {
      const student = studentMap.get(p.studentId)
      return [
        p.receiptNumber,
        p.date,
        `"${student?.name || p.studentName || 'Student'}"`,
        student?.mobile || '',
        p.amount,
        p.paymentMethod,
        p.status,
        `"${p.referenceNumber || ''}"`,
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `messpro_payments_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Payments & Collections
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Record manual fees, reconcile pending transactions, and issue receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            onClick={() => setIsRecordModalOpen(true)}
            className="bg-[#15803d] hover:bg-[#166534] text-xs h-9 font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Record Manual Payment
          </Button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <Card>
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setActiveTab('ALL')
                  setCurrentPage(1)
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Payments ({payments.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('PENDING')
                  setCurrentPage(1)
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'PENDING'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Pending Reconciliation</span>
                {payments.filter((p) => p.status === 'PENDING').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            </div>

            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by receipt no, student name, reference..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isPaymentsLoading ? (
            <TableSkeleton rows={5} />
          ) : paginatedPayments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<IndianRupee className="w-6 h-6" />}
                title={activeTab === 'PENDING' ? 'No pending payments' : 'No payments found'}
                description={
                  activeTab === 'PENDING'
                    ? 'All transactions have been reconciled.'
                    : 'Record your first manual cash or UPI payment.'
                }
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPayments.map((p) => {
                  const student = studentMap.get(p.studentId)
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {p.receiptNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(p.date)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {student?.name || p.studentName || 'Student'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {student?.mobile}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">
                        {p.paymentMethod}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge variant={p.status}>{p.status}</StatusBadge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleReconcilePayment(p, 'SUCCESS')}
                                className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReconcilePayment(p, 'FAILED')}
                                className="h-7 px-2 text-[11px] text-rose-600 border-rose-200"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReceipt(p)}
                            className="h-7 px-2 text-[11px] text-slate-700 hover:text-[#15803d]"
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1" />
                            Receipt
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {filteredPayments.length > pageSize && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredPayments.length)} of {filteredPayments.length} transactions
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

      {/* Record Manual Payment Dialog */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Record Manual Payment</h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Select Student
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
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
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Reference # (UPI ID / Voucher No)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-9921448102 or CASH-VCH"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#15803d]"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <span className="font-semibold block">⚡ Auto-Renewal Notice:</span>
                Recording this payment will automatically activate or renew the student's 30-day subscription.
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="w-1/2 text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-1/2 bg-[#15803d] hover:bg-[#166534] text-xs h-9 font-semibold"
                >
                  Record & Activate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 print:shadow-none print:border-0 print:p-0">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-[#15803d] text-white flex items-center justify-center text-xs font-bold">
                    M
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">MessPro</h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hiremat Mess Davangere • Anjaneya Layout 5th Cross, BIET Rd, Davangere 577004
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-bold text-slate-800">
                  {selectedReceipt.receiptNumber}
                </span>
                <p className="text-[10px] text-slate-400">
                  {formatDate(selectedReceipt.date)}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name:</span>
                  <span className="font-bold text-slate-800">
                    {studentMap.get(selectedReceipt.studentId)?.name || selectedReceipt.studentName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Mode:</span>
                  <span className="font-medium text-slate-700">{selectedReceipt.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Reference #:</span>
                  <span className="font-mono text-slate-700">
                    {selectedReceipt.referenceNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status:</span>
                  <StatusBadge variant={selectedReceipt.status}>{selectedReceipt.status}</StatusBadge>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-slate-100/70 px-3 py-1.5 flex justify-between font-semibold text-slate-700 text-[11px]">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800">Monthly Mess Subscription</p>
                    <p className="text-[10px] text-slate-500">30 Days Unlimited Homestyle Meals</p>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(selectedReceipt.amount)}
                  </span>
                </div>
                <div className="bg-slate-50 px-3 py-2 border-t flex justify-between items-center font-bold text-sm text-slate-900">
                  <span>Total Received</span>
                  <span className="text-[#15803d]">
                    {formatCurrency(selectedReceipt.amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-[#15803d] hover:bg-[#166534] text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
