import React, { useState } from 'react'
import {
  QrCode,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Receipt,
  IndianRupee,
  Sparkles,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { paymentsApi } from '../../api/payments'
import { Payment } from '../../types'

interface DirectUpiPaymentModalProps {
  open: boolean
  onClose: () => void
  amount?: number
  studentName: string
  studentMobile: string
  studentId: string
  onPaymentSuccess: (payment: Payment) => void
}

export const DirectUpiPaymentModal: React.FC<DirectUpiPaymentModalProps> = ({
  open,
  onClose,
  amount = 3500,
  studentName,
  studentMobile,
  studentId,
  onPaymentSuccess,
}) => {
  const upiId = import.meta.env.VITE_UPI_ID || 'hirematmess@upi'
  const upiName = import.meta.env.VITE_UPI_NAME || 'Hiremat Mess Davangere'
  const note = `Mess Subscription - ${studentName}`

  const [copied, setCopied] = useState(false)
  const [utrNumber, setUtrNumber] = useState('')
  const [selectedApp, setSelectedApp] = useState<'Google Pay' | 'PhonePe' | 'Paytm' | 'BHIM' | 'Other'>('PhonePe')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successPayment, setSuccessPayment] = useState<Payment | null>(null)

  if (!open) return null

  // Standard UPI URI specification
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    upiName
  )}&am=${amount}.00&cu=INR&tn=${encodeURIComponent(note)}`

  // High-res dynamic QR code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUri)}`

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenUpiApp = () => {
    window.location.href = upiUri
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const cleanedUtr = utrNumber.trim()
    if (!cleanedUtr || cleanedUtr.length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI UTR / Transaction Reference number from your payment app.')
      return
    }

    setIsSubmitting(true)
    try {
      const payment = await paymentsApi.submitUpiPayment({
        studentId,
        amount,
        utrNumber: cleanedUtr,
        upiApp: selectedApp,
        notes: `Direct UPI transfer from ${studentName} (${studentMobile}) via ${selectedApp}`,
      })
      setSuccessPayment(payment)
      onPaymentSuccess(payment)
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.message || 'Payment submission failed. Please verify your UTR.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-[#15803d] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">Direct UPI Payment</h3>
              <p className="text-[11px] text-emerald-200">
                Hiremat Mess Davangere • Zero Gateway Fees & Zero GST
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {successPayment ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Payment Submitted Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Receipt <span className="font-mono font-bold text-slate-700">{successPayment.receiptNumber}</span> generated.
                </p>
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl inline-block text-left text-xs text-emerald-900">
                  <p>• <strong>Amount Paid:</strong> ₹{amount.toLocaleString('en-IN')}</p>
                  <p>• <strong>Method:</strong> Direct UPI ({selectedApp})</p>
                  <p>• <strong>UTR / Ref:</strong> {successPayment.referenceNumber}</p>
                  <p>• <strong>Validity:</strong> 30 Calendar Days Activated</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <Button
                  onClick={onClose}
                  className="bg-[#15803d] hover:bg-[#166534] text-white text-xs h-10 font-bold px-6 rounded-xl"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Payment & QR Flow */
            <>
              {/* Fee Saving Banner */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#15803d] flex-shrink-0" />
                <div className="text-[11px] text-emerald-900">
                  <span className="font-bold">100% Direct to Mess:</span> By paying directly via UPI, you save the 2% gateway commission + 18% GST fee (~₹82).
                </div>
              </div>

              {/* Amount & Plan Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Plan Selected
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    Pure Veg Standard Plan (30 Days)
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Unlimited Chapati Lunch + Dinner + Breakfast
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#15803d]">₹{amount.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">All inclusive</span>
                </div>
              </div>

              {/* QR Code and UPI ID */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50/70 border border-slate-200 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-700 mb-2.5">
                  Scan to Pay with Any UPI App
                </p>

                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
                  <img
                    src={qrCodeUrl}
                    alt="Hiremat Mess UPI QR Code"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                </div>

                {/* UPI ID Pill with Copy */}
                <div className="mt-3 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs">
                  <span className="text-slate-500 text-[11px]">UPI ID:</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{upiId}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="ml-1 p-1 text-[#15803d] hover:bg-emerald-50 rounded-md transition-colors"
                    title="Copy UPI ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {copied && <span className="text-[10px] text-emerald-600 font-semibold mt-1">UPI ID Copied!</span>}

                {/* 1-Tap Mobile Button */}
                <div className="mt-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleOpenUpiApp}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Open in GPay / PhonePe / Paytm</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Step 2: Enter 12-Digit UTR */}
              <form onSubmit={handleSubmitPayment} className="space-y-3 pt-1">
                <div className="border-t border-slate-200 pt-3">
                  <h4 className="font-bold text-slate-900 text-xs mb-1">
                    Step 2: Enter Payment Reference (UTR)
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    After completing the ₹3,500 transfer in your UPI app, copy the <strong>12-digit UTR / UPI Ref ID</strong> from the transaction screen and enter it below:
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* UPI App Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Which UPI App Did You Use?
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 text-[11px]">
                    {(['PhonePe', 'Google Pay', 'Paytm', 'BHIM', 'Other'] as const).map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className={`py-1.5 px-1 rounded-lg border font-semibold text-center transition-all truncate ${
                          selectedApp === app
                            ? 'bg-[#15803d] text-white border-[#15803d] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 12-Digit UTR Number Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    12-Digit UPI Reference / UTR Number
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                    placeholder="e.g. 431209876543"
                    className="w-full text-xs font-mono font-bold tracking-wider p-2.5 rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all uppercase"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Found under "UPI Transaction ID" or "UTR" in your GPay / PhonePe / Paytm receipt.
                  </span>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full bg-[#15803d] hover:bg-[#166534] text-white text-xs h-11 font-bold rounded-xl mt-2 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/10"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Payment & Activate 30-Day Subscription</span>
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

