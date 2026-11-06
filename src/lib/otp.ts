// OTP Verification & Password Management Service
// Uses Google Firebase Phone Auth (Free 10,000 SMS/mo) with backend verification & WhatsApp fallback
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp, sendFirebaseNotification } from './firebase'
import { apiClient } from '../api/client'

export interface SendOtpResult {
  success: boolean
  message: string
  gateway: 'FIREBASE_SMS' | 'BACKEND_SMS'
  whatsappUrl?: string
}

export const otpService = {
  /**
   * Generates and dispatches a 6-digit OTP directly to the student's mobile number via Firebase SMS
   */
  sendOtp: async (
    mobile: string,
    purpose: 'PASSWORD_CHANGE' | 'PASSWORD_RESET' = 'PASSWORD_RESET'
  ): Promise<SendOtpResult> => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10)
    if (cleanMobile.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number.')
    }

    const maskedMobile = `+91 ******${cleanMobile.slice(-4)}`

    // 1. Attempt to send via Google Firebase Phone Auth (Free SMS)
    try {
      await sendFirebasePhoneOtp(cleanMobile, 'recaptcha-container')

      // Also notify backend so it registers an active reset intent
      let whatsappUrl: string | undefined
      try {
        const backendRes = await apiClient.post('/auth/otp/send', {
          mobile: cleanMobile,
          purpose,
        })
        whatsappUrl = backendRes.data?.whatsappUrl
      } catch {}

      return {
        success: true,
        message: `OTP sent via Firebase SMS to ${maskedMobile}.`,
        gateway: 'FIREBASE_SMS',
        whatsappUrl,
      }
    } catch (fbError: any) {
      console.warn('Firebase Phone Auth attempt:', fbError.message)

      // 2. If Firebase Phone Auth provider is not enabled in Firebase Console, fallback to backend OTP
      try {
        const backendRes = await apiClient.post('/auth/otp/send', {
          mobile: cleanMobile,
          purpose,
        })

        const whatsappUrl = backendRes.data?.whatsappUrl

        return {
          success: true,
          message: `OTP dispatched to ${maskedMobile}.`,
          gateway: 'BACKEND_SMS',
          whatsappUrl,
        }
      } catch (backendError: any) {
        throw new Error(
          backendError.response?.data?.detail || fbError.message || 'Failed to dispatch verification OTP.'
        )
      }
    }
  },

  /**
   * Verifies the OTP and updates the password in PostgreSQL
   */
  updatePasswordWithOtp: async (
    mobile: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10)

    if (!cleanMobile || cleanMobile.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number.')
    }

    if (!otp || otp.trim().length !== 6) {
      throw new Error('Please enter the 6-digit verification code sent to your mobile.')
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.')
    }

    let verifiedByFirebase = false

    // 1. Attempt Firebase Phone Auth confirmation
    try {
      verifiedByFirebase = await verifyFirebasePhoneOtp(otp.trim())
    } catch (fbError: any) {
      console.info('Firebase verification check passed to backend:', fbError.message)
    }

    // 2. Complete password update in Django PostgreSQL backend
    try {
      if (verifiedByFirebase) {
        // Firebase already verified phone ownership! Update password directly
        await apiClient.post('/auth/password/change', {
          mobile: cleanMobile,
          newPassword,
        })
      } else {
        // Verify via backend OTP record in PostgreSQL
        await apiClient.post('/auth/otp/verify-reset', {
          mobile: cleanMobile,
          otp: otp.trim(),
          newPassword,
        })
      }

      // 3. Trigger Firebase Push & In-app Notification
      sendFirebaseNotification(
        'Password Reset Successful • Hiremat Mess',
        'Your MessPro account password was successfully updated. You can now log in.'
      )

      return {
        success: true,
        message: 'Password successfully updated! You can now log in with your new password.',
      }
    } catch (apiError: any) {
      throw new Error(
        apiError.response?.data?.detail || apiError.message || 'Verification or password update failed.'
      )
    }
  },
}
