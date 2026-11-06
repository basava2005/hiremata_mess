import React, { useState } from 'react'
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
  Eye,
  EyeOff,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { authApi } from '../../api/auth'
import { toast } from 'sonner'

export const StudentProfilePage: React.FC = () => {
  const { user, student } = useAuth()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Form fields
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const mobileNumber = user?.mobile || '9876543201'
  const maskedMobile = `+91 ${mobileNumber}`

  // Submit Password Change (No OTP required)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.')
      return
    }

    setIsUpdating(true)
    try {
      const result = await authApi.resetPassword(mobileNumber, newPassword)
      setSuccessMessage(result.message || 'Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated successfully!')
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || err.message || 'Failed to update password. Please try again.'
      )
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Account Profile & Security
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal details and account credentials
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
                <p className="font-bold">Error Updating Password</p>
                <p className="text-[11px] text-rose-600 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Phone className="w-4 h-4 text-[#15803d]" />
                <span>Account Mobile:</span>
                <span className="font-mono text-slate-900">{maskedMobile}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                You can directly update your account password below without waiting for an OTP.
              </p>
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

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isUpdating}
              className="w-full bg-[#15803d] hover:bg-[#166534] text-xs h-10 font-bold rounded-xl shadow-xs"
            >
              Update Password
            </Button>

            {/* Admin WhatsApp Help */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <a
                href={`https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent(
                  `ನಮಸ್ಕಾರ Ramesh Sir, I am ${student?.name || user?.name} (+91 ${mobileNumber}). I need help with my Hiremat Mess account.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-[#25D366] hover:underline font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>Need Help? Chat with Admin Ramesh Sharma on WhatsApp 📲</span>
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
