import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Download,
  IndianRupee,
  Share2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { paymentsApi } from '../../api/payments'
import { Payment } from '../../types'
import { DirectUpiPaymentModal } from '../../components/payments/DirectUpiPaymentModal'
import { formatCurrency, formatDate } from '../../lib/dates'
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
  const [isCopied, setIsCopied] = useState(false)

  const monthlyFee = student?.monthlyFee || 3500
  const isPuc = student?.category === 'PUC'

  // Fetch payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['studentPayments', studentId],
    queryFn: () => paymentsApi.getPayments({ studentId }),
  })

  const handlePrintReceipt = () => {
    window.print()
  }

  const handleShareWhatsApp = (payment: Payment) => {
    const text = `*HIREMAT MESS DAVANGERE - PAYMENT RECEIPT*\n` +
      `Receipt No: ${payment.receiptNumber}\n` +
      `Student: ${student?.name || user?.name}\n` +
      `Mobile: ${student?.mobile || user?.mobile}\n` +
      `Amount Paid: ₹${payment.amount.toLocaleString('en-IN')}\n` +
      `Method: ${payment.paymentMethod} (UTR/Ref: ${payment.referenceNumber || 'N/A'})\n` +
      `Date: ${formatDate(payment.date)}\n` +
      `Status: VERIFIED & ACTIVE ✓\n\n` +
      `Hiremat Mess Davangere • BIET Road, Davangere\n` +
      `Contact Admin: 9353198281`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Title & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Payment Receipts
          </h2>
          <p className="text-xs text-slate-500">
            Official tax slips & verified monthly pass receipts
          </p>
        </div>
        <Button
          onClick={() => setIsGatewayOpen(true)}
          className="bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold h-9 px-4 rounded-xl shadow-sm shadow-emerald-900/10 flex items-center gap-1.5"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pay ₹{monthlyFee.toLocaleString('en-IN')}</span>
        </Button>
      </div>

      {/* Dynamic Membership Fee Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-[#064e3b] to-emerald-900 p-5 text-white shadow-lg border border-emerald-800/40">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {isPuc ? 'PUC Special Pass' : 'Pure Veg Monthly Pass'}
              </span>
              <span className="text-[10px] text-emerald-200">30 Calendar Days</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black tracking-tight text-white">
                ₹{monthlyFee.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-200/80">/ month</span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xs leading-relaxed">
              Unlimited homestyle lunch & dinner, soft chapatis, special palya, and Sunday Holige feast.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsGatewayOpen(true)}
            className="bg-white hover:bg-emerald-50 text-[#15803d] font-bold text-xs h-9 px-4 rounded-xl shadow-md"
          >
            Pay Direct UPI
          </Button>
        </div>
      </div>

      {/* Receipts History List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Issued Receipts ({payments.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Click "View Receipt" to print or download PDF slip
            </p>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Instant GST Exemption
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={3} />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Receipt className="w-8 h-8 text-slate-400" />}
                title="No receipts yet"
                description="Make your monthly subscription fee payment to generate your first verified receipt."
                actionLabel={`Pay ₹${monthlyFee.toLocaleString('en-IN')}`}
                onAction={() => setIsGatewayOpen(true)}
              />
            </div>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#15803d] border border-emerald-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      <StatusBadge variant={p.status}>{p.status}</StatusBadge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                      <span>{p.receiptNumber}</span>
                      <span>•</span>
                      <span>{formatDate(p.date)}</span>
                      <span>•</span>
                      <span className="font-sans font-semibold text-slate-700">{p.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPaymentForReceipt(p)}
                    className="h-8 px-3 text-xs font-semibold text-slate-700 hover:text-[#15803d] hover:border-[#15803d] rounded-xl"
                  >
                    View Receipt
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Direct UPI Payment Modal */}
      <DirectUpiPaymentModal
        open={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        amount={monthlyFee}
        studentId={studentId}
        studentName={student?.name || user?.name || 'Student'}
        studentMobile={student?.mobile || user?.mobile || '9876543201'}
        onPaymentSuccess={(payment) => {
          queryClient.invalidateQueries({ queryKey: ['studentPayments', studentId] })
          queryClient.invalidateQueries({ queryKey: ['studentSubscription', studentId] })
          setIsGatewayOpen(false)
          setSelectedPaymentForReceipt(payment)
        }}
      />

      {/* Modern Printable / Digital Receipt Modal */}
      {selectedPaymentForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 my-auto text-slate-900 relative print:shadow-none print:border-0 print:m-0 print:p-0">
            {/* Top decorative edge */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <div className="w-10 h-10 rounded-2xl bg-[#15803d] text-white font-black flex items-center justify-center mx-auto text-base shadow-md">
                M
              </div>
              <h3 className="font-black text-lg text-slate-900 mt-2 tracking-tight">
                HIREMAT MESS (ಹಿರೇಮಠ್ ಮೆಸ್)
              </h3>
              <p className="text-[11px] font-semibold text-[#15803d]">
                100% Pure Veg Homestyle Kitchen
              </p>
              <p className="text-[10px] text-slate-500">
                Anjaneya Layout 5th Cross, BIET Rd, Davangere 577004
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Phone: +91 9353198281 • UPI: 9353198281@ybl
              </p>
            </div>

            {/* Receipt Sub-header */}
            <div className="py-3.5 border-b border-dashed border-slate-300 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Receipt Number
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {selectedPaymentForReceipt.receiptNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Payment Date
                </span>
                <span className="font-semibold text-slate-800 text-xs">
                  {formatDate(selectedPaymentForReceipt.date)}
                </span>
              </div>
            </div>

            {/* Student Details */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">
                  {student?.name || user?.name || selectedPaymentForReceipt.studentName || 'Student'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile Number:</span>
                <span className="font-mono text-slate-800">
                  {student?.mobile || user?.mobile}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-800">
                  {selectedPaymentForReceipt.paymentMethod}
                </span>
              </div>
              {selectedPaymentForReceipt.referenceNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">UTR / Ref No:</span>
                  <span className="font-mono font-bold text-slate-900 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                    {selectedPaymentForReceipt.referenceNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Description & Amount */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              <div className="flex justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">
                    30-Day Pure Veg Subscription
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Unlimited Lunch, Dinner & Special Palya
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-xs">
                  ₹{selectedPaymentForReceipt.amount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm font-black border-t border-slate-100">
                <span className="text-slate-900">Total Received</span>
                <span className="text-emerald-700 text-base">
                  ₹{selectedPaymentForReceipt.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Verified Stamp */}
            <div className="py-3 flex items-center justify-between text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>OFFICIALLY VERIFIED</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Authorized Signature ✓
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2 print:hidden">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handlePrintReceipt}
                  className="bg-slate-900 hover:bg-black text-white text-xs font-bold h-9 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </Button>
                <Button
                  onClick={() => handleShareWhatsApp(selectedPaymentForReceipt)}
                  className="bg-[#25D366] hover:bg-[#1ebe5b] text-white text-xs font-bold h-9 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setSelectedPaymentForReceipt(null)}
                className="w-full text-xs h-8 text-slate-600 rounded-xl"
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
