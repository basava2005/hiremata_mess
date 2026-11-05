// Razorpay Checkout Integration for Hiremat Mess (MessPro)
export interface RazorpayPaymentOptions {
  amount: number // in INR (e.g. 3500)
  studentId: string
  studentName: string
  studentMobile: string
  onSuccess: (response: {
    razorpay_payment_id: string
    razorpay_order_id?: string
    razorpay_signature?: string
    method: string
  }) => void
  onDismiss?: () => void
  onFailure?: (error: any) => void
}

declare global {
  interface Window {
    Razorpay?: any
  }
}

/**
 * Dynamically loads the Razorpay checkout script from CDN
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      console.warn('Razorpay SDK failed to load from CDN. Using interactive fallback.')
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

/**
 * Initiates Razorpay checkout flow
 */
export async function initiateRazorpayPayment(options: RazorpayPaymentOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript()
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_HirematMess2026'

  if (isLoaded && window.Razorpay) {
    const rzpOptions = {
      key: keyId,
      amount: options.amount * 100, // paise (3500 * 100 = 350000)
      currency: 'INR',
      name: 'Hiremat Mess Davangere',
      description: 'Monthly Pure Veg Mess Plan (₹3,500 / 30 Days)',
      image: '/favicon.ico',
      prefill: {
        name: options.studentName,
        contact: options.studentMobile,
        email: `${options.studentMobile}@student.messpro.in`,
      },
      notes: {
        mess_name: 'Hiremat Mess Davangere',
        branch_location: 'Anjaneya Layout 5th Cross, BIET Rd, Davangere',
        student_id: options.studentId,
        plan_id: 'plan-standard-30',
      },
      theme: {
        color: '#15803d', // Hiremat Mess Emerald Green
        backdrop_color: 'rgba(5, 46, 22, 0.7)',
      },
      modal: {
        ondismiss: () => {
          if (options.onDismiss) options.onDismiss()
        },
      },
      handler: function (response: any) {
        options.onSuccess({
          razorpay_payment_id: response.razorpay_payment_id || `pay_rzp_${Date.now()}`,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          method: 'Razorpay UPI / Cards',
        })
      },
    }

    try {
      const rzpInstance = new window.Razorpay(rzpOptions)
      rzpInstance.open()
      return
    } catch (e) {
      console.error('Razorpay invocation error:', e)
      if (options.onFailure) options.onFailure(e)
    }
  }

  // If Razorpay SDK couldn't open (e.g. offline sandbox or adblocker), caller can use RazorpayGatewayModal
  if (options.onFailure) {
    options.onFailure(new Error('Razorpay script unavailable'))
  }
}

