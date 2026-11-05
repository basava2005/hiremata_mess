import React, { useState, useEffect } from 'react'
import {
  User,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Shield,
  KeyRound,
  Send,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { otpService } from '../../lib/otp'

export const StudentProfilePage: React.FC = () => {
  const { user, student } = useAuth()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // OTP Verification States
  const [step, setStep] = useState<'IDLE' | 'OTP_SENT' | 'SUCCESS'>('IDLE')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [demoOtp, setDemoOtp] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(0)

  // Form fields
  const [enteredOtp, setEnteredOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  const mobileNumber = user?.mobile || '9876543201'
  const maskedMobile = `+91 ******${mobileNumber.slice(-4)}`

  // Send OTP
  const handleSendOtp = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSendingOtp(true)
    try {
      const res = await otpService.sendOtp(mobileNumber, 'PASSWORD_CHANGE')
      setDemoOtp(res.demoOtp)
      setStep('OTP_SENT')
      setResendCountdown(45)
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch OTP. Please try again.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Submit Password Change
  const handleVerifyAndUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit verification OTP.')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.')
      return
    }

    setIsVerifying(true)
    try {
      const result = await otpService.updatePasswordWithOtp(
        mobileNumber,
        enteredOtp.trim(),
        newPassword
      )
      setSuccessMessage(result.message)
      setStep('SUCCESS')
      setEnteredOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setDemoOtp(null)
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Account Profile & Security
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal details and OTP-verified login credentials
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center font-extrabold text-lg shadow-inner">
              {(student?.name || user?.name || 'S').charAt(0)}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                {student?.name || user?.name}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Student Member • Username: {user?.mobile}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4 sm:p-5 text-xs">
          <div className="grid grid-cols-1 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#15803d] flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  Mobile Number (Login ID)
                </span>
                <span className="font-semibold text-slate-800 text-sm">{user?.mobile}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  Hostel / Room Address
                </span>
                <span className="font-medium text-slate-800">
                  {student?.address || 'Room 204, Bapu Hostel, BIET Road, Davangere'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
              <Building2 className="w-4 h-4 text-[#15803d] flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  Registered Mess Branch
                </span>
                <span className="font-medium text-slate-800">
                  Hiremat Mess (Anjaneya Layout, BIET Rd, Davangere)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OTP Verified Password Change Card */}
      <Card className="border-emerald-200/60 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#15803d] text-white rounded-lg">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Password Management
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Requires 2-Factor OTP verification on registered mobile
                </CardDescription>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#15803d] bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Security First
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Password Updated Successfully!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Verification Error</p>
                <p className="text-[11px] text-rose-600 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {step === 'IDLE' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Phone className="w-4 h-4 text-[#15803d]" />
                  <span>Verification via Registered Mobile:</span>
                  <span className="font-mono text-slate-900">{maskedMobile}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your account password is provided by the Mess Administrator. To modify your password, a one-time 6-digit OTP will be dispatched to your phone for verification.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleSendOtp}
                isLoading={isSendingOtp}
                className="w-full bg-[#15803d] hover:bg-[#166534] text-xs h-10 font-bold flex items-center justify-center gap-2 rounded-xl"
              >
                <Send className="w-4 h-4" />
                <span>Send 6-Digit OTP to {maskedMobile}</span>
              </Button>
            </div>
          )}

          {step === 'OTP_SENT' && (
            <form onSubmit={handleVerifyAndUpdatePassword} className="space-y-4">
              {/* Demo Helper Banner */}
              {demoOtp && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Firebase Simulated OTP:</span>{' '}
                      <span className="font-mono font-bold text-amber-800">{demoOtp}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnteredOtp(demoOtp)}
                    className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-1 rounded-md transition-colors"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Enter 6-Digit OTP Code
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Sent to {maskedMobile}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 543210"
                  className="w-full text-center font-mono tracking-widest text-lg font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all"
                  autoFocus
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full text-xs p-2.5 pr-10 rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Button
                  type="submit"
                  isLoading={isVerifying}
                  className="w-full bg-[#15803d] hover:bg-[#166534] text-xs h-10 font-bold rounded-xl"
                >
                  Verify OTP & Update Password
                </Button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('IDLE')}
                    className="text-slate-500 hover:text-slate-700 underline text-[11px]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={resendCountdown > 0 || isSendingOtp}
                    onClick={handleSendOtp}
                    className="text-[#15803d] hover:text-[#166534] font-semibold flex items-center gap-1 disabled:opacity-50 text-[11px]"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCountdown > 0
                        ? `Resend OTP in ${resendCountdown}s`
                        : 'Resend OTP'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-2 space-y-3">
              <Button
                type="button"
                onClick={() => setStep('IDLE')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs h-9 font-semibold rounded-xl"
              >
                Done
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
