import { apiClient, mockDelay, USE_MOCKS } from './client'
import { Payment, PaymentMethod, PaymentStatus } from '../types'
import { mockDB } from '../mocks/db'

export interface CreatePaymentPayload {
  studentId: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string
  status?: PaymentStatus
  date: string
  notes?: string
}

export const paymentsApi = {
  getPayments: async (params?: { studentId?: string; status?: PaymentStatus }): Promise<Payment[]> => {
    if (USE_MOCKS) {
      let list = mockDB.getPayments()
      if (params?.studentId) {
        list = list.filter((p) => p.studentId === params.studentId)
      }
      if (params?.status) {
        list = list.filter((p) => p.status === params.status)
      }
      return mockDelay([...list])
    }

    const res = await apiClient.get<Payment[]>('/payments', { params })
    return res.data
  },

  getPaymentById: async (id: string): Promise<Payment | null> => {
    if (USE_MOCKS) {
      const p = mockDB.getPayments().find((item) => item.id === id)
      return mockDelay(p || null)
    }

    const res = await apiClient.get<Payment>(`/payments/${id}`)
    return res.data
  },

  recordManualPayment: async (payload: CreatePaymentPayload): Promise<Payment> => {
    if (USE_MOCKS) {
      const payment = mockDB.createPayment({
        studentId: payload.studentId,
        amount: payload.amount,
        paymentMethod: payload.paymentMethod,
        referenceNumber: payload.referenceNumber,
        status: payload.status || 'SUCCESS',
        date: payload.date,
        notes: payload.notes,
      })
      return mockDelay(payment)
    }

    const res = await apiClient.post<Payment>('/payments', payload)
    return res.data
  },

  // Student direct UPI payment (Zero 2% Gateway Fee & Zero GST)
  submitUpiPayment: async (payload: {
    studentId: string
    amount: number
    utrNumber: string
    upiApp?: string
    notes?: string
  }): Promise<Payment> => {
    if (USE_MOCKS) {
      const today = new Date().toISOString().split('T')[0]
      const payment = mockDB.createPayment({
        studentId: payload.studentId,
        amount: payload.amount,
        paymentMethod: 'UPI',
        referenceNumber: payload.utrNumber,
        status: 'SUCCESS',
        date: today,
        notes: `Direct UPI (${payload.upiApp || 'UPI'}) • UTR: ${payload.utrNumber}`,
      })
      return mockDelay(payment, 400)
    }

    const res = await apiClient.post<Payment>('/payments/upi/submit', payload)
    return res.data
  },

  // Student mock online gateway payment
  initiateOnlinePayment: async (studentId: string, amount: number, outcome: PaymentStatus = 'SUCCESS'): Promise<Payment> => {
    if (USE_MOCKS) {
      const today = new Date().toISOString().split('T')[0]
      const payment = mockDB.createPayment({
        studentId,
        amount,
        paymentMethod: 'ONLINE',
        referenceNumber: `PG-${Date.now()}`,
        status: outcome,
        date: today,
        notes: `Online gateway transaction (${outcome})`,
      })
      return mockDelay(payment, 400)
    }

    const res = await apiClient.post<Payment>('/payments/gateway', { studentId, amount, outcome })
    return res.data
  },
}
