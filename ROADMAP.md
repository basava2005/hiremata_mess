# Hiremat Mess Davangere (ಹಿರೇಮಠ್ ಮೆಸ್)
## Engineering Roadmap & Team Task List for Next Upgradations

> **Note on Architecture**: All payment gateway dependencies (Razorpay/GST fees) and carrier SMS dependencies (DLT registration/telecom costs) are permanently excluded. All upcoming features build strictly upon **Direct UPI (0% fees)**, **Bulk WhatsApp Broadcasts**, and the **PostgreSQL + React 19** stack.

---

### Module 1: QR Code Attendance & Meal Check-in (ದೈನಂದಿನ ಊಟದ ಹಾಜರಾತಿ)
* **Goal**: Eliminate proxy dining, prevent unauthorized meal consumption, and track accurate per-meal headcount in real time.
* **Target Audience**: Mess Staff at dining entrance & Students.
* **Priority**: `P0 - High` | **Estimated Effort**: 3–4 Days

#### Deliverables & Tasks
- [ ] **Task 1.1: Student Digital Pass QR Code**
  - Render a secure QR code on `StudentHomePage.tsx` encoding `student_id`, `subscription_id`, and a daily rotating check-hash.
  - Add visual status pill: Green (Active Pass), Yellow (Expiring Soon), Red (Expired).
- [ ] **Task 1.2: Staff Mobile Camera Scanner Mode (`/staff/scan`)**
  - Integrate lightweight browser-based QR scanner (using `html5-qrcode` or `@zxing/library`).
  - Real-time scan feedback:
    - **Green Sound & Card**: *"Check-In Successful! Basavaraj (BIET Rd) - Lunch #42"*.
    - **Red Audio Alert**: *"Pass Expired"* or *"Already Checked In for Lunch at 1:15 PM"*.
- [ ] **Task 1.3: Backend Meal Logs Model (`MealCheckIn`)**
  - Create `MealCheckIn(id, student, meal_type, checkin_time, date)`.
  - Enforce DB unique constraint: `unique_together = ('student', 'meal_type', 'date')` to guarantee 1 entry per meal per student.

---

### Module 2: Kitchen Headcount & Food Wastage Analytics (ಅಡುಗೆ ಮತ್ತು ಪೋಲು ನಿರ್ವಹಣೆ)
* **Goal**: Provide the mess chef and kitchen crew with the exact cooking headcount by 10:30 AM based on approved student leaves, reducing food wastage and ration costs.
* **Target Audience**: Kitchen Staff & Admin Ramesh Sharma.
* **Priority**: `P0 - High` | **Estimated Effort**: 2–3 Days

#### Deliverables & Tasks
- [ ] **Task 2.1: Automated 10:00 AM Meal Forecast**
  - Compute `Expected Lunch Headcount = Total Active Students - Approved Leaves Today`.
  - Compute `Expected Dinner Headcount = Total Active Students - Approved Leaves Tonight`.
- [ ] **Task 2.2: Kitchen Display Board (`/staff/kitchen`)**
  - High-contrast, large-font tablet/phone view for the cook:
    - *"Today's Lunch: Cook for 82 Students + 5 Buffer Chapatis"*.
    - Special Feast Indicator: *"Holige Feast Today: 180 Holiges to prepare"*.
- [ ] **Task 2.3: Daily Leftover & Wastage Logger**
  - Simple 3-field entry form at end of meal:
    - Rice Leftover (in kg), Saaru/Sambar Leftover (in litres), Palya Leftover (in kg).
  - Admin chart showing monthly food savings from leave advance notice.

---

### Module 3: Expense, Ration & Local Vendor Ledger (ದಿನಸಿ & ಖರ್ಚು ಲೆಡ್ಜರ್)
* **Goal**: Consolidate all mess operational expenses alongside Direct UPI student collections to give Admin a clean Net Profit & Loss report.
* **Target Audience**: Admin Ramesh Sharma & Accounting Team.
* **Priority**: `P1 - Medium` | **Estimated Effort**: 3–4 Days

#### Deliverables & Tasks
- [ ] **Task 3.1: Expense Categories & Data Model**
  - Create model `MessExpense(id, branch_id, category, amount, vendor_name, bill_number, payment_mode, date, notes)`.
  - Categories:
    - Vegetables / Mandi (ತರಕಾರಿ ಮಂಡಿ)
    - Groceries / Rice / Dal (ದವಸ ಧಾನ್ಯ)
    - Dairy & Milk / Curd (ಹಾಲು / ಮೊಸರು)
    - Commercial LPG Gas Cylinders (ಗ್ಯಾಸ್ ಸಿಲಿಂಡರ್)
    - Mess Staff Salaries (ಸಿಬ್ಬಂದಿ ವೇತನ)
    - Electricity, Water & Rent (ಬಾಡಿಗೆ & ನಿರ್ವಹಣೆ)
- [ ] **Task 3.2: Monthly P&L Dashboard Widget**
  - `Net Operational Profit = Total Direct UPI Received - Total Expenses`.
  - Breakdown pie chart of expense distribution.
- [ ] **Task 3.3: Local Vendor Directory & Pending Dues**
  - Keep track of running balances with Davangere vegetable and milk suppliers.

