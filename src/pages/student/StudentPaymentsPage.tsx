import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  Download,
  IndianRupee,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { paymentsApi } from '../../api/payments'
import { subscriptionsApi } from '../../api/subscriptions'
import { Payment, PaymentStatus } from '../../types'
import { RazorpayGatewayModal } from '../../components/payments/RazorpayGatewayModal'
import { formatCurrency, formatDate } from '../../lib/dates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'

export const StudentPaymentsPage: React.FC = () => {
  const { user, student } = useAuth()
  const studentId = student?.id || user?.studentId || 'stud-01'
  const queryClient = useQueryClient()

  const [isGatewayOpen, setIsGatewayOpen] = useState(false)
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [outcomeNotice, setOutcomeNotice] = useState<string | null>(null)

  // Fetch payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['studentPayments', studentId],
    queryFn: () => paymentsApi.getPayments({ studentId }),
  })

  // Mock gateway payment handler
  const handleSimulatePayment = async (status: PaymentStatus) => {
    setIsProcessing(true)
    setOutcomeNotice(null)
    try {
      const res = await paymentsApi.initiateOnlinePayment(studentId, 3500, status)
      queryClient.invalidateQueries({ queryKey: ['studentPayments', studentId] })
      queryClient.invalidateQueries({ queryKey: ['studentSubscription', studentId] })

      if (status === 'SUCCESS') {
        setOutcomeNotice('Payment of ₹3,500 successful! Your subscription is activated/renewed.')
        setTimeout(() => {
          setIsGatewayOpen(false)
          setOutcomeNotice(null)
          setSelectedPaymentForReceipt(res)
        }, 1200)
      } else if (status === 'PENDING') {
        setOutcomeNotice('Payment initiated and pending bank confirmation. Admin will reconcile.')
        setTimeout(() => {
          setIsGatewayOpen(false)
          setOutcomeNotice(null)
        }, 1400)
      } else {
        setOutcomeNotice('Payment transaction failed or was cancelled by user.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRazorpaySuccess = async (details: { paymentId: string; method: string; reference: string }) => {
    setIsProcessing(true)
    try {
      const res = await paymentsApi.initiateOnlinePayment(studentId, 3500, 'SUCCESS')
      queryClient.invalidateQueries({ queryKey: ['studentPayments', studentId] })
      queryClient.invalidateQueries({ queryKey: ['studentSubscription', studentId] })
      setIsGatewayOpen(false)
      setSelectedPaymentForReceipt({
        ...res,
        referenceNumber: details.reference,
        paymentMethod: details.method as any,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Payments & Receipts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            View transaction history and download tax receipts
          </p>
        </div>
        <Button
          onClick={() => setIsGatewayOpen(true)}
          className="bg-[#15803d] hover:bg-[#166534] text-xs font-semibold h-9 px-3.5 shadow-sm"
        >
          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
          Pay ₹3,500
        </Button>
      </div>

      {/* Subscription Fee Banner */}
      <Card className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-0 shadow-md">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
              Standard Monthly Plan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">₹3,500</span>
              <span className="text-xs text-slate-300">/ 30 calendar days</span>
            </div>
            <p className="text-xs text-slate-300">Unlimited Homestyle Lunch + Dinner</p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsGatewayOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Pay Now
          </Button>
        </CardContent>
      </Card>

      {/* Payments History List */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">
            Payment History ({payments.length})
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Receipts issued for online, UPI, and cash payments
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100">
          {isLoading ? (
            <TableSkeleton rows={3} />
          ) : payments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<CreditCard className="w-6 h-6" />}
                title="No payments recorded"
                description="Make your first subscription fee payment to activate your mess service."
                actionLabel="Pay ₹3,500"
                onAction={() => setIsGatewayOpen(true)}
              />
            </div>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {formatCurrency(p.amount)}
                    </span>
                    <StatusBadge variant={p.status}>{p.status}</StatusBadge>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{formatDate(p.date)}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">{p.paymentMethod}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-400">{p.receiptNumber}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPaymentForReceipt(p)}
                  className="h-8 px-2.5 text-xs text-slate-700 hover:text-[#15803d] hover:border-[#15803d]"
                >
                  <Receipt className="w-3.5 h-3.5 mr-1" />
                  Receipt
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Official Razorpay Payment Gateway Modal */}
      <RazorpayGatewayModal
        open={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        amount={3500}
        studentId={studentId}
        studentName={student?.name || user?.name || 'Student'}
        studentMobile={student?.mobile || user?.mobile || '9876543201'}
        onPaymentSuccess={handleRazorpaySuccess}
      />

      {/* Printable Receipt Modal */}
      {selectedPaymentForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 print:shadow-none print:border-0 print:p-0">
            {/* Receipt Header */}
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
                  {selectedPaymentForReceipt.receiptNumber}
                </span>
                <p className="text-[10px] text-slate-400">
                  {formatDate(selectedPaymentForReceipt.date)}
                </p>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Received From:</span>
                  <span className="font-bold text-slate-800">
                    {student?.name || user?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mobile:</span>
                  <span className="font-medium text-slate-700">{user?.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Mode:</span>
                  <span className="font-medium text-slate-700">
                    {selectedPaymentForReceipt.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Ref No:</span>
                  <span className="font-mono text-slate-700 truncate">
                    {selectedPaymentForReceipt.referenceNumber || 'N/A'}
                  </span>
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
                    <p className="text-[10px] text-slate-500">30 Days Unlimited Meals (Lunch + Dinner)</p>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(selectedPaymentForReceipt.amount)}
                  </span>
                </div>
                <div className="bg-slate-50 px-3 py-2 border-t flex justify-between items-center font-bold text-sm text-slate-900">
                  <span>Total Paid</span>
                  <span className="text-[#15803d]">
                    {formatCurrency(selectedPaymentForReceipt.amount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Official Computer-Generated Receipt
                </span>
                <StatusBadge variant={selectedPaymentForReceipt.status}>
                  {selectedPaymentForReceipt.status}
                </StatusBadge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPaymentForReceipt(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={handlePrintReceipt}
                className="bg-[#15803d] hover:bg-[#166534] text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
