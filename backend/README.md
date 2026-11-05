# MessPro Backend API (Hiremat Mess)

Django REST framework backend for **MessPro** — built for **Hiremat Mess (ಹಿರೇಮಠ್ ಮೆಸ್)** located at **Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004**.

---

## 📋 Features

- **Authentication & RBAC**: JWT/Session token login with 10-digit mobile number and role-based guards (`BRANCH_ADMIN`, `MESS_STAFF`, `STUDENT`).
- **Student Management**: Admin student provisioning with custom username, auto-generated secure passwords, and deactivation safeguards.
- **Single Standard Plan**: ₹3,500 / 30 calendar days (Unlimited Homestyle Meals + Tea + Sunday Bele Holige feast).
- **Subscriptions & 30-Day Rules**: Auto-computed `last_included_date = start + 29 days`, expiring-soon detection (≤ 3 days left).
- **10-Day Leave Extension Policy**: Merges continuous approved leave ranges (≥ 10 consecutive approved days inside subscription period) with admin extension review drawer.
- **Razorpay Payment Gateway**: Order generation, HMAC SHA256 payment signature verification, and instant subscription renewal.
- **Firebase Push & In-App Notifications**: Transactional alerts for security OTPs, payment confirmations, and leave extensions.
- **Dual Database Support**: Ready-to-go **SQLite** for rapid development and full **Oracle Database** enterprise configuration with complete DDL schema.

---

## 🚀 Quickstart: Running the Backend

### 1. Prerequisites
- Python 3.10+ installed
- Terminal / PowerShell

### 2. Navigate to the Backend Directory
```bash
cd backend
```

### 3. (Recommended) Create & Activate Virtual Environment
**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Apply Database Migrations
```bash
python manage.py migrate
```

### 6. Seed Sample Data
Populates the database with 1 Branch Admin, 1 Mess Staff, the ₹3,500 Plan, and 20 sample students with diverse subscription statuses (Active, Expiring Soon, Expired, and Approved 10+ day leaves for extension demonstration):
```bash
python manage.py seed_data
```

### 7. Run the Development Server
```bash
python manage.py runserver 8000
```
The API is now live at **http://localhost:8000/api/v1/**.

---

## 🔄 Connecting the Frontend to the Real Backend

To switch the React frontend from mock mode to the running Django backend:

1. Open `.env` (or create `.env.local`) in the root directory:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_USE_MOCKS=false
   ```
2. Restart the Vite development server:
   ```bash
   pnpm run dev
   ```

---

## 🗄️ Database Options

### Option A: SQLite (Default Development)
- Zero setup needed.
- Uses local `backend/db.sqlite3`.
- Active by default (`USE_ORACLE=False`).

### Option B: Oracle Cloud (OCI Always Free Autonomous Database - ATP)
To connect to a production **Oracle Cloud Database**:
1. **Create an Always Free Autonomous Database on OCI** (follow the step-by-step guide below).
2. Download the client credentials wallet zip (`Wallet_xxxx.zip`).
3. Extract the contents into a folder (e.g. `backend/wallet/`).
4. Update `.env`:
   ```env
   USE_ORACLE=True
   ORACLE_WALLET_DIR=backend/wallet
   ORACLE_TNS_NAME=hirematmess_high   # Service alias found in backend/wallet/tnsnames.ora
   ORACLE_USER=ADMIN
   ORACLE_PASSWORD=YourChosenPassword123
   ```
5. Apply migrations and seed data:
   ```bash
   python manage.py migrate
   python manage.py seed_data
   ```

---

## ☁️ Step-by-Step Cloud & Service Credentials Setup Guide

### 1. Oracle Cloud Database (OCI Autonomous Transaction Processing)
1. Go to **[cloud.oracle.com](https://cloud.oracle.com)** and sign in (or create an **Always Free** account).
2. In the OCI Console Navigation Menu (top-left ☰), go to **Oracle Database** → **Autonomous Database**.
3. Click **Create Autonomous Database**:
   - **Display Name**: `HirematMessDB`
   - **Database Name**: `hirematmess`
   - **Workload Type**: Select **Transaction Processing (ATP)**.
   - **Deployment Type**: **Shared Infrastructure**.
   - **Always Free**: Toggle **ON** (Free tier gives you 20 GB storage and 1 OCPU forever).
   - **Admin Password**: Choose a strong password (e.g. `HirematMess#2026`) and save it.
   - **Access Type**: Select **Secure access from anywhere** (or allow your IP).
4. Click **Create Autonomous Database**. Wait ~2-3 minutes for the state to turn green (**Available**).
5. Click **DB Connection** button at the top:
   - Under **Wallet Type**, select **Instance Wallet**.
   - Click **Download Wallet**. Enter a wallet password (or leave blank) and download `Wallet_hirematmess.zip`.
6. Extract the zip into your project at `backend/wallet/` (contains `tnsnames.ora`, `cwallet.sso`, etc.).
7. Open `backend/wallet/tnsnames.ora` to see your service names (e.g. `hirematmess_high`, `hirematmess_tp`).
8. In `.env`, set:
   ```env
   USE_ORACLE=True
   ORACLE_WALLET_DIR=backend/wallet
   ORACLE_TNS_NAME=hirematmess_high
   ORACLE_USER=ADMIN
   ORACLE_PASSWORD=HirematMess#2026
   ```

---