---

### Module 4: Printable Student ID Cards & Thermal POS Receipts (ಐಡಿ ಕಾರ್ಡ್ & ರಸೀದಿ ಮುದ್ರಣ)
* **Goal**: Provide physical mess identity badges and fast counter receipt printing on standard 58mm/80mm thermal receipt printers without internet dependence.
* **Target Audience**: Admin Counter & Students.
* **Priority**: `P1 - Medium` | **Estimated Effort**: 2 Days

#### Deliverables & Tasks
- [ ] **Task 4.1: Printable Student Mess ID Badge (PDF/Print)**
  - Clean printable 85mm x 54mm ID badge card:
    - Hiremat Mess Davangere header & logo.
    - Student Name, Registered Mobile, Blood Group, College Name.
    - Dynamic QR code for check-in.
    - Expiry Date & Branch Address.
- [ ] **Task 4.2: 58mm / 80mm Thermal POS Receipt Layout**
  - Compact ESC/POS printable receipt template for counter payment entries:
    ```text
    ================================
        HIREMAT MESS DAVANGERE
       100% Homestyle Pure Veg Mess
        BIET Road, Davangere-577004
           Phone: +91 9876543210
    ================================
    Receipt #: REC-2026-8491
    Date     : 06-Nov-2026 12:45 PM
    Student  : Basavaraj
    Mobile   : +91 9353198281
    Plan     : 30-Day Monthly Pass
    Validity : 06-Nov to 05-Dec-2026
    Amount   : Rs. 3,500.00
    Payment  : Direct UPI (0% Fee)
    Status   : PAID / VERIFIED
    ================================
       Thank You! Have Healthy Meals
    ================================
    ```
  - Standard browser `window.print()` styling with `@media print` rules.

---

### Module 5: Progressive Web App (PWA) & Offline Pass Storage (ಮೊಬೈಲ್ ಪಿಡಬ್ಲ್ಯೂಎ)
* **Goal**: Allow students and staff to install the app on Android / iPhone with 1 tap, with instant loading and offline pass display even during college network drops.
* **Target Audience**: Students & Staff on mobile devices.
* **Priority**: `P1 - Medium` | **Estimated Effort**: 2 Days

#### Deliverables & Tasks
- [ ] **Task 5.1: Web App Manifest & Service Worker**
  - Add `manifest.json` with Hiremat Mess logo icons (`192x192`, `512x512`), theme color `#15803d` (Emerald Green), and display mode `standalone`.
- [ ] **Task 5.2: Offline Student Pass Cache**
  - Cache active subscription status and QR code using IndexedDB / CacheStorage.
  - When student opens app in the mess without cellular data, the active membership badge and QR code render instantly without a loading spinner.
- [ ] **Task 5.3: "Install App" Banner on Mobile**
  - Native browser install prompt triggered for first-time visitors on Android and iOS.

---

### Module 6: Weekly Rotating Menu & Daily Special Announcements (ವಾರದ ಮೆನು & ವಿಶೇಷಗಳು)
* **Goal**: Keep students engaged and informed about daily meal varieties, special vegetables, and weekly Holige feasts.
* **Target Audience**: Students & Kitchen team.
* **Priority**: `P2 - Nice to Have` | **Estimated Effort**: 1–2 Days

#### Deliverables & Tasks
- [ ] **Task 6.1: Weekly Menu Planner (Admin)**
  - Admin weekly planner table:
    - Monday: Mandakki Mirchi / Uppittu, Chapati, Tomato Saaru, Beans Palya.
    - Wednesday: Idli Vada, Chapati, Special Majjige Huli, Capsicum Palya.
    - Weekend: Chapati, Drumstick Sambar, Authentic Bele Holige with Pure Desi Ghee!
- [ ] **Task 6.2: Today's Menu Widget on Student Home**
  - Highlight "Today's Lunch" and "Today's Dinner" dynamically based on current day of the week.
  - One-click WhatsApp share: *"Today's Holige Feast Menu at Hiremat Mess"*.

---

### Sprint Planning & Team Assignment Matrix

| Module | Core Deliverables | Target Roles | Est. Days | Recommended Sprint |
| :--- | :--- | :--- | :---: | :---: |
| **Module 1: QR Check-in** | Student QR generator, Staff camera scanner, CheckIn DB table | Frontend + Backend | 3–4 Days | **Sprint 1 (Next)** |
| **Module 2: Kitchen Headcount** | 10 AM leave calculator, Cook display dashboard, Wastage logger | Fullstack | 2–3 Days | **Sprint 1 (Next)** |
| **Module 3: Expense Ledger** | Mess expense entry, P&L calculator, Vendor balances | Backend + Admin UI | 3–4 Days | **Sprint 2** |
| **Module 4: Printables** | PDF Mess ID Cards, 58mm/80mm Thermal Receipt styling | Frontend | 2 Days | **Sprint 2** |
| **Module 5: Mobile PWA** | Web manifest, Service worker, Offline QR caching | Frontend | 2 Days | **Sprint 3** |
| **Module 6: Menu Planner** | Weekly menu rotation calendar, Today's Special widget | Fullstack | 2 Days | **Sprint 3** |

