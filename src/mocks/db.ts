import {
  Student,
  Subscription,
  Payment,
  LeaveRequest,
  LeaveExtension,
  Notification,
  User,
  Plan,
} from '../types'
import {
  BRANCH_ID,
  mockPlan,
  mockUsers,
  mockStudents,
  mockSubscriptions,
  mockPayments,
  mockLeaves,
  mockExtensions,
  mockNotifications,
} from './mockData'
import { inclusiveDays, getSubscriptionStatus, addDaysToDate } from '../lib/dates'

const STORAGE_KEY = 'messpro_mock_db_v3_hiremat_admins'

interface MockDBState {
  users: User[]
  students: Student[]
  subscriptions: Subscription[]
  payments: Payment[]
  leaves: LeaveRequest[]
  extensions: LeaveExtension[]
  notifications: Notification[]
  plan: Plan
}

class MockDatabase {
  private state: MockDBState

  constructor() {
    this.state = this.loadState()
  }

  private loadState(): MockDBState {
    // Purge any legacy demo mock data from browser storage
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('messpro_mock_db_v2_pune')
      localStorage.removeItem('messpro_mock_db')
    } catch {}

    const initialState: MockDBState = {
      users: [...mockUsers],
      students: [],
      subscriptions: [],
      payments: [],
      leaves: [],
      extensions: [],
      notifications: [],
      plan: mockPlan,
    }