### 2. Firebase Cloud Messaging Setup (Push & In-App Alerts)
1. Go to **[console.firebase.google.com](https://console.firebase.google.com)** and sign in with your Google Account.
2. Click **Add project** (or **Create a project**):
   - Enter Project Name: `hiremat-mess-davangere`
   - Disable Google Analytics (optional) and click **Create Project**.
3. In the Project Overview page, click the **Web icon (`</>`)** to register a web app:
   - App nickname: `MessPro Web`
   - Check **Also set up Firebase Hosting** (optional) and click **Register app**.
4. You will see your `firebaseConfig` object containing:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
5. Copy these values into `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=hiremat-mess-davangere.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=hiremat-mess-davangere
   VITE_FIREBASE_STORAGE_BUCKET=hiremat-mess-davangere.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=1:...
   ```
6. **Enable Web Push Certificates (VAPID Key)**:
   - Go to **Project Settings** (gear icon ⚙️) → **Cloud Messaging** tab.
   - Scroll down to **Web configuration** → **Web Push certificates** → click **Generate key pair**.
7. **(Optional) Backend Service Account Key**:
   - In **Project Settings** → **Service accounts** tab.
   - Click **Generate new private key** → saves a JSON file.
   - Put this JSON in `backend/` and set `FIREBASE_SERVICE_ACCOUNT_KEY=backend/serviceAccountKey.json` in `.env`.

---

### 3. Razorpay Payment Gateway Setup
1. Go to **[dashboard.razorpay.com](https://dashboard.razorpay.com)** and sign up / log in.
2. At the top-right header, ensure you are in **Test Mode** (toggle says "Test Mode").
3. In the left navigation menu, go to **Account & Settings** (or **Settings**).
4. Under **API Keys**, click **Generate Key** (or **Regenerate Test Key**):
   - **Key ID**: starts with `rzp_test_...`
   - **Key Secret**: a secure random string (displayed once upon generation).
5. Copy both into your root `.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyHere
   RAZORPAY_KEY_ID=rzp_test_YourKeyHere
   RAZORPAY_KEY_SECRET=YourSecretKeyHere
   ```
6. Done! Test payments will simulate all Indian payment methods:
   - UPI (GPay, PhonePe, Paytm, QR code)
   - Credit/Debit Cards
   - NetBanking (SBI, HDFC, ICICI, etc.)

---

## 🔑 Default Seeded Demo Accounts

All seeded accounts have default password: `password123`

| Role | Name | Mobile (Login ID) | Description |
| :--- | :--- | :--- | :--- |
| **Branch Admin** | Ramesh Sharma | `9876543210` | Full administrative control, student management, payment receipts & leave extension approvals |
| **Mess Staff** | Suresh Patil | `9876543211` | Touch-optimized dining hall verification (search student name/phone to verify meal eligibility) |
| **Student** | Rahul Verma | `9876543201` | Active subscription, 6/10 leave days progress |
| **Student** | Ananya Rao | `9876543202` | Active subscription, eligible for 12-day extension |
| **Student** | Kiran Kumar | `9876543203` | Expiring in 2 days (Renewal demonstration) |
| **Student** | Priya Patil | `9876543204` | Expired subscription |

---

## 📡 API Endpoints Reference

Base URL: `http://localhost:8000/api/v1`

### Authentication
- `POST /auth/login` - Authenticate using 10-digit mobile number and password. Returns JWT token and user profile.
- `GET /auth/me` - Fetch currently authenticated user session.

### Students
- `GET /students` - List students (supports `search`, `status`, `page`, `page_size`).
- `POST /students` - Create new student with custom username and initial password.
- `GET /students/<id>` - Retrieve detailed student record with tabs for subscriptions, payments, leaves, and extensions.
- `POST /students/<id>/deactivate` - Soft-deactivate student account.
- `POST /students/<id>/activate` - Reactivate student account.

### Plans & Subscriptions
- `GET /plans` - List plans (Hiremat Mess Standard Plan ₹3,500).
- `GET /subscriptions` - List subscriptions with filters.
- `GET /subscriptions/student/<student_id>` - Get current active subscription for a student.

### Payments & Razorpay
- `GET /payments` - List payment transactions with filters (`status`, `method`, `student_id`).
- `POST /payments` - Record manual payment (Cash/UPI/Bank Transfer) and automatically activate/renew subscription.
- `POST /payments/razorpay/order` - Generate Razorpay Order ID for ₹3,500 subscription.
- `POST /payments/razorpay/verify` - Verify Razorpay signature (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) and create subscription.

### Leaves & Extensions
- `GET /leaves` - List leave requests (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
- `POST /leaves` - Submit student leave request (requires min 1-day advance notice).
- `PATCH /leaves/<id>/status` - Approve or reject leave request with admin note.
- `GET /extensions` - List approved extensions history.
- `GET /extensions/eligible` - Calculate and list students with ≥ 10 consecutive approved leave days.
- `POST /extensions/review` - Admin approves or rejects extension days with live preview of new end date.

### Notifications & Firebase
- `GET /notifications` - Retrieve in-app notification alerts.
- `POST /notifications/fcm-token` - Register Firebase Cloud Messaging device token.

---

## 🧪 Running Automated Tests

Run the core unit test suite to verify models, eligibility calculation, and authentication:
```bash
python manage.py test core
```
Expected output:
```
Ran 4 tests in 0.10s
OK
```

---

## 🏢 Business Details
- **Mess Name**: Hiremat Mess (ಹಿರೇಮಠ್ ಮೆಸ್)
- **Branch**: Davangere Main Branch
- **Address**: Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004
- **Cuisine**: 100% Pure Vegetarian Authentic Karnataka Homestyle Meals & Breakfast

