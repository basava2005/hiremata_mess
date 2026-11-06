import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Utensils,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  X,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  MapPin,
  Building2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { otpService } from '../../lib/otp'

const loginSchema = z.object({
  mobile: z
    .string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits')
    .regex(/^[0-9]+$/, 'Mobile number must contain digits only'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Forgot password OTP modal states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [resetMobile, setResetMobile] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [resetShowPassword, setResetShowPassword] = useState(false)
  const [resetStep, setResetStep] = useState<'ENTER_MOBILE' | 'ENTER_OTP' | 'SUCCESS'>('ENTER_MOBILE')
  const [resetWhatsappUrl, setResetWhatsappUrl] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobile: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      const response = await login(values)
      const userRole = response.user.role

      // Check if there was a redirected route
      const from = (location.state as any)?.from?.pathname

      if (from && from !== '/login') {
        navigate(from, { replace: true })
      } else {
        if (userRole === 'BRANCH_ADMIN') {
          navigate('/admin', { replace: true })
        } else if (userRole === 'MESS_STAFF') {
          navigate('/staff', { replace: true })
        } else {
          navigate('/student', { replace: true })
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || err.message || 'Login failed. Please check your mobile number and password.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Send Reset OTP
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)

    if (!resetMobile || resetMobile.length !== 10 || !/^\d{10}$/.test(resetMobile)) {
      setResetError('Please enter a valid 10-digit registered mobile number.')
      return
    }

    setResetLoading(true)
    try {
      const res = await otpService.sendOtp(resetMobile, 'PASSWORD_RESET')
      setResetWhatsappUrl(res.whatsappUrl || null)
      setResetStep('ENTER_OTP')
      setCountdown(45)
    } catch (err: any) {
      setResetError(err.message || 'Failed to send verification OTP.')
    } finally {
      setResetLoading(false)
    }
  }

  // Handle Verify & Reset Password
  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)

    if (!resetOtp || resetOtp.length !== 6) {
      setResetError('Please enter the 6-digit OTP received on your mobile.')
      return
    }

    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters.')
      return
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.')
      return
    }

    setResetLoading(true)
    try {
      await otpService.updatePasswordWithOtp(resetMobile, resetOtp, resetNewPassword)
      setResetStep('SUCCESS')
      setValue('mobile', resetMobile)
      setValue('password', resetNewPassword)
    } catch (err: any) {
      setResetError(err.message || 'OTP verification or password reset failed.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-slate-50 to-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Top back navigation */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#15803d] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hiremat Mess Landing Page</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#15803d] to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-900/20 ring-4 ring-emerald-50">
            <Utensils className="w-8 h-8" />
          </div>

          <div className="mt-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[#15803d] text-[11px] font-bold uppercase tracking-wider mb-1">
              <span>100% Pure Veg</span>
              <span>•</span>
              <span>Davangere, Karnataka</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Hiremat Mess (ಹಿರೇಮಠ್ ಮೆಸ್)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Member Sign In • Student & Staff Portal
            </p>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-2xl shadow-slate-200/60 border-slate-200/80 rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Mobile Number Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  10-Digit Mobile Number (Login ID)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="text-xs font-bold text-slate-500 mr-1">+91</span>
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    {...register('mobile')}
                    className="block w-full pl-16 pr-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all placeholder:font-normal placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
                {errors.mobile && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.mobile.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetMobile('')
                      setResetOtp('')
                      setResetNewPassword('')
                      setResetConfirmPassword('')
                      setResetError(null)
                      setResetStep('ENTER_MOBILE')
                      setIsForgotModalOpen(true)
                    }}
                    className="text-xs font-bold text-[#15803d] hover:text-[#166534] hover:underline transition-colors"
                  >
                    Forgot Password? (Reset via OTP)
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className="block w-full pl-11 pr-10 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all placeholder:font-normal placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full mt-2 h-11 text-sm font-bold rounded-xl bg-[#15803d] hover:bg-[#166534] text-white shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2"
              >
                <span>Sign In to Member Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Assistance Info */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                New student admission or mess staff login?
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Accounts are provisioned by the Mess Administrator. Please contact the office counter at BIET Road.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer address info */}
        <div className="mt-5 text-center space-y-1">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#15803d]" />
            <span>Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Hiremat Mess System • Powered by Direct UPI & Cloud Engine
          </p>
        </div>
      </div>

      {/* Forgot Password OTP Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#15803d] rounded-lg">
                  <KeyRound className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Reset Password via OTP</h3>
                  <p className="text-[11px] text-emerald-300">Hiremat Mess Student Account Verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {resetError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {/* Step 1: Enter Mobile */}
              {resetStep === 'ENTER_MOBILE' && (
                <form onSubmit={handleSendResetOtp} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter the 10-digit mobile number registered by your Mess Administrator. We'll send a 6-digit OTP code to verify your identity.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <span className="text-xs font-medium text-slate-400 mr-1">+91</span>
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={resetMobile}
                        onChange={(e) => setResetMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="block w-full pl-14 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="w-1/3 text-xs h-10 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={resetLoading}
                      className="w-2/3 text-xs h-10 font-bold bg-[#15803d] hover:bg-[#166534] rounded-xl"
                    >
                      Send Verification OTP
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 2: Enter OTP & New Password */}
              {resetStep === 'ENTER_OTP' && (
                <form onSubmit={handleVerifyAndResetPassword} className="space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-emerald-950">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Verification Code Sent to Mobile!</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      We sent a 6-digit verification OTP to <strong>+91 ******{resetMobile.slice(-4)}</strong> via Firebase SMS.
                    </p>
                    {resetWhatsappUrl && (
                      <div className="pt-1 border-t border-emerald-200/60">
                        <a
                          href={resetWhatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white/80 border border-emerald-300 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <span>Receive OTP on WhatsApp 📲</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
                  <div id="recaptcha-container" />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full text-center font-mono tracking-widest text-lg font-bold p-2 rounded-xl border border-slate-300 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-colors"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={resetShowPassword ? 'text' : 'password'}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full text-xs p-2.5 pr-10 rounded-xl border border-slate-300 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setResetShowPassword(!resetShowPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {resetShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={resetShowPassword ? 'text' : 'password'}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <Button
                      type="submit"
                      isLoading={resetLoading}
                      className="w-full text-xs h-10 font-bold bg-[#15803d] hover:bg-[#166534] rounded-xl"
                    >
                      Verify OTP & Reset Password
                    </Button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => setResetStep('ENTER_MOBILE')}
                        className="text-slate-500 hover:text-slate-700 underline text-[11px]"
                      >
                        Change Mobile
                      </button>

                      <button
                        type="button"
                        disabled={countdown > 0 || resetLoading}
                        onClick={handleSendResetOtp}
                        className="text-[#15803d] hover:text-[#166534] font-semibold flex items-center gap-1 disabled:opacity-50 text-[11px]"
                      >
                        <RefreshCw className={`w-3 h-3 ${resetLoading ? 'animate-spin' : ''}`} />
                        <span>{countdown > 0 ? `Resend OTP (${countdown}s)` : 'Resend OTP'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Step 3: Success */}
              {resetStep === 'SUCCESS' && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Password Reset Successfully!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Your new password is now active. You can sign in to your student dashboard.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(false)
                      onSubmit({ mobile: resetMobile, password: resetNewPassword })
                    }}
                    className="w-full text-xs h-10 font-bold bg-[#15803d] hover:bg-[#166534] rounded-xl mt-2"
                  >
                    <span>Sign In Now</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
