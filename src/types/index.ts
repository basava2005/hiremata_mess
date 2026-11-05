export type UserRole = 'BRANCH_ADMIN' | 'MESS_STAFF' | 'STUDENT'

export interface User {
  id: string
  branch_id: string
  mobile: string
  name: string
  role: UserRole
  studentId?: string
  avatarUrl?: string
  created_at: string
}

export interface Student {
  id: string
  branch_id: string
  userId: string
  name: string
  mobile: string
  address: string
  isActive: boolean
  currentSubscriptionId?: string | null
  created_at: string
}

export interface Plan {
  id: string
  branch_id: string
  name: string
  price: number
  durationDays: number
  mealsLabel: string // e.g. "Lunch + Dinner"
  description?: string
  isActive: boolean
}

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'UPCOMING'

export interface Subscription {
  id: string
  branch_id: string
  studentId: string
  planId: string
  startDate: string // YYYY-MM-DD
  lastDate: string // YYYY-MM-DD
  status: SubscriptionStatus
  plan?: Plan
  created_at: string
}

export type PaymentMethod = 'CASH' | 'UPI' | 'ONLINE' | 'OTHER'
export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED'

export interface Payment {
  id: string
  branch_id: string
  studentId: string
  subscriptionId?: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string
  status: PaymentStatus
  date: string // YYYY-MM-DD
  receiptNumber: string
  notes?: string
  studentName?: string
  created_at: string
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface LeaveRequest {
  id: string
  branch_id: string
  studentId: string
  studentName?: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  daysCount: number
  reason: string
  status: LeaveStatus
  adminNote?: string
  created_at: string
}

export interface LeaveExtension {
  id: string
  branch_id: string
  studentId: string
  studentName?: string
  subscriptionId: string
  oldLastDate: string
  newLastDate: string
  daysAdded: number
  approvedByUserId?: string
  status: 'APPROVED' | 'REJECTED'
  note?: string
  created_at: string
}

export interface Notification {
  id: string
  branch_id: string
  userId: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT'
  isRead: boolean
  link?: string
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
  student?: Student
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

