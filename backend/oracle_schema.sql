-- ============================================================================
-- Hiremat Mess (MessPro) - Oracle Database Enterprise Schema DDL
-- Supported Versions: Oracle Database 19c, 21c, 23c Free / Autonomous Database
-- Character Set: AL32UTF8
-- Timezone: Asia/Kolkata
-- Location: Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004
-- ============================================================================

-- 1. Create Tablespace (Optional for DBA setup)
-- CREATE TABLESPACE messpro_data DATAFILE 'messpro_data01.dbf' SIZE 100M AUTOEXTEND ON NEXT 50M;

-- 2. Clean Existing Objects (if reinstalling)
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE MESS_NOTIFICATION CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE MESS_LEAVE_EXTENSION CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE MESS_LEAVE_REQUEST CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE MESS_PAYMENT CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE MESS_SUBSCRIPTION CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE MESS_STUDENT CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE MESS_USER_ACCOUNT CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE MESS_PLAN CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE MESS_BRANCH CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- ============================================================================
-- TABLE: MESS_BRANCH
-- ============================================================================
CREATE TABLE MESS_BRANCH (
    ID               VARCHAR2(64) PRIMARY KEY,
    NAME             VARCHAR2(120) NOT NULL,
    LOCATION         VARCHAR2(255) NOT NULL,
    CONTACT_PHONE    VARCHAR2(20) DEFAULT '+91 98765 43210',
    CREATED_AT       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: MESS_USER_ACCOUNT
-- ============================================================================
CREATE TABLE MESS_USER_ACCOUNT (
    ID               VARCHAR2(64) PRIMARY KEY,
    BRANCH_ID        VARCHAR2(64) NOT NULL,
    MOBILE           VARCHAR2(15) NOT NULL UNIQUE,
    NAME             VARCHAR2(120) NOT NULL,
    ROLE             VARCHAR2(20) NOT NULL,
    PASSWORD_HASH    VARCHAR2(255) NOT NULL,
    FCM_TOKEN        VARCHAR2(255),
    CREATED_AT       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CHK_USER_ROLE CHECK (ROLE IN ('BRANCH_ADMIN', 'MESS_STAFF', 'STUDENT')),
    CONSTRAINT FK_USER_BRANCH FOREIGN KEY (BRANCH_ID) REFERENCES MESS_BRANCH(ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: MESS_STUDENT
-- ============================================================================
CREATE TABLE MESS_STUDENT (
    ID               VARCHAR2(64) PRIMARY KEY,
    BRANCH_ID        VARCHAR2(64) NOT NULL,
    USER_ID          VARCHAR2(64) NOT NULL UNIQUE,
    NAME             VARCHAR2(120) NOT NULL,
    MOBILE           VARCHAR2(15) NOT NULL UNIQUE,
    ADDRESS          VARCHAR2(255) NOT NULL,
    IS_ACTIVE        NUMBER(1) DEFAULT 1 NOT NULL,
    FCM_DEVICE_TOKEN VARCHAR2(255),
    CREATED_AT       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CHK_STUDENT_ACTIVE CHECK (IS_ACTIVE IN (0, 1)),
    CONSTRAINT FK_STUDENT_BRANCH FOREIGN KEY (BRANCH_ID) REFERENCES MESS_BRANCH(ID) ON DELETE CASCADE,
    CONSTRAINT FK_STUDENT_USER FOREIGN KEY (USER_ID) REFERENCES MESS_USER_ACCOUNT(ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: MESS_PLAN
-- ============================================================================
CREATE TABLE MESS_PLAN (
    ID               VARCHAR2(64) PRIMARY KEY,
    BRANCH_ID        VARCHAR2(64) NOT NULL,
    NAME             VARCHAR2(120) NOT NULL,
    PRICE            NUMBER(10, 2) NOT NULL,
    DURATION_DAYS    NUMBER(5) DEFAULT 30 NOT NULL,
    MEALS_LABEL      VARCHAR2(120) NOT NULL,
    DESCRIPTION      VARCHAR2(500),
    IS_ACTIVE        NUMBER(1) DEFAULT 1 NOT NULL,
    CREATED_AT       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_PLAN_BRANCH FOREIGN KEY (BRANCH_ID) REFERENCES MESS_BRANCH(ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: MESS_SUBSCRIPTION
-- ============================================================================
CREATE TABLE MESS_SUBSCRIPTION (
    ID               VARCHAR2(64) PRIMARY KEY,
    STUDENT_ID       VARCHAR2(64) NOT NULL,
    PLAN_ID          VARCHAR2(64) NOT NULL,
    START_DATE       DATE NOT NULL,
    LAST_INCLUDED_DATE DATE NOT NULL,
    STATUS           VARCHAR2(20) NOT NULL,
    CREATED_AT       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CHK_SUB_STATUS CHECK (STATUS IN ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED')),
    CONSTRAINT FK_SUB_STUDENT FOREIGN KEY (STUDENT_ID) REFERENCES MESS_STUDENT(ID) ON DELETE CASCADE,
    CONSTRAINT FK_SUB_PLAN FOREIGN KEY (PLAN_ID) REFERENCES MESS_PLAN(ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: MESS_PAYMENT (With Razorpay Gateway Integration)
-- ============================================================================
CREATE TABLE MESS_PAYMENT (
    ID                  VARCHAR2(64) PRIMARY KEY,
    STUDENT_ID          VARCHAR2(64) NOT NULL,
    AMOUNT              NUMBER(10, 2) NOT NULL,
    PAYMENT_METHOD      VARCHAR2(20) NOT NULL,
    STATUS              VARCHAR2(20) NOT NULL,
    REFERENCE_NUMBER    VARCHAR2(100) NOT NULL,
    RAZORPAY_ORDER_ID   VARCHAR2(100),
    RAZORPAY_PAYMENT_ID VARCHAR2(100),
    RAZORPAY_SIGNATURE  VARCHAR2(255),
    RECEIPT_NUMBER      VARCHAR2(50) NOT NULL UNIQUE,
    PAYMENT_DATE        DATE NOT NULL,
    RECORDED_BY         VARCHAR2(64),
    NOTES               VARCHAR2(255),
    CREATED_AT          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CHK_PAY_METHOD CHECK (PAYMENT_METHOD IN ('CASH', 'UPI', 'ONLINE', 'OTHER')),
    CONSTRAINT CHK_PAY_STATUS CHECK (STATUS IN ('SUCCESS', 'PENDING', 'FAILED')),
    CONSTRAINT FK_PAY_STUDENT FOREIGN KEY (STUDENT_ID) REFERENCES MESS_STUDENT(ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: MESS_LEAVE_REQUEST
-- ============================================================================
CREATE TABLE MESS_LEAVE_REQUEST (
    ID               VARCHAR2(64) PRIMARY KEY,
    STUDENT_ID       VARCHAR2(64) NOT NULL,
    START_DATE       DATE NOT NULL,
    END_DATE         DATE NOT NULL,
    TOTAL_DAYS       NUMBER(4) NOT NULL,
    REASON           VARCHAR2(255) NOT NULL,
    STATUS           VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    ADMIN_NOTE       VARCHAR2(255),
    CREATED_BY       VARCHAR2(20) DEFAULT 'STUDENT' NOT NULL,
    CREATED_AT       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CHK_LEAVE_STATUS CHECK (STATUS IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT FK_LEAVE_STUDENT FOREIGN KEY (STUDENT_ID) REFERENCES MESS_STUDENT(ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: MESS_LEAVE_EXTENSION
-- ============================================================================
CREATE TABLE MESS_LEAVE_EXTENSION (
    ID               VARCHAR2(64) PRIMARY KEY,
    STUDENT_ID       VARCHAR2(64) NOT NULL,
    OLD_LAST_DATE    DATE NOT NULL,
    NEW_LAST_DATE    DATE NOT NULL,
    DAYS_EXTENDED    NUMBER(4) NOT NULL,
    GRANTED_DATE     DATE NOT NULL,
    NOTE             VARCHAR2(255),
    CREATED_AT       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_EXT_STUDENT FOREIGN KEY (STUDENT_ID) REFERENCES MESS_STUDENT(ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: MESS_NOTIFICATION (With Firebase Cloud Messaging Support)
-- ============================================================================
CREATE TABLE MESS_NOTIFICATION (
    ID               VARCHAR2(64) PRIMARY KEY,
    USER_ID          VARCHAR2(64) NOT NULL,
    TITLE            VARCHAR2(150) NOT NULL,
    MESSAGE          VARCHAR2(500) NOT NULL,
    IS_READ          NUMBER(1) DEFAULT 0 NOT NULL,
    NOTIFICATION_TYPE VARCHAR2(50) DEFAULT 'SYSTEM',
    FCM_STATUS       VARCHAR2(20) DEFAULT 'DELIVERED',
    CREATED_AT       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CHK_NOTIF_READ CHECK (IS_READ IN (0, 1)),
    CONSTRAINT FK_NOTIF_USER FOREIGN KEY (USER_ID) REFERENCES MESS_USER_ACCOUNT(ID) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
CREATE INDEX IDX_SUB_STUDENT_STATUS ON MESS_SUBSCRIPTION(STUDENT_ID, STATUS);
CREATE INDEX IDX_PAY_STUDENT_DATE ON MESS_PAYMENT(STUDENT_ID, PAYMENT_DATE);
CREATE INDEX IDX_PAY_RAZORPAY_ID ON MESS_PAYMENT(RAZORPAY_PAYMENT_ID);
CREATE INDEX IDX_LEAVE_STUDENT_STATUS ON MESS_LEAVE_REQUEST(STUDENT_ID, STATUS);
CREATE INDEX IDX_NOTIF_USER_READ ON MESS_NOTIFICATION(USER_ID, IS_READ);

-- ============================================================================
-- SEED DATA: HIREMAT MESS DAVANGERE
-- ============================================================================
INSERT INTO MESS_BRANCH (ID, NAME, LOCATION, CONTACT_PHONE)
VALUES (
    'branch-main-01',
    'Hiremat Mess Davangere',
    'Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004',
    '+91 98765 43210'
);

INSERT INTO MESS_PLAN (ID, BRANCH_ID, NAME, PRICE, DURATION_DAYS, MEALS_LABEL, DESCRIPTION, IS_ACTIVE)
VALUES (
    'plan-standard-30',
    'branch-main-01',
    'Davangere Pure Veg Monthly Plan',
    3500.00,
    30,
    'Breakfast + Tea + Chapati Meals + Chapati Dinner',
    '100% Pure Veg Karnataka homestyle meals: Mandakki Mirchi/Normal Dosa & Tea, Homestyle Chapati Meals, and Chapati Dinner with Special Holige Feast.',
    1
);

INSERT INTO MESS_USER_ACCOUNT (ID, BRANCH_ID, MOBILE, NAME, ROLE, PASSWORD_HASH)
VALUES ('admin-chandan', 'branch-main-01', '8431413551', 'Chandan Hiremat', 'BRANCH_ADMIN', 'pbkdf2_sha256$Chandu@143');

INSERT INTO MESS_USER_ACCOUNT (ID, BRANCH_ID, MOBILE, NAME, ROLE, PASSWORD_HASH)
VALUES ('admin-punith', 'branch-main-01', '8073113562', 'Punith Hiremat', 'BRANCH_ADMIN', 'pbkdf2_sha256$Punith@143');

INSERT INTO MESS_USER_ACCOUNT (ID, BRANCH_ID, MOBILE, NAME, ROLE, PASSWORD_HASH)
VALUES ('admin-basavaraj', 'branch-main-01', '9353198281', 'Basavaraj H A', 'BRANCH_ADMIN', 'pbkdf2_sha256$Basava@143');

COMMIT;
-- ============================================================================
-- End of Oracle Database Schema DDL
-- ============================================================================

