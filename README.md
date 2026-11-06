# MessPro • Hiremat Mess (ಹಿರೇಮಠ್ ಮೆಸ್)

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Django REST Framework](https://img.shields.io/badge/Django_REST-5.0-092e20.svg)](https://www.django-rest-framework.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Gateway_Integrated-02042b.svg)](https://razorpay.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FCM_Notifications-ffca28.svg)](https://firebase.google.com/)
[![Oracle DB](https://img.shields.io/badge/Oracle_DB-Dual_Engine_Support-f80000.svg)](https://www.oracle.com/database/)

**MessPro** is a production-ready, mobile-first web application engineered specifically for **Hiremat Mess (ಹಿರೇಮಠ್ ಮೆಸ್)** located at **Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004**. It streamlines student subscriptions, digital payments, automated meal entry verification, and leave-based validity extensions.

---

## 🍽️ About Hiremat Mess Davangere

- **Location**: Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004 (Opposite BIET College & Hostels)
- **Cuisine**: 100% Pure Vegetarian Authentic Karnataka Homestyle Meals & Fresh Breakfast
- **Specialties**:
  - **Daily Breakfast + Tea (7:30 AM – 10:00 AM)**: Davangere Mandakki Mirchi (ಮಂಡಕ್ಕಿ ಮಿರ್ಚಿ), Homestyle Dosa, Crispy Paddu, Vegetable Pulao, Avalakki, Puliyogare, and Hot Kadak Chai.
  - **Lunch (12:30 PM – 2:30 PM)**: Unlimited Hot Whole-Wheat Chapati Meals, Yennegai Badane / Kaalu Palya, Kat Saaru, Sona Masoori Rice, and Majjige.
  - **Dinner (7:30 PM – 9:30 PM)**: Fresh Whole-Wheat Chapatis, Night Seasonal Curry, Dal Tadka, and Steamed Rice.
  - **Special Feast**: Fresh Bele Holige (Obbattu) feast served with pure desi ghee and payasa.
- **Single Standard Plan**: **₹3,500 / 30 calendar days** (Unlimited Homestyle Meals + Breakfast & Tea).

---

## 🔒 Security-First Architecture & Credentials Flow

1. **Admin Account Provisioning**:
   - The Branch Admin provisions student accounts with a custom **Username** (or 10-digit mobile) and an **Initial Password**.
   - Built-in **Strong Password Generator** (e.g. `Mess@2026!7x`) and a **Generated Credentials Card** featuring 1-click **Copy to Clipboard** and **Direct WhatsApp Sharing**.
2. **Student OTP Password Reset & Verification**:
   - To safeguard account data and payments, student password changes in the profile require **2-Factor 6-digit OTP verification** sent to their registered mobile number (`+91 ******<last4>`).
   - Self-service **"Forgot Password? (Reset via OTP)"** modal on the login screen.
   - Built-in rate-limiting, 45-second resend cooldown, and 5-minute expiry.
3. **Razorpay Payment Gateway**:
   - Official Razorpay modal supporting **UPI (Google Pay, PhonePe, Paytm, QR Code)**, **Debit/Credit Cards**, and **NetBanking**.
   - Server-side and client-side **HMAC SHA256** signature verification to prevent tampering with transaction amounts.
4. **Firebase Cloud Messaging (FCM)**:
   - Web Push and in-app notifications for security OTPs, payment confirmations, and leave extensions.
5. **Dual Database Engine (Oracle Database & SQLite)**:
   - **SQLite**: Rapid zero-configuration local development.
   - **Oracle Database (19c / 21c / 23ai)**: Enterprise production mode using `django.db.backends.oracle` and `python-oracledb`. Complete DDL schema included in `backend/oracle_schema.sql`.

---

## 📱 User Portals & Features

### 1. Public Landing Page (`/`)
- Showcase hero with sliding Davangere food photos and interactive badges.
- Daily service timings & weekly rotating menu schedule.
- Single ₹3,500 plan details and direct "Sign In to Portal" flow.
- Interactive Google Maps directions button for students visiting the mess.

### 2. Student Portal (`/student`) — Mobile Bottom Tab Bar
- **Home**: Live subscription card (start date, last date, days left, status), **Renew Plan** button, **10-Day Leave Extension Progress** ("6 of 10 leave days"), and Firebase notification alerts.
- **Payments**: Transaction history, "Pay ₹3,500" with Razorpay Gateway modal, and printable GST tax receipts.
- **Leave**: Leave history, **"Request Leave" modal** with minimum 1-day advance notice validation and automatic day counter.
- **Extensions**: Official validity extension history showing original end date, new end date, and days added.
- **Profile**: Account information, address, and **OTP-verified password change wizard**.

### 3. Branch Admin Portal (`/admin`) — Responsive Sidebar & Mobile Drawer
- **Dashboard**: High-level KPIs (Active students, Expiring in 3 days, Expired, Pending leaves, Extension-eligible count, Monthly revenue in ₹).
- **Students Directory**: Search by name/phone, filter by status, Add Student modal (username & password generator + WhatsApp share), soft-deactivation toggle, and CSV export.
- **Payments Admin**: Manual payment recording (Cash / UPI / Bank Transfer) that auto-activates subscriptions, receipt viewer, and pending reconciliation tab.
- **Leaves Admin**: Pending & Approved tabs, 1-click Approve/Reject with admin reason, and admin-initiated leave form.
- **Extensions Review Drawer**: Displays merged continuous leave dates, eligible days, input for approved extension days, and a real-time preview of the extended end date.

### 4. Mess Staff Portal (`/staff`)
- **Rapid Student Verification**: Large touch targets, instant search by student name or mobile number.
- High-contrast status badges: **ACTIVE**, **EXPIRING SOON**, **ON LEAVE**, or **EXPIRED**.
- Displays last included meal date with zero financial or payment details exposed.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Date-fns, Zod, React Hook Form |
| **Backend** | Python 3.10+, Django 5.0, Django REST Framework, django-cors-headers |
| **Payment Gateway** | Razorpay Checkout SDK & HMAC SHA256 Signature Verification |
| **Push Notifications** | Firebase Cloud Messaging (FCM) & Web Push API |
| **Databases** | Oracle Database 19c/21c/23ai (Production) / SQLite3 (Development) |
| **Testing** | Vitest (Frontend 12/12 unit tests), Django Test Runner (Backend 4/4 tests) |

---

## ⚡ Quickstart Guide

### 1. Clone Repository
```bash
git clone https://github.com/basava2005/hiremata_mess.git
cd hiremata_mess
```

### 2. Frontend Setup
```bash
# Install node packages
pnpm install

# Start Vite development server
pnpm dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Backend Setup (Django REST Framework)
```bash
# Open a new terminal and navigate to backend
cd backend

# Create virtual environment (optional)
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows
source venv/bin/activate       # On Linux/macOS

# Install backend dependencies
pip install -r requirements.txt

# Run migrations & seed demo data
python manage.py migrate
python manage.py seed_data

# Start backend server on port 8000
python manage.py runserver 8000
```

### 4. Switch from Mocks to Real Backend
In `.env` (or `.env.local`):
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_USE_MOCKS=false
```

---

## 🔑 Demo Login Accounts

Quick-login buttons are provided on the login page for instant role testing:

| Role | Mobile Number | Password | Key Notes |
| :--- | :--- | :--- | :--- |
| **Branch Admin** | `9876543210` | `password123` | Full admin rights, approve leaves, manage credentials |
| **Mess Staff** | `9876543211` | `password123` | Dining hall status verifier (tablet/mobile friendly) |
| **Student (Rahul)** | `9876543201` | `password123` | Active subscription, 6/10 leave days progress |
| **Student (Ananya)** | `9876543202` | `password123` | 12 consecutive leave days (Eligible for extension) |

---

## 🧪 Automated Testing

### Frontend Tests (Vitest)
Tests leave eligibility logic, consecutive day merging, overlap clipping, and 30-day date boundary rules:
```bash
pnpm test
```
Result: **`12 passed (12)`**

### Backend Tests (Django)
```bash
python backend/manage.py test core
```
Result: **`Ran 4 tests in 0.10s — OK`**

---

## 📄 License & Ownership
Developed for **Hiremat Mess, Davangere, Karnataka**. All rights reserved.