    return initialState
  }

  private saveState(state: MockDBState = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage may fail in some environments
    }
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY)
    this.state = this.loadState()
  }

  // --- Auth / Users ---
  public getUsers() {
    return this.state.users
  }

  public getUserByMobile(mobile: string) {
    return this.state.users.find((u) => u.mobile === mobile)
  }

  public getUserByUsernameOrMobile(identifier: string) {
    const q = identifier.trim().toLowerCase()
    return this.state.users.find(
      (u) => u.mobile === q || u.name.toLowerCase().replace(/\s+/g, '') === q
    )
  }

  public getUserById(id: string) {
    return this.state.users.find((u) => u.id === id)
  }

  public updateUserPassword(mobile: string, newPass: string) {
    const user = this.getUserByMobile(mobile)
    if (user) {
      // Store in password registry
      const rawPasswords = sessionStorage.getItem('messpro_passwords') || '{}'
      const registry = JSON.parse(rawPasswords)
      registry[user.mobile] = newPass
      sessionStorage.setItem('messpro_passwords', JSON.stringify(registry))
    }
  }

  // --- Students ---
  public getStudents() {
    return this.state.students
  }

  public getStudentById(id: string) {
    return this.state.students.find((s) => s.id === id)
  }

  public getStudentByUserId(userId: string) {
    return this.state.students.find((s) => s.userId === userId)
  }

  public addStudent(
    studentData: Omit<Student, 'id' | 'branch_id' | 'userId' | 'created_at'>,
    initialPassword?: string,
    username?: string
  ) {
    const id = `stud-${Date.now()}`
    const userId = `user-${id}`
    const newStudent: Student = {
      id,
      branch_id: BRANCH_ID,
      userId,
      ...studentData,
      isActive: true,
      created_at: new Date().toISOString().split('T')[0],
    }

    // Also create corresponding user for student login
    const newUser: User = {
      id: userId,
      branch_id: BRANCH_ID,
      mobile: studentData.mobile,
      name: studentData.name,
      role: 'STUDENT',
      studentId: id,
      created_at: newStudent.created_at,
    }

    // Store custom initial password if provided
    if (initialPassword) {
      this.updateUserPassword(studentData.mobile, initialPassword)
    }

    this.state.users.push(newUser)
    this.state.students.unshift(newStudent)
    this.saveState()
    return newStudent
  }

  public updateStudent(id: string, updates: Partial<Student>) {
    const idx = this.state.students.findIndex((s) => s.id === id)
    if (idx !== -1) {
      this.state.students[idx] = { ...this.state.students[idx], ...updates }
      // If mobile or name changed, update linked user
      const userIdx = this.state.users.findIndex((u) => u.studentId === id)
      if (userIdx !== -1) {
        if (updates.name) this.state.users[userIdx].name = updates.name
        if (updates.mobile) this.state.users[userIdx].mobile = updates.mobile
      }
      this.saveState()
      return this.state.students[idx]
    }
    return null
  }

  // --- Plan ---
  public getPlan() {
    return this.state.plan
  }

  // --- Subscriptions ---
  public getSubscriptions() {
    // Re-evaluate statuses dynamically based on current date
    return this.state.subscriptions.map((sub) => {
      const status = getSubscriptionStatus(sub.startDate, sub.lastDate)
      return { ...sub, status, plan: this.state.plan }
    })
  }

  public getSubscriptionById(id: string) {
    const sub = this.state.subscriptions.find((s) => s.id === id)
    if (!sub) return null
    return {
      ...sub,
      status: getSubscriptionStatus(sub.startDate, sub.lastDate),
      plan: this.state.plan,
    }
  }

  public getSubscriptionByStudentId(studentId: string) {
    const subs = this.state.subscriptions
      .filter((s) => s.studentId === studentId)
      .sort((a, b) => b.lastDate.localeCompare(a.lastDate))
    const sub = subs[0]
    if (!sub) return null
    return {
      ...sub,
      status: getSubscriptionStatus(sub.startDate, sub.lastDate),
      plan: this.state.plan,
    }
  }

  public createSubscription(studentId: string, startDate: string, durationDays: number = 30) {
    const lastDate = addDaysToDate(startDate, durationDays - 1)
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      branch_id: BRANCH_ID,
      studentId,
      planId: this.state.plan.id,
      startDate,
      lastDate,
      status: getSubscriptionStatus(startDate, lastDate),
      plan: this.state.plan,
      created_at: new Date().toISOString().split('T')[0],
    }

    this.state.subscriptions.push(newSub)
    this.updateStudent(studentId, { currentSubscriptionId: newSub.id })
    this.saveState()
    return newSub
  }

  public extendSubscription(subscriptionId: string, daysAdded: number) {
    const subIdx = this.state.subscriptions.findIndex((s) => s.id === subscriptionId)
    if (subIdx === -1) return null
    const sub = this.state.subscriptions[subIdx]
    const oldLastDate = sub.lastDate
    const newLastDate = addDaysToDate(oldLastDate, daysAdded)

    this.state.subscriptions[subIdx] = {
      ...sub,
      lastDate: newLastDate,
      status: getSubscriptionStatus(sub.startDate, newLastDate),
    }

    this.saveState()
    return {
      subscription: this.state.subscriptions[subIdx],
      oldLastDate,
      newLastDate,
    }
  }

  // --- Payments ---
  public getPayments() {
    return this.state.payments
  }

  public getPaymentsByStudentId(studentId: string) {
    return this.state.payments.filter((p) => p.studentId === studentId)
  }

  public createPayment(paymentData: Omit<Payment, 'id' | 'branch_id' | 'receiptNumber' | 'created_at'>) {
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const student = this.getStudentById(paymentData.studentId)
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      branch_id: BRANCH_ID,
      receiptNumber,
      studentName: student?.name || 'Student',
      ...paymentData,
      created_at: new Date().toISOString().split('T')[0],
    }

    this.state.payments.unshift(newPayment)

    // If payment is SUCCESS, activate or renew subscription
    if (newPayment.status === 'SUCCESS') {
      const currentSub = this.getSubscriptionByStudentId(paymentData.studentId)
      const today = new Date().toISOString().split('T')[0]
      let newStartDate = today

      // If student has an existing active subscription, renew from day after current lastDate
      if (currentSub && currentSub.status !== 'EXPIRED') {
        newStartDate = addDaysToDate(currentSub.lastDate, 1)
      }

      this.createSubscription(paymentData.studentId, newStartDate, this.state.plan.durationDays)
    }

    this.saveState()
    return newPayment
  }

  // --- Leaves ---
  public getLeaves() {
    return this.state.leaves
  }

  public getLeavesByStudentId(studentId: string) {
    return this.state.leaves.filter((l) => l.studentId === studentId)
  }

  public createLeave(leaveData: Omit<LeaveRequest, 'id' | 'branch_id' | 'daysCount' | 'created_at'>) {
    const student = this.getStudentById(leaveData.studentId)
    const daysCount = inclusiveDays(leaveData.startDate, leaveData.endDate)
    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      branch_id: BRANCH_ID,
      daysCount,
      studentName: student?.name || 'Student',
      ...leaveData,
      created_at: new Date().toISOString().split('T')[0],
    }

    this.state.leaves.unshift(newLeave)
    this.saveState()
    return newLeave
  }

  public updateLeaveStatus(id: string, status: LeaveRequest['status'], adminNote?: string) {
    const idx = this.state.leaves.findIndex((l) => l.id === id)
    if (idx !== -1) {
      const prevStatus = this.state.leaves[idx].status
      this.state.leaves[idx] = {
        ...this.state.leaves[idx],
        status,
        adminNote: adminNote !== undefined ? adminNote : this.state.leaves[idx].adminNote,
      }

      // Auto-extend subscription on leave approval
      if (status === 'APPROVED' && prevStatus !== 'APPROVED') {
        const leave = this.state.leaves[idx]
        const sub = this.state.subscriptions
          .filter((s) => s.studentId === leave.studentId)
          .sort((a, b) => b.lastDate.localeCompare(a.lastDate))[0]

        if (sub) {
          const oldLast = new Date(sub.lastDate)
          const newLast = new Date(oldLast)
          newLast.setDate(newLast.getDate() + leave.daysCount)
          const newLastStr = newLast.toISOString().slice(0, 10)

          sub.lastDate = newLastStr
          this.createExtension({
            studentId: leave.studentId,
            subscriptionId: sub.id,
            oldLastDate: sub.lastDate,
            newLastDate: newLastStr,
            daysAdded: leave.daysCount,
            status: 'APPROVED',
            note: `Approved leave: +${leave.daysCount} days`,
          })
        }
      }

      this.saveState()
      return this.state.leaves[idx]
    }
    return null
  }

  // --- Extensions ---
  public getExtensions() {
    return this.state.extensions
  }

  public getExtensionsByStudentId(studentId: string) {
    return this.state.extensions.filter((e) => e.studentId === studentId)
  }

  public createExtension(data: Omit<LeaveExtension, 'id' | 'branch_id' | 'created_at'>) {
    const student = this.getStudentById(data.studentId)
    const newExt: LeaveExtension = {
      id: `ext-${Date.now()}`,
      branch_id: BRANCH_ID,
      studentName: student?.name || 'Student',
      ...data,
      created_at: new Date().toISOString().split('T')[0],
    }

    this.state.extensions.unshift(newExt)

    if (data.status === 'APPROVED' && data.daysAdded > 0) {
      this.extendSubscription(data.subscriptionId, data.daysAdded)
    }

    this.saveState()
    return newExt
  }

  // --- Notifications ---
  public getNotifications(userId?: string) {
    if (userId) {
      return this.state.notifications.filter((n) => n.userId === userId)
    }
    return this.state.notifications
  }

  public markNotificationAsRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id)
    if (notif) {
      notif.isRead = true
      this.saveState()
    }
    return notif
  }

  public markAllNotificationsAsRead(userId?: string) {
    this.state.notifications.forEach((n) => {
      if (!userId || n.userId === userId) {
        n.isRead = true
      }
    })
    this.saveState()
  }
}

export const mockDB = new MockDatabase()
