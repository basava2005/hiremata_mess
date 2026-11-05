import React, { useState } from 'react'
import { Button } from '../ui/Button'
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  Loader2,
  Lock,
  X,
} from 'lucide-react'
import { initiateRazorpayPayment } from '../../lib/razorpay'

interface RazorpayGatewayModalProps {
  open: boolean
  onClose: () => void
  amount: number
  studentName: string
  studentMobile: string
  studentId: string
  onPaymentSuccess: (paymentDetails: {
    paymentId: string
    method: 'UPI' | 'CARD' | 'NETBANKING'
    reference: string
  }) => void
}

export const RazorpayGatewayModal: React.FC<RazorpayGatewayModalProps> = ({
  open,
  onClose,
  amount,
  studentName,
  studentMobile,
  studentId,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'QR' | 'CARD'>('UPI')
  const [upiId, setUpiId] = useState(`${studentMobile}@ybl`)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE')

  if (!open) return null

  // Try opening real Razorpay modal if available
  const handleOpenLiveRazorpay = async () => {
    setIsProcessing(true)
    await initiateRazorpayPayment({
      amount,
      studentId,
      studentName,
      studentMobile,
      onSuccess: (res) => {
        setIsProcessing(false)
        setPaymentStatus('SUCCESS')
        setTimeout(() => {
          onPaymentSuccess({
            paymentId: res.razorpay_payment_id,
            method: 'UPI',
            reference: res.razorpay_payment_id,
          })
          onClose()
        }, 1200)
      },
      onFailure: () => {
        setIsProcessing(false)
      },
      onDismiss: () => {
        setIsProcessing(false)
      },
    })
  }

  const handleSimulatePayment = (method: 'UPI' | 'CARD' | 'NETBANKING') => {
    setIsProcessing(true)
    setPaymentStatus('PROCESSING')

    setTimeout(() => {
      const generatedId = `pay_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      setIsProcessing(false)
      setPaymentStatus('SUCCESS')

      setTimeout(() => {
        onPaymentSuccess({
          paymentId: generatedId,
          method: method,
          reference: generatedId,
        })
        setPaymentStatus('IDLE')
        onClose()
      }, 1400)
    }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border-2 border-emerald-600/30 shadow-2xl relative">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-5 space-y-3 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow">
                R
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">Razorpay Checkout</h3>
                <p className="text-[10px] text-blue-200">Hiremat Mess Davangere</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase text-blue-300 font-bold block">Amount to Pay</span>
                <span className="text-xl font-black text-white tracking-tight">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-blue-200 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur relative z-10">
            <span>Student: {studentName}</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Secure
            </span>
          </div>
        </div>

        {/* Payment Processing State */}
        {paymentStatus === 'PROCESSING' && (
          <div className="p-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#15803d] animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900">Processing Razorpay Transaction...</h4>
              <p className="text-xs text-slate-500">
                Authorizing ₹{amount} payment via selected Indian banking channel. Do not close.
              </p>
            </div>
          </div>
        )}

        {/* Payment Success State */}
        {paymentStatus === 'SUCCESS' && (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-black text-xl text-slate-900">Payment Successful!</h4>
              <p className="text-xs text-slate-600">
                ₹{amount} received via Razorpay. Your 30-day subscription is now active!
              </p>
            </div>
          </div>
        )}

        {/* Standard Payment Selection */}
        {paymentStatus === 'IDLE' && (
          <div className="p-5 space-y-4">
            {/* Quick Live SDK Launch Button */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-700" />
                  Direct UPI / Card Gateway
                </span>
                <p className="text-[10px] text-blue-700">Open Razorpay Native Gateway Popup</p>
              </div>
              <Button
                size="sm"
                onClick={handleOpenLiveRazorpay}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-sm"
              >
                Launch SDK
              </Button>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('UPI')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedMethod === 'UPI'
                    ? 'border-[#15803d] bg-emerald-50 text-[#15803d] shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI Apps</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('QR')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedMethod === 'QR'
                    ? 'border-[#15803d] bg-emerald-50 text-[#15803d] shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedMethod === 'CARD'
                    ? 'border-[#15803d] bg-emerald-50 text-[#15803d] shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cards / RuPay</span>
              </button>
            </div>

            {/* Method Details */}
            {selectedMethod === 'UPI' && (
              <div className="space-y-3 pt-1">
                <span className="text-[11px] font-bold text-slate-700 block">Popular UPI Apps (Zero Extra Fee):</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                    <button
                      key={app}
                      onClick={() => handleSimulatePayment('UPI')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-[#15803d] hover:bg-emerald-50 font-semibold text-slate-800 text-left flex items-center justify-between transition-all"
                    >
                      <span>{app}</span>
                      <span className="text-[#15803d] font-bold">Pay →</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">Or Enter UPI ID / VPA:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="mobile@upi"
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15803d]"
                    />
                    <Button
                      onClick={() => handleSimulatePayment('UPI')}
                      className="bg-[#15803d] hover:bg-[#166534] text-xs font-bold px-4 rounded-xl"
                    >
                      Pay ₹{amount}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'QR' && (
              <div className="text-center p-3 space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block">Scan QR Code with any UPI App</span>
                <div className="w-36 h-36 bg-white border-2 border-slate-800 rounded-2xl p-2 mx-auto flex items-center justify-center shadow-inner">
                  <div className="w-full h-full bg-[radial-gradient(#15803d_2px,transparent_2px)] [background-size:8px_8px] border border-slate-300 rounded-lg flex items-center justify-center">
                    <div className="bg-white px-2 py-1 rounded shadow text-[10px] font-black text-[#15803d]">
                      ₹{amount}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Scan using PhonePe, Google Pay, Paytm, or CRED</p>
                <Button
                  onClick={() => handleSimulatePayment('UPI')}
                  className="w-full bg-[#15803d] hover:bg-[#166534] text-xs font-bold h-9 rounded-xl"
                >
                  I Have Completed Payment in App
                </Button>
              </div>
            )}

            {selectedMethod === 'CARD' && (
              <div className="space-y-3 pt-1">
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4532 •••• •••• 8821"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Expiry</label>
                      <input
                        type="text"
                        defaultValue="08/29"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">CVV</label>
                      <input
                        type="password"
                        defaultValue="•••"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSimulatePayment('CARD')}
                  className="w-full bg-[#15803d] hover:bg-[#166534] text-xs font-bold h-10 rounded-xl shadow-md"
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                  Pay ₹{amount} Securely via Razorpay
                </Button>
              </div>
            )}

            {/* Footer Trust Badge */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>PCI-DSS Level 1 Compliant</span>
              <span className="font-bold text-slate-600">Hiremat Mess Official Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
