import React, { useState } from 'react'
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
  Eye,
  EyeOff,
  MapPin,
  MessageSquare,
  Clock,
  GraduationCap,
  Shield,
  Coffee,
  Heart,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { authApi } from '../../api/auth'
import { toast } from 'sonner'

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
  const [activePortalTab, setActivePortalTab] = useState<'STUDENT' | 'ADMIN'>('STUDENT')

  // Forgot password modal states (Admin verification flow)
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [resetMobile, setResetMobile] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [resetReason, setResetReason] = useState('')
  const [resetShowPassword, setResetShowPassword] = useState(false)
  const [resetIsSuccess, setResetIsSuccess] = useState(false)
  const [resetWhatsappUrl, setResetWhatsappUrl] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)

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


  // Handle Password Reset Request to Admin
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)

    if (!resetMobile || resetMobile.length !== 10 || !/^\d{10}$/.test(resetMobile)) {
      setResetError('Please enter a valid 10-digit registered mobile number.')
      return
    }

    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters.')
      return
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match. Please re-enter.')
      return
    }

    setResetLoading(true)
    try {
      const res = await authApi.submitPasswordResetRequest(resetMobile, resetNewPassword, resetReason)
      setResetIsSuccess(true)
      setResetWhatsappUrl(res.whatsappUrl || null)
      toast.success('Password reset request submitted to Mess Admin!')
    } catch (err: any) {
      setResetError(
        err.response?.data?.detail || err.message || 'Failed to submit reset request. Please check your registered mobile number.'
      )
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-slate-50 to-amber-50/50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-4 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-[#15803d] border border-slate-200/80 shadow-xs text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-extrabold border border-emerald-300/60 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          100% ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ (Pure Veg)
        </span>
      </div>

      {/* Center Login Container */}
      <div className="w-full max-w-md mx-auto my-auto z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#15803d] to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-900/20 mx-auto ring-4 ring-emerald-100">
            <Utensils className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-3">
            Hiremat Mess (ಹಿರೇಮಠ್ ಮೆಸ್)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Davangere Homestyle Kitchen • BIET Road
          </p>
        </div>

        {/* Main Floating Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-200/70 border border-slate-200 p-6 sm:p-8 space-y-5">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/70 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActivePortalTab('STUDENT')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activePortalTab === 'STUDENT'
                  ? 'bg-white text-[#15803d] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePortalTab('ADMIN')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activePortalTab === 'ADMIN'
                  ? 'bg-white text-[#15803d] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span className="font-semibold leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Mobile Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                10-Digit Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="text-xs font-extrabold text-slate-500 mr-1.5">+91</span>
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder={
                    activePortalTab === 'STUDENT'
                      ? 'e.g. 9353198281'
                      : 'e.g. 8431413551 / 8073113562 / 9353198281'
                  }
                  {...register('mobile')}
                  className="block w-full pl-16 pr-4 py-3 text-sm font-semibold rounded-2xl border-2 border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#15803d] focus:ring-4 focus:ring-[#15803d]/15 transition-all placeholder:font-normal placeholder:text-slate-400"
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
                <label className="block text-xs font-bold text-slate-800">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetMobile('')
                    setResetNewPassword('')
                    setResetConfirmPassword('')
                    setResetError(null)
                    setResetIsSuccess(false)
                    setIsForgotModalOpen(true)
                  }}
                  className="text-xs font-bold text-[#15803d] hover:text-[#166534] hover:underline transition-colors"
                >
                  Forgot Password? (ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರುವಿರಾ?)
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className="block w-full pl-11 pr-11 py-3 text-sm font-semibold rounded-2xl border-2 border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#15803d] focus:ring-4 focus:ring-[#15803d]/15 transition-all placeholder:font-normal placeholder:text-slate-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Sign In CTA Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full mt-2 h-12 text-sm font-black rounded-2xl bg-gradient-to-r from-emerald-600 via-[#15803d] to-emerald-700 hover:from-emerald-700 hover:to-[#166534] text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>Sign In to Member Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>


        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-4xl mx-auto text-center mt-6 z-10 space-y-1">
        <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5 flex-wrap">
          <MapPin className="w-3.5 h-3.5 text-[#15803d]" />
          <span>Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004</span>
          <span>•</span>
          <a href="tel:9353198281" className="text-emerald-700 font-bold hover:underline">
            📞 9353198281
          </a>
        </p>
        <p className="text-[11px] text-slate-400">
          Hiremat Mess System Davangere • Authentic Homestyle Pure Veg Food
        </p>
      </div>

      {/* Forgot Password OTP Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-950 to-[#15803d] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Request Password Reset</h3>
                  <p className="text-[11px] text-emerald-200">Admin Verification Required • Hiremat Mess</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false)
                  setResetIsSuccess(false)
                  setResetError(null)
                  setResetWhatsappUrl(null)
                }}
                className="text-emerald-200 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6">
              {resetError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {!resetIsSuccess ? (
                <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                    <p className="font-bold text-amber-900 flex items-center gap-1.5">
                      <span>Admin Verification & Approval Process</span>
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Enter your registered mobile and desired new password. Your request will be sent to Mess Admin Ramesh Sharma / Basavaraj. Once verified and accepted, your password will change automatically.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Registered 10-Digit Mobile Number
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
                        placeholder="e.g. 9353198281"
                        className="block w-full pl-14 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Desired New Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={resetShowPassword ? 'text' : 'password'}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full text-xs p-2.5 pr-10 rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all font-mono"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Confirm Desired Password
                    </label>
                    <input
                      type={resetShowPassword ? 'text' : 'password'}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Reason / Note for Admin (Optional)
                    </label>
                    <input
                      type="text"
                      value={resetReason}
                      onChange={(e) => setResetReason(e.target.value)}
                      placeholder="e.g. Forgot previous password"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20"
                    />
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
                      Submit Request to Admin
                    </Button>
                  </div>

                  {/* WhatsApp Admin Direct Link */}
                  <div className="pt-2 border-t border-slate-100 text-center">
                    <a
                      href="https://api.whatsapp.com/send?phone=919353198281&text=Hello%20Admin,%20I%20am%20a%20student%20at%20Hiremat%20Mess%20Davangere%20and%20need%20help%20with%20my%20password."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 text-[11px] text-[#25D366] hover:underline font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      <span>Chat with Admin on WhatsApp 📲</span>
                    </a>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3.5">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Reset Request Submitted to Admin!</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Your request for mobile <strong>+91 {resetMobile}</strong> is pending review by Mess Administrator.
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium mt-1">
                      Once verified and accepted, your new password will be activated automatically.
                    </p>
                  </div>

                  {resetWhatsappUrl && (
                    <div className="pt-1">
                      <a
                        href={resetWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba5a] py-2.5 px-3 rounded-xl shadow-xs transition-transform active:scale-98"
                      >
                        <MessageSquare className="w-4 h-4 fill-white" />
                        <span>Notify Admin on WhatsApp 📲</span>
                      </a>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsForgotModalOpen(false)
                      setResetIsSuccess(false)
                      setResetMobile('')
                      setResetNewPassword('')
                      setResetConfirmPassword('')
                      setResetReason('')
                    }}
                    className="w-full text-xs h-10 font-bold rounded-xl mt-1"
                  >
                    <span>Done</span>
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
